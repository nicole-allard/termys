define([
    'backbone'
], function (
    Backbone
) {
    var CultTrackPosition = Backbone.Model.extend({
        // properties: {
        //     players: [Player]
        // },

        defaults: {
            position: -1,
            maxPlayers: -1,
            power: 0
        }
    });

    return CultTrackPosition;
});
