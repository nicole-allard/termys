define([
    'underscore',
    'marionette',

    'text!templates/joining.haml'
], function (
    _,
    Marionette,

    joiningTemplate
) {
    var JoiningView = Marionette.ItemView.extend({
        template: Haml(joiningTemplate),

        events: {
            'click .js-join-game': 'joinGame',
            'click .js-start-game': 'startGame'
        },

        initialize: function (options) {
            this.app = options.app;

            this.listenTo(this.app.game, 'changeProperty:players', this.render);
        },

        templateHelpers: function () {
            var players = this.app.game.players,
                currentPlayer = this.app.player;

            return {
                currentPlayer: currentPlayer.toJSON(),
                currentPlayerIsRegistered: currentPlayer.isRegistered() && players.contains(currentPlayer),
                players: players.toJSON()
            };
        },

        joinGame: function () {
            if (this.app.player.isRegistered())
                return;

            // TODO show spinner, takes awhile for list to update
            var self = this;
            $.ajax({
                type: 'POST',
                url: '/home/join_game',
                data: {
                    player: this.app.player.serialize()
                }
            }).then(function (response) {
                self.app.poller.parse(response);
            }, function (jqXHR, testStatus, errorThrown) {
                alert('Could not join this game: ' + errorThrown);
            });
        },

        startGame: function () {
            if (!this.app.player.isRegistered())
                return;

            if (this.app.game.players.length < 2) {
                alert('Cannot start game with fewer than 2 players');
                return;
            }

            this.app.game.finalizePlayers();
        }
    });

    return JoiningView;
});
