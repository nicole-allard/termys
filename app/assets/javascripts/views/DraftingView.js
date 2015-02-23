define([
    'marionette',
    'haml',

    'text!templates/drafting.haml'
], function (
        Marionette,
        Haml,

        draftingTemplate
) {

    var DraftingView = Marionette.ItemView.extend({
        template: Haml(draftingTemplate),

        initialize: function (options) {
            this.app = options.app;

            this.listenTo(this.app.game, 'changeProperty:activePlayer', this.render);
        },

        templateHelpers: function () {
            var players = this.app.game.players,
                currentPlayer = this.app.player;

            return {
                currentPlayer: currentPlayer.toJSON(),
                players: players.toJSON()
            };
        },
    });

    return DraftingView;
});
