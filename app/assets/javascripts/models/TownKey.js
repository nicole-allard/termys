define([
    'underscore',
    'backbone'
], function (
    _,
    Backbone
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

        expand: function (numVictoryPoints) {
            return new TownKey(_.extend({
                victoryPoints: numVictoryPoints
            }, TownKey.TILES[numVictoryPoints]));
        }
    });

    return TownKey;
});
