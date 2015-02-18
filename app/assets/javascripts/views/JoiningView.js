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
        template: joiningTemplate,

        event: {
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
                players: players.toJSON(),
                currentPlayer: currentPlayer.toJSON(),
                currentPlayerIsRegistered: currentPlayer.isRegistered() && _.contains(players, currentPlayer)
            };
        },

        joinGame: function () {
            $.ajax({
                type: 'PUT',
                url: '/home/join_game',
                data: {
                    name: this.app.player.get('name')
                }
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
