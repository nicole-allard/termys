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
            this.app.game.players.each(function (player) {
                this.listenTo(player, 'changeProperty:bonus', this.render);
            }, this);
        },

        handleSelection: function (bonusView) {
            if (!this.app.player.isActivePlayer())
                return;

            var bonus = bonusView.model;
            bonus.take(this.app.player);
        }
    });

    return BonusSelectionView;
});
