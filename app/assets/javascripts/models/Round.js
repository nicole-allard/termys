define([
    'backbone'
], function (
    Backbone
) {
    var Round = Backbone.Model.extend({
        defaults: {
            phase: 0,
            actionBonus: {
                condition: null,
                reward: null
            },
            cultScoring: {
                cult: null,
                score: 0,
                reward: null
            }
        }

        // TODO implement switching through phases
    }, {
        PHASES: {
            PRE: 0, // Round has not yet begun
            INCOME: 1, // Round is active and in income phase
            ACTIONS: 2, // Round is active and in actions phase
            CLEANUP: 3, // Round is active and in clean phase
            COMPLETE: 4 // Round is complete
        }
    });

    return Round;
});
