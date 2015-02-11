define([
    'backbone'
], function (
    Backbone
) {
    var Structure = Backbone.Model.extend({
        // properties: {
        //     player: Player
        // },

        defaults: {
            powerLevel: 0,
            type: '',
        }
    }, {
        POWER_LEVELS: {
            'bridges': 0,
            'dwellings': 1,
            'tradingHouses': 2,
            'temples': 2,
            'sanctuaries': 3,
            'strongholds': 3
        }
    });

    return Structure;
});
