define([
    'underscore'
], function (
    _
) {

    var boardTerrains = [
        'p,m,f,l,d,w,p,s,w,f,l,w,s',
        'd,r,r,p,s,r,r,d,s,r,r,d',
        ',r,s,r,m,r,f,r,f,r,m,r,r',
        'f,l,d,r,r,w,l,r,w,r,w,p',
        's,p,w,l,w,p,m,d,r,r,f,s,l',
        'm,f,r,r,d,f,r,r,r,p,m,p',
        ',r,r,m,r,w,r,f,r,d,s,l,d',
        'd,l,p,r,r,r,l,s,r,m,p,m',
        'w,s,m,l,w,f,d,p,m,r,l,f,w'
    ];

    var bridgeDirections = [
        ',,s,,,,s,,,,s,,',
        'se s,,,sw,se,,,sw,se,,,sw s',
        ',,nw n ne,,sw s se,,nw n ne,,sw,,sw nw n ne,,',
        'n,,ne,,,nw,ne,,sw ne se,,,n',
        ',,,s,n,,,ne s,,,nw,,',
        's,se s,,,sw,se,,,,,,',
        ',,,nw n ne,,se s,,nw n,,sw,,,',
        'n,n,,,,,nw,ne,,sw,,',
        ',,,,,n,,,ne,,,,'
    ];

    var emptyBoard = _.map(boardTerrains, function (row, rowIndex) {
        var rowBridgeDirections = bridgeDirections[rowIndex].split(',');
        return _.map(row.split(','), function (terrain, colIndex) {
            var hexBridgeDirections = _.chain(rowBridgeDirections[colIndex].split(' '))
                .map(function (direction) {
                    return directions[direction];
                })
                .compact()
                .value();

            return terrain ? {
                terrain: terrains[terrain],
                bridgeDirections: hexBridgeDirections
            } : {};
        });
    });

    var terrains = {
        p: 'plains',
        s: 'swamp',
        l: 'lakes',
        f: 'forest',
        m: 'mountains',
        w: 'wasteland',
        d: 'desert',
        r: 'river'
    };

    var directions = {
        n: 'north',
        ne: 'northeast',
        e: 'east',
        se: 'southeast',
        s: 'south',
        sw: 'southwest',
        w: 'west',
        nw: 'northwest'
    };

    return {
        players: {
            2: {
                game: {
                }
            }
        }
    };
});
