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
            // TODO show spinner, takes awhile for list to update
            var self = this;
            $.ajax({
                type: 'POST',
                url: '/home/join_game',
                data: {
                    name: this.app.player.get('name')
                }
            }).then(function (response) {
                self.app.poller.parse(response);
            }, function (jqXHR, testStatus, errorThrown) {
                alert('Could not join this game: ' + errorThrown);
            });
        },

        startGame: function () {
            var game = this.app.game,
                players = game.players,
                randomPlayer = players[Math.floor(Math.random() * players.length)];

            game.set({
                activePlayerId: randomPlayer.id,
                state: 'drafting'
            });

            game.save();
        }
    });

    return JoiningView;
});
