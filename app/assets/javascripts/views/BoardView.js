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
        templateHelpers: function () {
            return {
                reverseRounds: this.model.rounds.toJSON().reverse()
            };
        },

        initialize: function (options) {
            this.app = options.app;
        }
    });

    return BoardView;
});
