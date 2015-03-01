define([
    'marionette',
    'haml',

    'models/Bonus',
    'models/Player',

    'text!templates/bonuses.haml',
    'text!templates/bonus.haml'
], function (
    Marionette,
    Haml,

    Bonus,
    Player,

    bonusesTemplate,
    bonusTemplate
) {
    var BonusesView = Marionette.CompositeView.extend({
        template: Haml(bonusesTemplate),
        itemView: Marionette.ItemView.extend({
            template: Haml(bonusTemplate)
        }),
        itemViewContainer: '.js-game-bonuses'
    });

    return BonusesView;
});
