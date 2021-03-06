define([
    'backbone',

    'presets/PresetGames',
    'models/common/UniqueModel',
    'models/Board',
    'models/Player',
    'models/Round',
    'models/Hex',
    'models/Bonus'
], function (
    Backbone,

    PresetGames,
    UniqueModel,
    Board,
    Player,
    Round,
    Hex,
    Bonus
) {
    var Game = Backbone.Model.extend({
        // properties: {
        //     activePlayer: Player,
        //     startingPlayer: Player,
        //     blockingPlayers: Collection(Player)
        //     players: Collection(Player),
        //     rounds: Collection(Round),
        //     board: Board,
        //     cults: { type: CultTrack },
        //     keys: Collection(TownKey),
        //     favorTiles: Collection(FavorTile),
        //     bonuses: Collection(Bonus)
        // },

        defaults: {
            state: '',
            config: ''
        },

        initialize: function (attrs, options) {
            this.app = options.app;

            // Create an empty board for this game
            this.board = new Board();

            // Object is created on the frontend before being populated
            // by the backend
            this.blockingPlayers = new Backbone.Collection();
            this.listenTo(this.blockingPlayers, 'remove', this.play);

            // Create default cults, keys, and favor tiles

            this.on('change', this.deserialize);
            this.deserialize();
        },

        finalizePlayers: function () {
            var turnPositions = _.range(this.players.length).randomize();
            this.players.each(function (player, index) {
                player.set({
                    turnPosition: turnPositions[index]
                });
            });
            this.players.sort();

            this.set({
                // TODO if not using a preset config, choose random rounds and bonuses
                rounds: PresetGames.rounds,
                bonuses: PresetGames.players[this.players.length].bonuses,
                activePlayerId: this.players.first().id,
                startingPlayerId: this.players.first().id,
                state: 'drafting'
            });

            this.save();
        },

        activateNextPlayer: function () {
            this.set({
                activePlayerId: this.activePlayer.nextPlayer().id
            });
        },

        loadPresetDwellings: function () {
            if (!this.app.player.isActivePlayer())
                return;

            PresetGames.players[this.players.length].createBoard(this);
            this.set({
                state: 'bonuses',
                blockingPlayers: this.players.pluck('id'),
                activePlayerId: this.players.first().id
            });

            this.save();
        },

        handleInitialBonuses: function () {
            var playerChoseBonus = function (player) {
                if (this.app.player !== player)
                    return;

                if (!this.blockingPlayers.length) {
                    this.set({
                        state:'active'
                    });
                 
                    this.stopListening(this.blockingPlayers, 'remove', playerChoseBonus);
                }

                this.activateNextPlayer();

                // Wait until the call stack has completed before saving. Once save is called,
                // another player will be the active player and have control. Before that happens,
                // we want to ensure that all the callbacks and handlers have executed based on
                // the event that caused this callback to execute. This way we don't need to
                // ensure that all unrelated callbacks are called before this one.
                _.defer(_.bind(this.save, this));
            };

            this.listenTo(this.blockingPlayers, 'remove', playerChoseBonus);

            // This will indicate to the view that the player should
            // choose a bonus. That will cause the bonuses modal to
            // open and show all the bonuses. The view will handle
            // disallowing clicking by non-active players.
            this.app.player.pass();
        },

        getActiveRound: function () {
            return _.find(this.rounds.models, function (round) {
                return round.get('phase') < Round.PHASES.COMPLETE;
            });
        },

        // TODO call this when active player changes
        /**
         * The gameplay driver that prompts rounds to update their states, prompts
         * blocking players to take their appropriate action, and handles end of game.
         * May have no side effect if called when the active player has completed
         * their action for this phase and there are other players who have not.
         *
         * Called when a round phase changes, when the active player changes, or when
         * a blocking player is removed.
         */
        play: function () {
            if (this.get('state') !== 'active')
                return;

            var activeRound = this.getActiveRound();

            // If there's nothing blocking the phase from completing, then
            // have the active player progress to the next phase.
            if (this.blockingPlayers.length < 1) {
                if (!this.app.player.isActivePlayer())
                    return;

                // TODO check if round is the last round, and is past phase 2,
                // then trigger game end


                // Trigger the next phase of the active round. This change will
                // cause this function to be called again, so no further handling
                // is required in this call.
                activeRound.nextPhase();
                return;
            }

            if (!this.blockingPlayers.contains(this.app.player))
                return;

            switch (activeRound.get('phase')) {
                case Round.PHASES.INCOME:
                    // Players handle income in parallel, kick off income regardless
                    // of the active player.
                    this.app.player.performIncome();
                    break;
                case Round.PHASES.ACTIONS:
                    // Only allow the active player to take actions.
                    if (this.app.player.isActivePlayer())
                        this.app.player.performAction();
                    break;
                case Round.PHASES.CLEANUP:
                    // Players handle cleanup in parallel, kick off cleanup regardless
                    // of the active player.
                    this.app.player.performCleanup();
                    break;
            }
        },

        /**
         * Called upon initialization and whenever attributes change.
         * Creates or updates all the properties that are synced from
         * the backend as attributes but should be stored as properties
         * (basically anything that's a model or collection)
         */
        deserialize: function () {
            if (this.get('players')) {
                this.updateCollection('players', Player, { comparator: 'turnPosition' });
                this.players.sort();
            }

            if (this.get('activePlayerId'))
                this.updatePlayer('activePlayer', 'activePlayerId');

            if (this.get('startingPlayerId'))
                this.updatePlayer('startingPlayer', 'startingPlayerId');

            if (this.get('rounds')) {
                var prevRounds = this.rounds;
                this.updateCollection('rounds', Round);

                if (!prevRounds && this.rounds)
                    this.listenTo(this.rounds, 'change:phase', this.play);
            }

            if (this.get('board'))
                this.updateBoard();

            if (this.get('bonuses')) {
                var hadBonuses = !!this.bonuses;
                this.updateCollection('bonuses', Bonus);

                if (!hadBonuses) {
                    this.listenTo(this.bonuses, 'taken', _.bind(this.bonuses.remove, this.bonuses));
                    this.listenTo(this.bonuses, 'yielded', _.bind(this.bonuses.add, this.bonuses));
                }
            }

            if (this.get('blockingPlayers'))
                this.updateCollection('blockingPlayers', Player);

            // TODO turn the following attrs into properties:
            // cults
            // keys
            // favorTiles
        },

        /**
         * Updates or creates the collection stored as a property with the given name
         * on this Game model. Uses the values stored as attributes to update the
         * models. Afterwards, unsets the attribute leaving only the property.
         *
         * Can be passed either a string and a model, where the string is the name of
         * both the property and the attribute, and the model is the type of Model
         * to create and add to the collection,
         * OR
         * Can be passed 2 separate strings, the name of the attr and the name of the
         * property, and the model.
         */
        updateCollection: function (attrName, propertyName, Model, collectionOptions) {
            // Handle other method signatures
            if (propertyName.prototype instanceof Backbone.Model) {
                collectionOptions = Model;
                Model = propertyName;
                propertyName = attrName;
            }

            var app = this.app,
                value = this.get(attrName),
                newCollection = new Backbone.Collection([], collectionOptions);

            if (typeof value === "string")
                value = JSON.parse(value);

            _.each(value, function (value, key) {
                // If the model represented by attrs already exists in the collection,
                // if will also exist in UniqueModel. Calling new UniqueModel will update
                // the existing model, and calling add will have no effect since Collections
                // remove duplicates.
                // If the model doesn't already exist, it will be created and added to the
                // collection.
                newCollection.add(Model.expand ?
                    Model.expand({ app: app, value: value, key: key }) :
                    new UniqueModel(Model, _.isObject(value) ? value : { id: value }, { app: app }));
            });

            this.unset(attrName, { silent: true });

            var collection = this[propertyName];
            if (!collection || !_.isEqual(collection.models, newCollection.models)) {
                if (collection)
                    collection.reset(newCollection.models);
                else
                    this[propertyName] = newCollection;
                
                this.trigger('changeProperty:' + propertyName);
            }
        },

        /**
         * Updates the property with the given name with the player specified by
         * id in given attribute.
         * Once the property is set, deletes the attribute.
         */
        updatePlayer: function (propertyName, attrName) {
            var newPlayer = this.players.findWhere({ id: this.get(attrName) });
            if (newPlayer !== this[propertyName]) {
                this[propertyName] = newPlayer;
                this.trigger('changeProperty:' + propertyName);
            }

            this.unset(attrName, { silent: true });
        },

        /**
         * Forwards board information to the Board model to handle
         * updating hex data
         */
        updateBoard: function () {
            var newHexes = JSON.parse(this.get('board'));
            if (newHexes !== this.board.get('hexes')) {
                this.board.set({
                    hexes: newHexes
                });
                this.trigger('changeProperty:board');
            }

            this.unset('board', { silent: true });
        },

        toJSON: function () {
            return _.extend({
                board: this.board.toJSON(),
                rounds: this.rounds.toJSON(),
                activePlayer: this.activePlayer.toJSON(),
                players: this.players.toJSON()
            }, this.attributes);
        },

        /**
         * Returns the minimal json representation of the game that can
         * be save to the db and parsed by the frontend models
         */
        serialize: function () {
            return _.extend({
                players: this.players.invoke('serialize'),
                activePlayerId: this.activePlayer.id,
                startingPlayerId: this.startingPlayer ? this.startingPlayer.id : null,
                rounds: this.rounds ? JSON.stringify(this.rounds.invoke('serialize')) : null,
                board: JSON.stringify(this.board.serialize()),
                bonuses: this.bonuses ? JSON.stringify(_.extend.apply(_, this.bonuses.invoke('serialize'))) : null,
                blockingPlayers: this.blockingPlayers.length ? JSON.stringify(this.blockingPlayers.pluck('id')) : null
            }, _.pick(this.attributes, _.keys(this.defaults)));
        },

        save: function () {
            var self = this;
            return $.ajax({
                type: 'POST',
                url: '/home/update_game',
                data: {
                    game: this.serialize()
                }
            }).then(function (response) {
                self.set({ dirty: false });
                self.app.poller.parse(response);
            }, function (jqXHR, testStatus, errorThrown) {
                alert('Could not save your game: ' + errorThrown);
            });
        }

        // TODO implement:
        // get all structure collections
        //  used by area scoring and the end, and determining if a town is founded when
        //  new criteria are added
    });

    return Game;
});
