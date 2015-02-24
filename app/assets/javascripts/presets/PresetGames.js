define([
    'underscore'
], function (
    _
) {
    var createBoard = function (structures, game) {
        var playersByColor = _.chain(game.players.models)
            .map(function (player) {
                return [Player.FACTION_COLORS[player.get('faction')], player];
            })
            .object()
            .value();

        var hexes = game.board.hexes;
        _.each(structures, function (structure) {
            var parts = structure.split(','),
                row = parts[0],
                col = parts[1],
                color = parts[2];
            hexes[row][col].set({structure: {
                type: 'dwelling',
                playerId: playersByColor[color].id
            }});
        });
    };

    var createBonuses =  function (bonuses) {
        // Create the db state of bonuses, an object from
        // id to number of coins on the bonus. Since this
        // is an initial state, bonuses have 0 coins on each.
        return _.map(bonuses, function (id) {
            var object = {};
            object[id] = 0;
            return object;
        });
    };

    return {
        rounds: _.map([
            'fire:power',
            'air:workers',
            'earth:coins',
            'water:spades',
            'fire:workers',
            'air:spades'
        ], function (id) {
            var json = {};
            json[id] = 0;
            return json;
        }),
        players: {
            2: {
                factions: [ 'witches', 'nomads' ],
                createBoard: _.partial(createBoard, [
                    '2,6,yellow',
                    '4,7,green',
                    '5,4,yellow',
                    '5,5,yellow',
                    '8,6,yellow'
                ]),
                bonuses: createBonuses([
                    'power:shipping:',
                    'coins:spade:',
                    'coins::',
                    'workers::stronghold,sanctuary',
                    'workers,power::'
                ])
            },
            3: {
                factions: [ 'witches', 'nomads', 'alchemists' ],
                createBoard: _.partial(createBoard, [
                    '4,4,black',
                    '4,10,green',
                    '5,4,yellow',
                    '5,5,green',
                    '6,9,yellow',
                    '6,10,black',
                    '8,6,yellow'
                ]),
                bonuses: createBonuses([
                    'power:shipping:',
                    'coins:spade:',
                    'coins::',
                    'workers::stronghold,sanctuary',
                    'workers,power::',
                    'priests::'
                ])
            },
            4: {
                factions: [ 'witches', 'nomads', 'halflings', 'mermaids' ],
                createBoard: _.partial(createBoard, [
                    '3,2,yelow',
                    '3,6,blue',
                    '4,3,blue',
                    '4,5,brown',
                    '4,7,yellow',
                    '4,10,green',
                    '5,5,green',
                    '5,9,brown',
                    '8,6,yellow'
                ]),
                bonuses: createBonuses([
                    'power:shipping:',
                    'coins:spade:',
                    'coins::',
                    'workers::stronghold,sanctuary',
                    'workers,power::',
                    'priests::',
                    'coins::cult'
                ])
            },
            5: {
                factions: [ 'witches', 'nomads', 'halflings', 'mermaids', 'giants' ],
                createBoard: _.partial(createBoard, [
                    '0,4,yellow',
                    '2,6,green',
                    '3,2,yellow',
                    '3,5,red',
                    '3,10,red',
                    '4,3,blue',
                    '4,5,brown',
                    '4,10,green',
                    '5,9,brown',
                    '7,6,blue',
                    '8,6,yellow'
                ]),
                bonuses: createBonuses([
                    'power:shipping:',
                    'coins:spade:',
                    'coins::',
                    'workers::stronghold,sanctuary',
                    'workers,power::',
                    'priests::',
                    'coins::cult',
                    'coins::dwelling'
                ])
            }
        }
    };
});
