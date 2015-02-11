define([
    'backbone'
], function (
    Backbone
) {
    var Bonus = Backbone.Model.extend({
        defaults: {
            income: {
                power: 0,
                coins: 0,
                workers: 0,
                priests: 0
            },
            shippingValue: 0,
            specialActions: null,
            passBonus: {
                structureType: '',
                victoryPoints: 0
            }
        }
    });

    return Bonus;
});
