define([
    'underscore',
    'backbone',

    'models/common/UniqueModel'
], function (
    _,
    Backbone,

    UniqueModel
) {
    var TownKey = Backbone.Model.extend({
        defaults: {
            victoryPoints: 0,
            priests: 0,
            cultAdvances: false,
            workers: 0,
            power: 0,
            coins: 0
        }
    }, {
        TILES: {
            9: {
                priests: 1
            },
            8: {
                cultAdvances: true
            },
            7: {
                workers: 2
            },
            6: {
                power: 8
            },
            5: {
                coins: 6
            }
        },

        expand: function (options) {
            return new UniqueModel(TownKey, _.extend({
                victoryPoints: options.numVictoryPoints,
                app: options.app
            }, TownKey.TILES[numVictoryPoints]));
        }
    });

    UniqueModel.addType('TownKey', TownKey);

    return TownKey;
});
