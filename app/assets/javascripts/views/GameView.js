define([
    'marionette',
    'haml',

    'views/BoardView',
    'views/ModalView',
    'views/BonusesView',
    'views/BonusSelectionView',
    'views/ActionSelectionView',

    'text!templates/game.haml'
], function (
    Marionette,
    Haml,

    BoardView,
    ModalView,
    BonusesView,
    BonusSelectionView,
    ActionSelectionView,

    gameTemplate
) {
    'use strict';

    var GameView = Marionette.Layout.extend({
        template: Haml(gameTemplate),
        regions: {
            boardRegion: '.js-board',
            bonusesRegion: '.js-bonuses'
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
                this.listenTo(player, 'choose:bonus', this.showBonuses);
                this.listenTo(player, 'choose:action', this.showActions);
            }, this);
        },

        onShow: function () {
            this.boardRegion.show(new BoardView({
                model: this.model,
                app: this.app
            }));

            this.bonusesRegion.show(new BonusesView({
                collection: this.model.bonuses,
                app: this.app
            }));
        },

        showBonuses: function () {
            // Open a modal, fill it with the bonuses view.
            // listen to a pick event, close the modal
            var bonusesView = new BonusSelectionView({
                model: this.model,
                collection: this.model.bonuses,
                app: this.app
            });

            var modal = new ModalView({
                id: 'bonuses',
                contentView: bonusesView,
                app: this.app
            });

            modal.openModal();
        },

        showActions: function () {
            var actionsView = new ActionSelectionView({
                model: this.model,
                collection: this.app.actions,
                app: this.app
            });

            var modal = new ModalView({
                id: 'actions',
                contentView: actionsView,
                app: this.app
            });

            modal.openModal();
        }
    });

    return GameView;
});
