define([
    'underscore',
    'backbone',

    'models/common/UniqueModel',
    'models/Hex'
], function (
    _,
    Backbone,

    UniqueModel,
    Hex
) {
    'use strict';

    var Board = Backbone.Model.extend({
        // properties: {
        //     hexes: [[Hex]]
        // }

        initialize: function () {
            this.hexes = Board.createEmptyBoard();

            this.on('change', this.updateProperties);
            this.updateProperties();
        },

        updateProperties: function () {
            var hexesData = this.get('hexes');
            if (hexesData) {
                // Update the attributes of each hex as per the data synced
                // from the db (structures, bridges, keys)
                _.each(this.hexes, function (row, rowIndex) {
                    var rowData = hexesData[rowIndex];
                    _.each(row, function (hex, colIndex) {
                        hex.set(rowData[colIndex]);
                    });
                });

                this.unset('hexes');
            }
        },

        toDbJSON: function () {
            return this.hexes.map(function (row) {
                return row.map(function (hex) {
                    return hex.toDbJSON();
                });
            });
        }
    }, {
        BOARD_TERRAINS: [
            'p,m,f,l,d,w,p,s,w,f,l,w,s',
            'd,r,r,p,s,r,r,d,s,r,r,d',
            ',r,s,r,m,r,f,r,f,r,m,r,r',
            'f,l,d,r,r,w,l,r,w,r,w,p',
            's,p,w,l,w,p,m,d,r,r,f,s,l',
            'm,f,r,r,d,f,r,r,r,p,m,p',
            ',r,r,m,r,w,r,f,r,d,s,l,d',
            'd,l,p,r,r,r,l,s,r,m,p,m',
            'w,s,m,l,w,f,d,p,m,r,l,f,w'
        ],

        BRIDGE_DIRECTIONS: [
            ',,s,,,,s,,,,s,,',
            'se s,,,sw,se,,,sw,se,,,sw s',
            ',,nw n ne,,sw s se,,nw n ne,,sw,,sw nw n ne,,',
            'n,,ne,,,nw,ne,,sw ne se,,,n',
            ',,,s,n,,,ne s,,,nw,,',
            's,se s,,,sw,se,,,,,,',
            ',,,nw n ne,,se s,,nw n,,sw,,,',
            'n,n,,,,,nw,ne,,sw,,',
            ',,,,,n,,,ne,,,,'
        ],

        TERRAIN_MAPPING: {
            p: 'plains',
            s: 'swamp',
            l: 'lakes',
            f: 'forest',
            m: 'mountains',
            w: 'wasteland',
            d: 'desert',
            r: 'river'
        },

        DIRECTION_MAPPING: {
            n: 'north',
            ne: 'northeast',
            e: 'east',
            se: 'southeast',
            s: 'south',
            sw: 'southwest',
            w: 'west',
            nw: 'northwest'
        },

        createEmptyBoard: function () {
            // Create the Hex models in a 2D array with the standard terrain and bridge
            // layouts.
            var emptyBoard = _.map(Board.BOARD_TERRAINS, function (row, rowIndex) {
                return _.map(row.split(','), function (terrain, colIndex) {
                    if (!terrain)
                        return null;

                    return new UniqueModel(Hex, {
                        terrain: Board.TERRAIN_MAPPING[terrain]
                    });
                });
            });

            // Set up adjacency between Hexes and the allowed bridge directions
            _.each(emptyBoard, function (row, rowIndex) {
                var rowBridgeDirections = Board.BRIDGE_DIRECTIONS[rowIndex].split(',');
                _.each(row, function (hex, colIndex) {
                    if (!hex)
                        return;

                    hex.east = row[colIndex + 1];
                    hex.west = row[colIndex - 1];

                    var colOffset = (rowIndex % 2),
                        eastIndex = colIndex + colOffset,
                        westIndex = colIndex + colOffset - 1,
                        northRow = emptyBoard[rowIndex - 1],
                        southRow = emptyBoard[rowIndex + 1];

                    if (northRow) {
                        hex.northEast = northRow[eastIndex];
                        hex.northWest = northRow[westIndex];
                    }

                    if (southRow) {
                        hex.southEast = southRow[eastIndex];
                        hex.southWest = southRow[westIndex];
                    }

                    var hexBridgeDirections = _.chain(rowBridgeDirections[colIndex].split(' '))
                        .compact()
                        .map(function (direction) {
                            return [Board.DIRECTION_MAPPING[direction], null];
                        })
                        .object()
                        .value();

                    hex.bridgeDirections = hexBridgeDirections;
                });
            });

            return emptyBoard;
        }
    });

    return Board;
});
