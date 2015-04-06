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
        }
    });

    return BonusSelectionView;
});
