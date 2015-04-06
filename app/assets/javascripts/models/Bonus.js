define([
    'jquery',
    'backbone',

    'models/common/UniqueModel'
], function (
    $,
    Backbone,

    UniqueModel
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
            specialAction: $.noop,
            passBonusName: '',
            coins: 0,
            id: null
        },

        addCoin: function () {
            this.set({ coins: this.get('coins') + 1 });
        },

        /**
         * Called when the given player takes this bonus. Updates the
         * player's state, possibly updating income, coins, bonuses,
         * etc.
         */
        take: function (player) {
            var newIncome = _.clone(player.get('income'));
            _.each(this.get('income'), function (value, resource) {
                newIncome[resource] += value;
            });

            // Add bonus income, bonus shipping value, and any coins that
            // were on this bonus tile.
            player.set({
                income: newIncome,
                shippingValue: player.get('shippingValue') + this.get('shippingValue'),
                coins: player.get('coins') + this.get('coins'),
                bonus: this.serialize()
            });

            // Create a function bound to the given player and execute
            // the function when the player passes.
            // Remove coins taken by the player.
            this.set({
                passBonus: _.partial(Bonus.passBonuses[this.get('passBonusName')], player),
                coins: 0
            });

            this.listenTo(player, 'pass', this.get('passBonus'));

            this.trigger('taken', this, player);

            // No need to handle the special action, the BonusView will call the special
            // action should the player click the button to perform it
        },

        /**
         * Called when the player returns this bonus. Updates the
         * player's state, remove all the additions applied in take.
         */
        yield: function (player) {
            var newIncome = _.clone(player.get('income'));
            _.each(this.get('income'), function (value, resource) {
                newIncome[resource] = Math.max(0, newIncome[resource] - value);
            });

            // Remove bonus income and bonus shipping value.
            player.set({
                income: newIncome,
                shippingValue: Math.max(0, player.get('shippingValue') - this.get('shippingValue')),
                bonus: null
            });

            // Remove pass bonus handler when the player passes and delete
            // the bonus handler bound to the given player.
            this.stopListening(player, 'pass', this.get('passBonus'));
            this.unset('passBonus');

            this.trigger('yielded', this, player);
        },

        serialize: function () {
            var json = {};
            json[this.id] = this.get('coins');
            return json;
        }
    }, {
        passBonuses: {
            dwellings: function (player) {
                // TODO look for all the dwellings on the board belonging to this player
                // and give the player 1 point for each dwelling
            },

            tradingHouses: function (player) {
                // TODO look for all the tradingHouses on the board belonging to this player
                // and give the player 2 points for each tradingHouse
            },

            strongholdAndSanctuary: function (player) {
                // TODO look for any strongholds or sanctuaries on the board belonging to
                // this player and give the player 4 points for each
            }
        },

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
                specialAction: function () {
                    // TODO add 1 spade to the player's spades and then begin the
                    // terraform and build action
                }
            },
            'coins:cult:': {
                income: {
                    coins: 4,
                },
                specialAction: function () {
                    // TODO prompt user to pick a cult track on which to advance
                    // 1 position
                }
            },
            'coins::dwelling': {
                income: {
                    coins: 2
                },
                passBonusName: 'dwellings'
            },
            'workers::tradingHouse': {
                income: {
                    workers: 1
                },
                passBonusName: 'tradingHouses'
            },
            'workers::stronghold,sanctuary': {
                income: {
                    workers: 2
                },
                passBonusName: 'strongholdAndSanctuary'
            }
        },

        expand: function (options) {
            var id = options.key,
                coins = options.value;

            return new UniqueModel(Bonus, _.extend({
                app: options.app,
                coins: coins,
                id: id
            }, Bonus.TILES[id]));
        }
    });

    UniqueModel.addType('Bonus', Bonus);

    return Bonus;
});
