define([
    'backbone'
], function (
    Backbone
) {
    var Hex = Backbone.Model.extend({
        // properties: {
        //     north: Hex,
        //     northEast: Hex,
        //     southEast: Hex,
        //     south: Hex,
        //     southWest: Hex,
        //     northWest: Hex,
        //     structure: Structure
        // },
        //
        defaults: {
            terrain: null,
            bridgeDirections : [],
            key: false
        },

        debugPrint: function () {
            console.log('\t' + (this.north ? this.north.get('terrain') : '_') + '\n' +
                (this.northWest ? this.northWest.get('terrain') : '_') + '\t\t\t' + (this.northEast ? this.northEast.get('terrain') : '_') + '\n' +
                '\t' + this.get('terrain') + '\n' +
                (this.southWest ? this.southWest.get('terrain') : '_') + '\t\t\t' + (this.southEast ? this.southEast.get('terrain') : '_') + '\n' +
                '\t' + (this.south ? this.south.get('terrain') : '_'));
        },

        nextHexContainsMyBridge: function (direction) {
            var hex = this[direction];
            return this.structure &&
                _.contains(this.get('bridgeDirections'), direction) &&
                hex && hex.get('terrain') === 'water' &&
                hex.structure && hex.structure.get('type') === 'bridge' &&
                hex.structure.player === this.structure.player;
        },

        /**
         * Returns the hex directly adjacent to this one in the given direction.
         * If a bridge lies in that direction, returns the hex on the other side
         * of the bridge. Otherwise returns the hex.
         */
        getNextHexes: function (direction) {
            var next = [this[direction]];
            if (this.nextHexContainsMyBridge(direction))
                next.push(next[direction]);

            return next;
        },

        /**
         * Returns all directly adjacent hexes, water or land. If a directly
         * adjacent hex contains a bridge of the same color as this hex's
         * structure, the hex on the far side is also directly adjacent.
         */
        getDirectlyAdjacentHexes: function (includeWater) {
            var directlyAdjacentHexes = _.chain(Hex.DIRECTIONS)
                .map(_.bind(this.getNextHexes, this))
                .flatten()
                .compact()
                .value();
        },

        /**
         * Returns the shortest distance from this hex to the given hex,
         * as long as there is valid indirect adjacency between the 2
         * (ie: using shipping or race abilities like tunneling).
         * If there is no valid indirect adjacency, returns Infinity.
         */
        getIndirectDistance: function (target) {
            if (target === this)
                return 0;

            var player = this.structure && this.structure.player ||
                target.structure && target.structure.player,

                shippingValue = player && player.get('shippingValue') || 0,
                landSkippingValue = player && player.get('landSkippingValue') || 0,
                directlyAdjacentHexes = this.getDirectlyAdjacentHexes();

            if (_.contains(directlyAdjacentHexes), target)
                return 1;

            if (!shippingValue && !landSkippingValue)
                return Infinity;

            // Not worth it to implement bi-directional search when the max
            // searching distance is 3
            var visited = new Set([this]),
                // Those with landSkippingValues have no shipping
                maxDistance = Math.max(shippingValue, landSkippingValue),
                distance, addedVisited, i;

            for (distance = 0; distance <= maxDistance; distance++) {
                addedVisited = false;
                for (i = 0; i < visted.length; i++) {
                    if (visited[i] === target)
                        return distance;

                    // At this point one of shippingValue or landSkippingValue must be true.
                    // Just need to check, if we're working with shipping value, that the
                    // tile is water, before searching its directly adjacent hexes
                    if (!shippingValue || visted[i].get('terrain') === 'water') {
                        _.each(visited[i].getDirectlyAdjacentHexes(), visited.add);
                        addedVisited = true;
                    }
                }

                if (!addedVisited)
                    break;
            }

            return Infinity;
        }



        // hex - get structure collection
        // hex - is hex directly adjacent?
        // hex - is hex indirectly adjacent?
    }, {
        DIRECTIONS: [
            'north',
            'northEast',
            'southEast',
            'south',
            'southWest',
            'southEast'
        ]
    });

    return Hex;
});
