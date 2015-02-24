define([
    'backbone',

    'models/common/UniqueModel',
    'models/Structure'
], function (
    Backbone,

    UniqueModel,
    Structure
) {
    var Hex = Backbone.Model.extend({
        // properties: {
        //     northEast: Hex,
        //     east: Hex,
        //     southEast: Hex,
        //     southWest: Hex,
        //     west: Hex,
        //     northWest: Hex,
        //     structure: Structure,
        //
        //     // Keys represent the directions in which a bridge could be built,
        //     // value is either the Hex accross a bridge that has been built,
        //     // or null if no bridge exists.
        //     bridgeDirections : {}
        // },
        //
        defaults: {
            terrain: null,

            // Whether or not there is a key on this hex space, indicating that
            // it is part of an existing town.
            key: false
        },

        initialize: function () {
            this.on('change', this.updateProperties);
            this.updateProperties();
        },

        updateProperties: function () {
            var structureAttrs = this.get('structure');
            if (structureAttrs) {
                if (this.structure)
                    this.structure.set(structureAttrs);
                else
                    this.structure = new UniqueModel(Structure, structureAttrs);

                this.trigger('changeProperty:structure');
                this.unset('structure');
            }

            var bridgeDirectionAttrs = this.get('bridgeDirections');
            if (bridgeDirectionAttrs) {
                // If bridgeDirections was sent from the server, it will be an array
                // of directions in which a bridge has been built. Ensure that the FE
                // object is updated with the now connected hexes on the other sides
                // of these bridges.
                _.extend(this.bridgeDirections, _.chain(bridgeDirectionAttrs)
                    .map(function (direction) {
                        var hex;
                        switch (direction) {
                        case 'north':
                            hex = this.northEast ? this.northEast.northWest : this.northWest.northEast;
                            break;
                        case 'northEast':
                            hex = this.northEast.east;
                            break;
                        case 'southEast':
                            hex = this.southEast.east;
                            break;
                        case 'south':
                            hex = this.southEast ? this.southEast.southWest : this.southWest.southEast;
                            break;
                        case 'southWest':
                            hex = this.southWest.west;
                            break;
                        case 'northWest':
                            hex = this.northWest.west;
                            break;
                        }

                        return [direction, hex];
                    }, this)
                    .object()
                    .value()
                );

                this.unset('bridgeDirections');
            }
        },

        debugPrint: function () {
            console.log((this.northWest ? this.northWest.get('terrain') : '_') + '\t\t\t' + (this.northEast ? this.northEast.get('terrain') : '_') + '\n' +
                (this.west ? this.west.get('terrain') : '_') + '\t' + this.get('terrain') + '\t' + (this.east ? this.east.get('terrain') : '_') + '\n' +
                (this.southWest ? this.southWest.get('terrain') : '_') + '\t\t\t' + (this.southEast ? this.southEast.get('terrain') : '_'));
        },
        // TODO reimplement since bridges span edges, not hexes
        // nextHexContainsMyBridge: function (direction) {
        //     var hex = this[direction];
        //     return this.structure &&
        //         _.contains(this.get('bridgeDirections'), direction) &&
        //         hex && hex.get('terrain') === 'water' &&
        //         hex.structure && hex.structure.get('type') === 'bridge' &&
        //         hex.structure.player === this.structure.player;
        // },

        // /**
        //  * Returns the hex directly adjacent to this one in the given direction.
        //  * If a bridge lies in that direction, returns the hex on the other side
        //  * of the bridge. Otherwise returns the hex.
        //  */
        // getNextHexes: function (direction) {
        //     var next = [this[direction]];
        //     if (this.nextHexContainsMyBridge(direction))
        //         next.push(next[direction]);

        //     return next;
        // },

        // /**
        //  * Returns all directly adjacent hexes, water or land. If a directly
        //  * adjacent hex contains a bridge of the same color as this hex's
        //  * structure, the hex on the far side is also directly adjacent.
        //  */
        // getDirectlyAdjacentHexes: function (includeWater) {
        //     var directlyAdjacentHexes = _.chain(Hex.DIRECTIONS)
        //         .map(_.bind(this.getNextHexes, this))
        //         .flatten()
        //         .compact()
        //         .value();
        // },

        // /**
        //  * Returns the shortest distance from this hex to the given hex,
        //  * as long as there is valid indirect adjacency between the 2
        //  * (ie: using shipping or race abilities like tunneling).
        //  * If there is no valid indirect adjacency, returns Infinity.
        //  */
        // getIndirectDistance: function (target) {
        //     if (target === this)
        //         return 0;

        //     var player = this.structure && this.structure.player ||
        //         target.structure && target.structure.player,

        //         shippingValue = player && player.get('shippingValue') || 0,
        //         landSkippingValue = player && player.get('landSkippingValue') || 0,
        //         directlyAdjacentHexes = this.getDirectlyAdjacentHexes();

        //     if (_.contains(directlyAdjacentHexes), target)
        //         return 1;

        //     if (!shippingValue && !landSkippingValue)
        //         return Infinity;

        //     // Not worth it to implement bi-directional search when the max
        //     // searching distance is 3
        //     var visited = new Set([this]),
        //         // Those with landSkippingValues have no shipping
        //         maxDistance = Math.max(shippingValue, landSkippingValue),
        //         distance, addedVisited, i;

        //     for (distance = 0; distance <= maxDistance; distance++) {
        //         addedVisited = false;
        //         for (i = 0; i < visted.length; i++) {
        //             if (visited[i] === target)
        //                 return distance;

        //             // At this point one of shippingValue or landSkippingValue must be true.
        //             // Just need to check, if we're working with shipping value, that the
        //             // tile is water, before searching its directly adjacent hexes
        //             if (!shippingValue || visted[i].get('terrain') === 'water') {
        //                 _.each(visited[i].getDirectlyAdjacentHexes(), visited.add);
        //                 addedVisited = true;
        //             }
        //         }

        //         if (!addedVisited)
        //             break;
        //     }

        //     return Infinity;
        // },

        getDirectlyAdjacentHexes: function () {
            var directlyAdjacentHexes = _.chain(Hex.DIRECTIONS)
                .map(function (direction) {
                    return this[direction];
                })
                .union(_.values(this.bridgeDirections))
                .compact()
                .value();

            return directlyAdjacentHexes;
        },

        // TODO implement get structure collection

        toDbJSON: function () {
            // TODO return structure, bridge directions (as an array), and key data.
            // Don't bother sending terrains or possible bridge directions that don't
            // have bridges built
        }
    }, {
        DIRECTIONS: [
            'northEast',
            'east',
            'southEast',
            'southWest',
            'west',
            'southEast'
        ],

        TERRAINS: [
            'plains',
            'swamp',
            'lakes',
            'forest',
            'mountains',
            'wasteland',
            'desert'
        ],

        getTerraformCost: function (initialTerrain, finalTerrain) {
            var initialIndex = _.indexOf(Hex.TERRAINS, initialTerrain),
                finalIndex = _.indexOf(Hex.TERRAINS, finalTerrain),
                length = Hex.TERRAINS.length;
            return Math.min((initialIndex - finalIndex).mod(length), (finalIndex - initialIndex).mod(length));
        }
    });

    UniqueModel.addType('Hex', Hex);

    return Hex;
});
