define([
    'jquery',
    'underscore',
    'backbone',

    'models/common/UniqueModel',
    'models/Game',
    'models/Player'
], function (
    $,
    _,
    Backbone,

    UniqueModel,
    Game,
    Player
) {
    var Poller = Backbone.Model.extend({
        initialize: function (attrs, options) {
            this.app = options.app;
        },

        start: function () {
            $.ajax({
                type: 'GET',
                url: '/home/get_or_create_game',
                data: {
                    player: this.app.player.serialize()
                }
            }).then(_.bind(function (response) {
                this.parse(response);
                this.interval = window.setInterval(_.bind(this.pull, this), 5000);
            }, this));

            return this;
        },

        stop: function () {
            window.clearInterval(this.interval);
            this.interval = null;

            return this;
        },

        pull: function () {
            $.ajax({
                type: 'GET',
                url: '/home/get_latest'
            }).then(_.bind(this.parse, this));
        },

        parse: function (response, forceSync) {
            response = Poller.camelizeObject(response);
            response.game.players = response.players;

            if (!this.app.player.isRegistered())
                this.registerPlayer(response);

            if (!this.app.game) {
                // This user is joining a game. Create all the necessary FE models.
                this.app.setGame(new Game(response.game, {
                    app: this.app
                }));
            } else if (this.app.game.get('dirty') && this.app.player.canMakeChanges() && !forceSync) {
                // This player has made some valid changes to the game.
                // Only overwrite the changes if forceSync (ex: when active player resets their turn)
                return;
            } else {
                // Sync existing game and players with backend
                this.app.game.set(response.game);
                this.app.game.set({ dirty: false });
            }
        },

        registerPlayer: function (response) {
            // This user's player has never been synced with the backend.
            // Since all frontend syncing is done via IDs, make sure to
            // properly set the player ID.
            var playerName = this.app.player.get('name'),
                playerDetails = _.findWhere(response.players, { name: playerName });

            if (playerDetails) {
                // Found the player details from the server for the app's
                // player. Update the details, including (hopefully) an id
                this.app.player.set(playerDetails);
                UniqueModel.set(Player, this.app.player);
            } else if (this.app.game && !_.contains(['joining', 'config'], this.app.game.get('state'))) {
                throw 'Game does not contain a player named ' + this.app.player.get('name');
            }
        }
    }, {
        camelizeObject: function (obj) {
            if (!$.isPlainObject(obj))
                return obj;

            _.each(obj, function (value, key) {
                var camelizedKey = key.toCamelCase(),
                    camelizedValue;

                if ($.isArray(value))
                    camelizedValue = _.map(value, Poller.camelizeObject);
                else
                    camelizedValue = Poller.camelizeObject(obj[key]);

                obj[camelizedKey] =  camelizedValue;
                if (key !== camelizedKey)
                    delete obj[key];
            });

            return obj;
        }
    });

    return Poller;
});
