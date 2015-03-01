define([
    'marionette',
    'haml',

    'views/BoardView',
    'views/ModalView',
    'views/BonusesView',

    'text!templates/game.haml'
], function (
    Marionette,
    Haml,

    BoardView,
    ModalView,
    BonusesView,

    gameTemplate
) {
    'use strict';

    var GameView = Marionette.Layout.extend({
        template: Haml(gameTemplate),
        regions: {
            boardRegion: '.js-board'
        },

        events: {
            'click .js-show-bonuses': 'showBonuses'
        },

        initialize: function (options) {
            this.app = options.app;
            this.bindHandlers();
        },

        bindHandlers: function () {
            this.model.players.each(function (player) {
                this.listenTo(player, 'choose:bonus', _.bind(this.showBonuses, this, player));
            }, this);
        },

        onShow: function () {
            this.boardRegion.show(new BoardView({
                model: this.model.board,
                app: this.app
            }));
        },

        showBonuses: function (player) {
            // Open a modal, fill it with the bonuses view.
            // listen to a pick event, close the modal
            var bonusesView = new BonusesView({
                collection: this.model.bonuses
            });
            var modal = new ModalView({
                id: 'bonuses',
                contentView: bonusesView
            });

            modal.openModal();
        }
    });

    return GameView;
});
