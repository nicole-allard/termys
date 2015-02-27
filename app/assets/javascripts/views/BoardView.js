define([
    'marionette',
    'haml',

    'text!templates/board.haml'
], function (
    Marionette,
    Haml,

    boardTemplate
) {
    'use strict';

    var BoardView = Marionette.ItemView.extend({
        template: Haml(boardTemplate),

        initialize: function (options) {
            this.app = options.app;
        }
    });

    return BoardView;
});
