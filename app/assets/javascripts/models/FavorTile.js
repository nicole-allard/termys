define([
    'jquery',
    'underscore',
    'backbone'
], function (
    $,
    _,
    Backbone
) {
    var FavorTile = Backbone.extend({
        defaults: {
            cultName: '',
            cultAdvances: 0,
            income: {
                power: 0,
                workers: 0,
                coins: 0
            },
            actionBonus: {
                condition: null,
                reward: null
            },
            passBonus: {
                structureType: '',
                victoryPoints: 0
            },
            immediateAction: $.noop,
            specialAction: $.noop
        }
    });

    return FavorTile;
}, {
    TILES: {
        fire: {
            1: {
                income: {
                    coins: 3
                }
            },
            2: {
                immediateAction: function () {
                    // TODO search through all structure collections belonging to
                    // this player and find any that are not yet towns that have 6
                    // structure points, and turn them into towns.
                }
            }
        },
        water: {
            1: {
                actionBonus: {
                    // TODO
                }
            },
            2: {
                immediateAction: function () {
                    // TODO add a special action to the player allowing advancing up
                    // 1 cult track by 1 spot
                }
            }
        },
        air: {
            1: {
                passBonus: function () {
                    // TODO find all trading houses on the board belonging to this player
                    // and award victory points: 2/3/3/4 Victory points for 1/2/3/4
                }
            },
            2: {
                income: {
                    power: 4
                }
            }
        },
        earth: {
            1: {
                actionBonus: {
                    // TODO
                }
            },
            2: {
                income: {
                    power: 1,
                    workers: 1
                }
            }
        }
    },

    expand: function (cultName, cultAdvances) {
        return new FavorTile(_.extend({
            cultName: cultName,
            cultAdvances: cultAdvances
        }, TILES[cultName][cultAdvances]));
    }
});
