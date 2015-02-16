define([
    'backbone',

    'models/common/UniqueModel',
    'models/Player',
    'models/Round',
    'models/Hex'
], function (
    Backbone,

    UniqueModel,
    Player,
    Round,
    Hex
) {
    var Game = Backbone.Model.extend({
        // properties: {
        //     activePlayer: Player,
        //     blockingPlayers: Collection(Player),
        //     players: Collection(Player),
        //     rounds: Collection(Round),
        //     board: [[Hex]],
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

            this.on('change', this.updateProperties);
            this.updateProperties();
        },

        /**
         * Called upon initialization and whenever attributes change.
         * Creates or updates all the properties that are synced from
         * the backend as attributes but should be stored as properties
         * (basically anything that's a model or collection)
         */
        updateProperties: function () {
            // Collection is created on the frontend before being populated
            this.blockingPlayers = new Backbone.Collection();

            if (this.get('players'))
                this.updateCollection('players', Player);

            if (this.get('activePlayerId'))
                this.updateActivePlayer();

            if (this.get('rounds'))
                this.updateCollection('rounds', Round);

            if (this.get('board'))
                this.updateBoard();

            // TODO turn the following attrs into properties:
            // cults
            // keys
            // favorTiles
            // bonuses
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
        updateCollection: function (attrName, propertyName, Model) {
            if (propertyName.prototype instanceof Backbone.Model) {
                Model = propertyName;
                propertyName = attrName;
            }

            var collection = this[propertyName];
            if (!collection)
                collection = this[propertyName] = new Backbone.Collection();

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
            this.activePlayer = this.players.find(this.get('activePlayerId'));

            this.unset('activePlayerId');
            this.trigger('changeProperty:activePlayer');
        },

        updateBoard: function () {
            if (!this.board)
                this.board = this.initializeBoard(this.get('board'));
            else {
                _.each(this.get('board'), function (row) {
                    _.each(row, function (hex) {
                        // Since the board has already been initialized, the unique hex
                        // models should all exist already. This should simply be updating
                        // their state. Something is very wrong if get returns null.
                        UniqueModel.get(Hex, hex.id).set(hex);
                    });
                });
            }

            this.unset('board');
            this.trigger('changeProperty:board');
        },

        initializeBoard: function (board) {


            // Replace objects in board array with Hex models
            _.each(board, function (row, rowIndex) {
                _.each(row, function (hex, colIndex) {
                    board[rowIndex][colIndex] = new UniqueModel(Hex, hex);
                });
            });

            // Set up adjacency between Hexes
            _.each(board, function (row, rowIndex) {
                _.each(row, function (hex, colIndex) {
                    if (rowIndex > 1)
                        hex.north = board[rowIndex - 2][colIndex];

                    if (rowIndex + 2 < board.length)
                        hex.south = board[rowIndex + 2][colIndex];

                    var colOffset = (rowIndex % 2),
                        eastIndex = colIndex + colOffset,
                        westIndex = colIndex + colOffset - 1,
                        northIndex = rowIndex - 1,
                        southIndex = rowIndex + 1;

                    if (northIndex >= 0) {
                        if (eastIndex < row.length)
                            hex.northEast = board[northIndex][eastIndex];

                        if (westIndex >= 0)
                            hex.northWest = board[northIndex][westIndex];
                    }

                    if (southIndex < board.length) {
                        if (eastIndex < row.length)
                            hex.southEast = board[southIndex][eastIndex];

                        if (westIndex >= 0)
                            hex.southWest = board[southIndex][westIndex];
                    }
                });
            });

            return board;
        },

        /**
         * Returns the minimal json representation of the game that can
         * be save to the db and parsed by the frontend models
         */
        toDbJSON: function () {
            var json = _.clone(_.pick(this.attributes, _.keys(this.defaults)));
            json.players = _.invoke(this.players, 'toDbJSON');
            json.activePlayerId = this.activePlayer.id;
            json.rounds = _.invoke(this.rounds, 'toDbJSON');
            json.board = _.map(this.board, function (row) {
                return _.map(row, function (hex) {
                    return hex.toDbJSON();
                });
            });
        },

        save: function () {
            // TODO send the result of toDbJSON to backend.
        }

        // TODO implement:
        // get all structure collections
        //  used by area scoring and the end, and determining if a town is founded when
        //  new criteria are added
    });

    return Game;
});
