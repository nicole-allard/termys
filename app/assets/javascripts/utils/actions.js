define([
], function () {
    // Maybe each action should also store the hexes/cult tracks where
    // they can be taken?

    // Actions are added as extensions on a player, so the context for
    // each of these is the player model.
    return {
        pass: function () {
            // show the modal to choose a bonus
            // one a bonus is chosen, return the player's bonus
            // the the game's list (if any) and assign the chosen
            // bonus to the player, and take any coins on that bonus
            // those who call this will listen for the change:bonus
            // event and deal with that as needed
            this.trigger('choose:bonus');
        },

        terraformAndBuild: function (additionalSpades) {
            // TODO apply spades to player
            // TODO add buttons to land spaces
        },

        advanceOnCultTrack: function (numSpaces, cultName) {
        },

        buildBridge: function () {
            // TODO add buttons to water spaces
        },

        collectIncome: function (income) {

        },


    };
});
