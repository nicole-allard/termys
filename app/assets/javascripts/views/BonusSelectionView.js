define([
    'haml',
    'views/BonusesView',
    'text!templates/bonuses.haml'
], function (
    Haml,
    BonusesView,
    bonusesTemplate
) {
    var BonusSelectionView = BonusesView.extend({
        template: Haml(bonusesTemplate),
        templateHelpers: function () {
            return {
                players: this.app.game.players.toJSON()
            };
        },

        initialize: function (options) {
            BonusesView.prototype.initialize.call(this, options);
            this.allowSelection = true;
            this.listenTo(this, 'itemview:select:bonus', this.handleSelection);
        },

        handleSelection: function (bonusView) {
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
            }

            this.app.game.activateNextPlayer();
            this.app.game.save();
        }
    });

    return BonusSelectionView;
});
