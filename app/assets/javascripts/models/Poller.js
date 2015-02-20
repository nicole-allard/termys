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
                url: 'home/get_or_create_game',
                data: {
                    playerName: this.app.player.get('name')
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

            if (!this.app.player.isRegistered()) {
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
                }
            }

            if (!this.app.game) {
                // This user is joining a game. Create all the necessary FE models.
                this.app.setGame(new Game(response.game, {
                    app: this.app
                }));
            } else if (this.app.game.activePlayer === this.app.player) {
                // This active player is this user's player. Don't want to overwrite
                // the game or the active player state. Only update other players.
                _.each(response.game.players, function (playerDetails) {
                    if (forceSync || playerDetails.id !== this.app.player.id) {
                        // Update the existing, or create a new, player as per the
                        // synced player details
                        new UniqueModel(Player, playerDetails);
                    }
                }, this);

                if (forceSync) {
                    this.app.game.set(response.game);
                }
                // TODO check if forceSync, (active player may be restarting his turn)
            } else {
                // Update the existing game with
                this.app.game.set(response.game);
            }
        }
    }, {
        camelizeObject: function (obj) {
            if (!$.isPlainObject(obj))
                return obj;

            _.each(obj, function (value, key) {
                var camelizedKey = key.toCamelCase();
                obj[camelizedKey] = Poller.camelizeObject(obj[key]);

                if (key !== camelizedKey)
                    delete obj[key];
            });

            return obj;
        }
    });

    return Poller;
});
