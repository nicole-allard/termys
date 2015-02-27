define([
    'marionette',
    'haml',

    'views/BoardView',
    'text!templates/game.haml'
], function (
    Marionette,
    Haml,

    BoardView,
    gameTemplate
) {
    'use strict';

    var GameView = Marionette.Layout.extend({
        template: Haml(gameTemplate),
        regions: {
            boardRegion: '.js-board'
        },

        initialize: function (options) {
            this.app = options.app;
        },

        onShow: function () {
            this.boardRegion.show(new BoardView({
                model: this.model.board,
                app: this.app
            }));
        }
    });

    return GameView;
});
