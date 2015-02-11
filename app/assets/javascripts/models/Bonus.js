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
            },
            coins: 0
        }
    }, {
        TILES: {
            'priests::': {
                income: {
                    priests: 1
                }
            },
            'workers,power::': {
                income: {
                    workers: 1,
                    power: 3
                }
            },
            'coins::': {
                income: {
                    coins: 6
                }
            },
            'power:shipping:': {
                income: {
                    power: 3
                },
                shippingValue: 1
            },
            'coins:spade:': {
                income: {
                    coins: 2
                },
                specialActions: function () {
                    // TODO add a special action to terraform/build - 1 spade to the
                    // active player
                }
            },
            'coins:cult:': {
                income: {
                    coins: 4,
                    specialActions: function () {
                        // TODO add a special action to advance 1 up 1 cult track to
                        // the active player
                    }
                }
            },
            'coins::dwelling': {
                income: {
                    coins: 2
                },
                passBonus: {
                    structureType: 'dwelling',
                    victoryPoints: 1
                }
            },
            'workers::tradingHouse': {
                income: {
                    workers: 1
                },
                passBonus: {
                    structureType: 'tradingHouse',
                    victoryPoints: 2
                }
            },
            'workers::stronghold,sanctuary': {
                income: {
                    workers: 2
                },
                passBonus: {
                    structureType: 'stronghold/sanctuary',
                    victoryPoints: 4
                }
            }
        },

        expand: function (id) {
            return new Bonus(TILES[id]);
        }
    });

    return Bonus;
});
