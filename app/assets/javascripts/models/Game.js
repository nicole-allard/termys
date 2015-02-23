define([
    'backbone',

    'models/common/UniqueModel',
    'models/Board',
    'models/Player',
    'models/Round',
    'models/Hex'
], function (
    Backbone,

    UniqueModel,
    Board,
    Player,
    Round,
    Hex
) {
    var Game = Backbone.Model.extend({
        // properties: {
        //     activePlayer: Player,
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
            state: ''
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

            this.on('change', this.updateProperties);
            this.updateProperties();
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
                activePlayerId: this.players.first().id,
                state: 'drafting'
            });

            this.save();
        },

        /**
         * Called upon initialization and whenever attributes change.
         * Creates or updates all the properties that are synced from
         * the backend as attributes but should be stored as properties
         * (basically anything that's a model or collection)
         */
        updateProperties: function () {
            if (this.get('players'))
                this.updateCollection('players', Player, { comparator: 'turnPosition' });

            if (this.get('activePlayerId'))
                this.updateActivePlayer();

            if (this.get('rounds'))
                this.updateCollection('rounds', Round);

            if (this.get('board'))
                this.updateBoard();

            if (this.get('bonuses'))
                this.updateCollection('bonuses', Bonus);

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

            var app = this.app;
            _.each(this.get(attrName), function (attrs) {
                // If the model represented by attrs already exists in the collection,
                // if will also exist in UniqueModel. Calling new UniqueModel will update
                // the existing model, and calling add will have no effect since Collections
                // remove duplicates.
                // If the model doesn't already exist, it will be created and added to the
                // collection.
                collection.add(new UniqueModel(Model, attrs, { app: app }));
            });

            this.unset(attrName);
            this.trigger('changeProperty:' + propertyName);
        },

        /**
         * Updates the activePlayer with the player specified by id.
         * Once the activePlayer is set, deletes the attribute.
         */
        updateActivePlayer: function () {
            var newActivePlayer = this.players.findWhere({ id: this.get('activePlayerId') });
            if (newActivePlayer !== this.activePlayer) {
                this.activePlayer = newActivePlayer;
                this.trigger('changeProperty:activePlayer');
            }

            this.unset('activePlayerId');
        },

        /**
         * Forwards board information to the Board model to handle
         * updating hex data
         */
        updateBoard: function () {
            this.board.set({
                hexes: this.get('board')
            });
            this.unset('board');
            this.trigger('changeProperty:board');
        },

        /**
         * Returns the minimal json representation of the game that can
         * be save to the db and parsed by the frontend models
         */
        toDbJSON: function () {
            return _.extend({
                players: this.players.invoke('toDbJSON'),
                activePlayerId: this.activePlayer.id,
                rounds: this.rounds ? JSON.stringify(this.rounds.invoke('toDbJSON')) : null,
                board: JSON.stringify(this.board.toDbJSON())
            }, _.pick(this.attributes, _.keys(this.defaults)));
        },

        save: function () {
            var self = this;
            return $.ajax({
                type: 'POST',
                url: '/home/update_game',
                data: {
                    game: this.toDbJSON()
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
