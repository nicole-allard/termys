define([
], function () {
    // Maybe each action should also store the hexes/cult tracks where
    // they can be taken?

    // Actions are added as extensions on a player, so the context for
    // each of these is the player model.
    return {
        // TODO test
        performIncome: function () {
            var supply = this.get('supply'),
                newValues = _.chain(this.get('income'))
                    .map( function (value, attr) {
                        // Special handling for adding power
                        if (attr === 'power')
                            return [attr, Player.attainPower(this.get('power'), value)];

                        // Check the supply for the attr to attain. (If not specified,
                        // supply is infinte). Increase the attr by the income value,
                        // or as many as available in the supply if not enough.
                        var attrSupply = supply[attr],
                            increase = value;
                        if (attrSupply === undefined) {
                            attrSupply = Infinity;
                        } else {
                            // Update supply remaining
                            increase = Math.min(value, attrSupply);
                            supply[attr] = attrSupply - increase;
                        }

                        return [attr, this.get(attr) + increase];
                    }, this)
                    .object()
                    .value();

            // Update the newly computed attr values, and the updated supplies
            this.set(_.extend({
                supply: supply
            }, newValues));

            // Remove this player from the blocking players list
            this.app.game.blockingPlayers.remove(this);

            this.app.game.save();
        },

        performAction: function () {
            this.trigger('choose:action');
        },
        
        pass: function () {
            // if the game is in active mode, and this is the first
            // player to pass (all players are blocking the phase
            // from completing), set this player as the next
            // starting player.
            // (pass is also called during game setup to choose initial
            // bonuses, so it's necessary to check that the game is in
            // active mode)
            if (this.app.game.get('state') === 'active') {
                // TODO
            }

            // remove player from blocking players list once player
            // chooses their bonus
            this.listenToOnce(this, 'changeProperty:bonus', function () {
                this.app.game.blockingPlayers.remove(this);
            });

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


    };
});
