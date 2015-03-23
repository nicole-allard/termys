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
        //     blockingPlayers: { blocked: Collection(Player)}
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
            this.blockingPlayers = {
                phase: new Backbone.Collection(),
                action: new Backbone.Collection()
            };

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
            this.app.game.set({
                activePlayerId: this.activePlayer.nextPlayer().id
            });
        },

        loadPresetDwellings: function () {
            if (!this.app.player.isActivePlayer())
                return;

            PresetGames.players[this.players.length].createBoard(this);
            this.set({
                state: 'bonuses',
                activePlayerId: this.players.first().id
            });

            this.save();
        },

        handleInitialBonuses: function () {
            // This will indicate to the view that the player should
            // choose a bonus. That will cause the bonuses modal to
            // open and show all the bonuses. The view will handle
            // disallowing clicking by non-active players.
            this.app.player.pass();
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

            if (this.get('rounds'))
                this.updateCollection('rounds', Round);

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

            // TODO turn the following attrs into properties:
            // cults
            // keys
            // favorTiles
            // blockingPlayers
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

            var collection = this[propertyName];
            if (!collection)
                collection = this[propertyName] = new Backbone.Collection([], collectionOptions);
            else
                collection.reset([], collectionOptions);

            var app = this.app,
                value = this.get(attrName);

            if (typeof value === "string")
                value = JSON.parse(value);

            _.each(value, function (value, key) {
                // If the model represented by attrs already exists in the collection,
                // if will also exist in UniqueModel. Calling new UniqueModel will update
                // the existing model, and calling add will have no effect since Collections
                // remove duplicates.
                // If the model doesn't already exist, it will be created and added to the
                // collection.
                collection.add(Model.expand ?
                    Model.expand({ app: app, value: value, key: key }) :
                    new UniqueModel(Model, value, { app: app }));
            });

            this.unset(attrName, { silent: true });
            this.trigger('changeProperty:' + propertyName);
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
            this.board.set({
                hexes: JSON.parse(this.get('board'))
            });
            this.unset('board', { silent: true });
            this.trigger('changeProperty:board');
        },

        toJSON: function () {
            return _.extend({
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
                bonuses: this.bonuses ? JSON.stringify(_.extend.apply(_, this.bonuses.invoke('serialize'))) : null
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
