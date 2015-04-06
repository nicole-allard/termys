define([
    'marionette',
    'haml',

    'views/BoardView',
    'views/ModalView',
    'views/BonusesView',
    'views/BonusSelectionView',

    'text!templates/game.haml'
], function (
    Marionette,
    Haml,

    BoardView,
    ModalView,
    BonusesView,
    BonusSelectionView,

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
                this.listenTo(player, 'choose:bonus', _.bind(this.showBonuses, this, player));
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

        showBonuses: function (player) {
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

            this.listenTo(bonusesView, 'itemview:select:bonus', function (bonusView) {
                if (!this.app.player.isActivePlayer())
                    return;

                var bonus = bonusView.model;
                bonus.take(this.app.player);

                if (this.app.game.players.every(function (player) {
                    return !!player.bonus;
                })) {
                    this.app.game.set({
                        state: 'active'
                    });
                    modal.closeModal();
                }

                this.app.game.activateNextPlayer();
                this.app.game.save();
            });


            modal.openModal();
        }
    });

    return GameView;
});
