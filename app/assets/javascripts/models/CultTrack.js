define([
    'backbone',

    'models/CultTrackPosition'
], function (
    Backbone,

    CultTrackPosition
) {
    var CultTrack = Backbone.Model.extend({
        // properties: {
        //     track: [CultTrackPosition],
        //     advanceActions: [
        //         {
        //             numPositions: 3,
        //             player: null
        //         },
        //         ...
        //     ]
        // },

        defaults: {
            cultName: ''
        }
    });

    return CultTrack;
});
