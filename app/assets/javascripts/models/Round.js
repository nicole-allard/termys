define([
    'jquery',
    'underscore',
    'backbone',

    'models/Hex'
], function (
    $,
    _,
    Backbone,

    Hex
) {
    var addIncome = function (attr, num, player) {
        var income = _.clone(player.get('income'));
        income[attr] += num;
        player.set({ income: income });
    };

    var structureBonus = function (structureNames, victoryPoints, player, newStructure) {
        structureNames = structureNames.split(',');
        if (_.contains(structureNames, newStructure.get('type')))
            player.addVictoryPoints(victoryPoints);
    };

    var Round = Backbone.Model.extend({
        defaults: {
            phase: 0,
            actionBonus: {
                eventName: '',
                handler: $.noop
            },
            cultScoring: {
                cult: null,
                score: 0,
                handler: $.noop
            }
        },

        phaseHandlers: {},

        initialize: function () {
            var App = require('app');
            this.app = App.get();

            this.phaseHandlers[Round.PHASES.INCOME] = this.beginIncome;
            this.phaseHandlers[Round.PHASES.ACTIONS] = this.beginActions;
            this.phaseHandlers[Round.PHASES.CLEANUP] = this.beginCleanup;
        },

        nextPhase: function () {
            var newPhase = this.get('phase') + 1;
            this.set({ phase: newPhase });
            if (this.phaseHandlers[newPhase])
                this.phaseHandlers[newPhase].call(this);
        },

        beginIncome: function () {
            // Mark all players as blocking the income phase from completing
            var game = this.app.game;
            game.blockingPlayers.reset(_.pluck(game.players, 'id'));
        },

        beginActions: function () {
            var actionBonus = this.get('actionBonus');
            _.each(this.app.game.players.each, _.bind(function (player) {
                this.listenTo(player, actionBonus.eventName, actionBonus.handler);
            }, this));
        },

        beginCleanup: function () {
            // TODO unbind action listeners
        }

        // TODO implement toDbJSON
    }, {
        PHASES: {
            PRE: 0, // Round has not yet begun
            INCOME: 1, // Round is active and in income phase
            ACTIONS: 2, // Round is active and in actions phase
            CLEANUP: 3, // Round is active and in clean phase
            COMPLETE: 4 // Round is complete
        },

        // TODO handle cult scoring
        TILES: {
            water: {
                priests: {
                    eventName: 'build:structure',
                    handler: _.partial(structureBonus, 'dwelling', 2)
                },
                spades: {
                    eventName: 'build:structure',
                    handler: _.partial(structureBonus, 'tradingHouse', 3)
                }
            },
            fire: {
                power: {
                    eventName: 'build:structure',
                    handler: _.partial(structureBonus, 'dwelling', 2)
                },
                workers: {
                    eventName: 'build:structure',
                    handler: _.partial(structureBonus, 'stronghold,sanctuary', 5)
                }
            },
            air: {
                spades: {
                    eventName: 'build:structure',
                    handler: _.partial(structureBonus, 'tradingHouse', 3)
                },
                workers: {
                    eventName: 'build:structure',
                    handler: _.partial(structureBonus, 'stronghold,sanctuary', 5)
                }
            },
            earth: {
                coins: {
                    eventName: 'terraform',
                    handler: function (player, initialTerrain, finalTerrain) {
                        player.addVictoryPoints(2 * Hex.getTerraformCost(initialTerrain, finalTerrain));
                    }
                },
                spades: {
                    eventName: 'founded:town',
                    handler: function (player) {
                        player.addVictoryPoints(5);
                    }
                }
            }
        },

        expand: function () {

        }
    });

    return Round;
});
