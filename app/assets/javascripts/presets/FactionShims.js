define([
    'jquery',
    'underscore'
], function (
    $,
    _
) {

    var initializeFaction = function (options) {
        // Object merge the given resources with the defined defaults.
        // This is so entire objects aren't overwritten.
        // ex: The given resources.supply will only contain values that
        // have changed from the defaults, pull in non-changed values
        // before setting the resources on this player.
        _.each(options.resources, function (value, resource) {
            if ($.isPlainObject(value))
                _.defaults(value, this.defaults[resource]);
        }, this);
        this.set(options.resources);

        // TODO handle options.cults

        // Add/overwrite functions for special handling this faction
        _.each(options.functions, function (handler, name) {
            this[name] = handler;
        });
    };

    return {
        fakirs: _.partial(initializeFaction, {
            resources: {
                coins: 15,
                power: {
                    1: 7,
                    2: 5,
                    3: 0
                },
                workers: 3,
                landSkippingValue: 1,
            },
            cults: {
                air: 1,
                fire: 1
            },
            // TODO handle shorter spade cost track
            functions: {
                increaseShipping: function () {
                    alret('Fakirs have no shipping');
                },

                updateStructures: function (newStructure) {
                    // Can use prototype's update structure,
                    // and then:
                    // TODO figure out if land skipping value
                    // was used, and if so, add 1 priest to the
                    // cost and 4 victory points
                }
            }
        }),
        nomads: _.partial(initializeFaction, {
            resources: {
                coins: 15,
                power: {
                    1: 5,
                    2: 7,
                    3: 0
                },
                workers: 2
            },
            cults: {
                fire: 1,
                earth: 1
            }
        }),
        chaos: _.partial(initializeFaction, {
            resources: {
                coins: 15,
                power: {
                    1: 5,
                    2: 7,
                    3: 0
                },
                workers: 4,
                income: {
                    workers: 2
                }
            },
            cults: {
                fire: 2
            }
        }),
        giants: _.partial(initializeFaction, {
            resources: {
                coins: 15,
                power: {
                    1: 5,
                    2: 7,
                    3: 0
                },
                workers: 3
            },
            cults: {
                fire: 1,
                air: 1
            }
        }),
        swarmlings: _.partial(initializeFaction, {
            resources: {
                coins: 20,
                power: {
                    1: 3,
                    2: 9,
                    3: 0
                },
                workers: 8,
                income: {
                    workers: 2
                }
            },
            cults: {
                earth: 1,
                water: 1,
                fire: 1,
                air: 1
            }
        }),
        mermaids: _.partial(initializeFaction, {
            resources: {
                coins: 15,
                power: {
                    1: 3,
                    2: 9,
                    3: 0
                },
                workers: 3
            },
            cults: {
                water: 2
            }
        }),
        dwarves: _.partial(initializeFaction, {
            resources: {
                coins: 15,
                power: {
                    1: 5,
                    2: 7,
                    3: 0
                },
                workers: 3
            },
            cults: {
                earth: 2
            }
        }),
        engineers: _.partial(initializeFaction, {
            resources: {
                coins: 10,
                power: {
                    1: 3,
                    2: 9,
                    3: 0
                },
                workers: 2,
                income: {
                    workers: 0
                }
            }
        }),
        halflings: _.partial(initializeFaction, {
            resources: {
                coins: 15,
                power: {
                    1: 3,
                    2: 9,
                    3: 0
                },
                workers: 3
            },
            cults: {
                earth: 1,
                air: 1
            }
        }),
        cultists: _.partial(initializeFaction, {
            resources: {
                coins: 15,
                power: {
                    1: 5,
                    2: 7,
                    3: 0
                },
                workers: 3
            },
            cults: {
                earth: 1,
                fire: 1
            }
        }),
        alchemists: _.partial(initializeFaction, {
            resources: {
                coins: 15,
                power: {
                    1: 5,
                    2: 7,
                    3: 0
                },
                workers: 3
            },
            cults: {
                water: 1,
                fire: 1
            }
        }),
        darklings: _.partial(initializeFaction, {
            resources: {
                coins: 15,
                power: {
                    1: 5,
                    2: 7,
                    3: 0
                },
                workers: 1,
                priests: 2
            },
            cults: {
                water: 1,
                earth: 1
            }
        }),
        auren: _.partial(initializeFaction, {
            resources: {
                coins: 15,
                power: {
                    1: 5,
                    2: 7,
                    3: 0
                },
                workers: 3
            },
            cults: {
                water: 1,
                air: 1
            }
        }),
        witches: _.partial(initializeFaction, {
            resources: {
                coins: 15,
                power: {
                    1: 5,
                    2: 7,
                    3: 0
                },
                workers: 3
            },
            cults: {
                air: 2
            }
        })
    };
});
