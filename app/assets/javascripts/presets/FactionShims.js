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
                supply: {
                    dwellings: 6
                },
                landSkippingValue: 1,
                income: {
                    workers: 3
                }
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
        nomads: $.noop,
        chaos: $.noop,
        giants: $.noop,
        swarmlings: $.noop,
        mermaids: $.noop,
        dwarves: $.noop,
        engineers: $.noop,
        halflings: $.noop,
        cultists: $.noop,
        alchemists: $.noop,
        darklings: $.noop,
        auren: $.noop,
        witches: $.noop
        // TODO add other faction shims
    };
});
