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
                eventName: '',
                handler: $.noop
            },
            passBonus: $.noop,
            immediateAction: $.noop,
            specialAction: $.noop
        },

        take: function (player) {
            var newIncome = _.clone(player.get('income'));
            _.each(this.get('income'), function (value, resource) {
                newIncome[resource] += value;
            });

            player.set({
                income: newIncome
            });

            this.get('immediateAction').call(this, player);

            var actionBonus = this.get('actionBonus');
            this.listenTo(player, actionBonus.eventName, _.partial(actionBonus.handler, player));

            // No need to handle the special action, the FavorTileView will call the special
            // action should the player click the button to perform it
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
                immediateAction: function (player) {
                    // TODO search through all structure collections belonging to
                    // this player and find any that are not yet towns that have 6
                    // structure points, and turn them into towns.
                }
            }
        },
        water: {
            1: {
                actionBonus: {
                    eventName: 'upgrade:structure',
                    handler: function (player, newStructure) {
                        if (newStructure.get('type') === 'tradingHouse')
                            player.addVictoryPoints(3);
                    }
                }
            },
            2: {
                specialAction: function (player) {
                    // TODO prompt user to pick a cult track on which to advance
                    // 1 position
                }
            }
        },
        air: {
            1: {
                passBonus: function (player) {
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
                    eventName: 'build:structure',
                    handler: function (player, newStructure) {
                        if (newStructure.get('type') === 'dwelling')
                            player.addVictoryPoints(2);
                    }
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
