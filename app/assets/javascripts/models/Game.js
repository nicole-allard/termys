define([
    'backbone'
], function (
    Backbone
) {
    var Game = Backbone.Model.extend({
        // properties: {
        //     activePlayer: Player,
        //     players: [Player],
        //     rounds: [Round],
        //     board: [[Hex]],
        //     cults: { type: CultTrack },
        //     keys: [ TownKey ],
        //     favorTiles: [ FavorTile ],
        //     bonuses: [ Bonus ]
        // },

        defaults: {
            state: ''
        },

        initialize: function (attrs) {
            this.initializeHexes(attrs.board);
        },

        initializeHexes: function (board) {
            // Replace objects in board array with Hex models
            _.each(board, function (row, rowIndex) {
                _.each(row, function (hex, colIndex) {
                    board[rowIndex][colIndex] = new Hex(hex);
                });
            });

            // Set up adjacency between Hexes
            _.each(board, function (row, rowIndex) {
                _.each(row, function (hex, colIndex) {
                    if (rowIndex > 1)
                        hex.north = board[rowIndex - 2][colIndex];

                    if (rowIndex + 2 < board.length)
                        hex.south = board[rowIndex + 2][colIndex];

                    var colOffset = (rowIndex % 2),
                        eastIndex = colIndex + colOffset,
                        westIndex = colIndex + colOffset - 1,
                        northIndex = rowIndex - 1,
                        southIndex = rowIndex + 1;

                    if (northIndex >= 0) {
                        if (eastIndex < row.length)
                            hex.northEast = board[northIndex][eastIndex];

                        if (westIndex >= 0)
                            hex.northWest = board[northIndex][westIndex];
                    }

                    if (southIndex < board.length) {
                        if (eastIndex < row.length)
                            hex.southEast = board[southIndex][eastIndex];

                        if (westIndex >= 0)
                            hex.southWest = board[southIndex][westIndex];
                    }
                });
            });
        },

        // TODO implement:
        // get all structure collections
        //  used by area scoring and the end, and determining if a town is founded when
        //  new criteria are added
    });

    return Game;
});
