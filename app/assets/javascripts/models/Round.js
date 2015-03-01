define([
    'jquery',
    'underscore',
    'backbone',

    'models/common/UniqueModel',
    'models/Hex'
], function (
    $,
    _,
    Backbone,

    UniqueModel,
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

        initialize: function (options) {
            this.app = options.app;

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
            this.resetPhaseBlocking();
        },

        beginActions: function () {
            this.resetPhaseBlocking();

            var actionBonus = this.get('actionBonus');
            _.each(this.app.game.players.each, _.bind(function (player) {
                this.listenTo(player, actionBonus.eventName, actionBonus.handler);
            }, this));
        },

        beginCleanup: function () {
            this.resetPhaseBlocking();
            // TODO unbind action listeners
        },

        resetPhaseBlocking: function () {
            // Mark all players as blocking the income phase from completing
            var game = this.app.game;
            game.blockingPlayers.phase.reset(_.pluck(game.players, 'id'));
        },

        serialize: function () {
            var json = {};
            json[this.id] = this.get('phase');
            return json;
        }
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
                    actionBonus: {
                        eventName: 'build:structure',
                        handler: _.partial(structureBonus, 'dwelling', 2)
                    }
                },
                spades: {
                    actionBonus: {
                        eventName: 'build:structure',
                        handler: _.partial(structureBonus, 'tradingHouse', 3)
                    }
                }
            },
            fire: {
                power: {
                    actionBonus: {
                        eventName: 'build:structure',
                        handler: _.partial(structureBonus, 'dwelling', 2)
                    }
                },
                workers: {
                    actionBonus: {
                        eventName: 'build:structure',
                        handler: _.partial(structureBonus, 'stronghold,sanctuary', 5)
                    }
                }
            },
            air: {
                spades: {
                    actionBonus: {
                        eventName: 'build:structure',
                        handler: _.partial(structureBonus, 'tradingHouse', 3)
                    }
                },
                workers: {
                    actionBonus: {
                        eventName: 'build:structure',
                        handler: _.partial(structureBonus, 'stronghold,sanctuary', 5)
                    }
                }
            },
            earth: {
                coins: {
                    actionBonus: {
                        eventName: 'terraform',
                        handler: function (player, initialTerrain, finalTerrain) {
                            player.addVictoryPoints(2 * Hex.getTerraformCost(initialTerrain, finalTerrain));
                        }
                    }
                },
                spades: {
                    actionBonus: {
                        eventName: 'founded:town',
                        handler: function (player) {
                            player.addVictoryPoints(5);
                        }
                    }
                }
            }
        },

        /**
         * Expects an object of the form
         * { round id: phase }
         * where round id is one of the keys in the
         * TILES object.
         */
        expand: function (options) {
            var id = _.keys(options.value)[0],
                phase = _.values(options.value)[0],
                parts = id.split(':'),
                cult = parts[0],
                bonus = parts[1];

            return new UniqueModel(Round, _.extend({
                app: options.app,
                phase: phase,
                id: id
            }, Round.TILES[cult][bonus]));
        }
    });

    UniqueModel.addType('Round', Round);

    return Round;
});
