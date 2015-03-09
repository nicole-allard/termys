define([
    'jquery',
    'marionette',
    'haml',

    'presets/PresetGames',

    'text!templates/drafting.haml'
], function (
    $,
    Marionette,
    Haml,

    PresetGames,

    draftingTemplate
) {

    var DraftingView = Marionette.ItemView.extend({
        template: Haml(draftingTemplate),

        events: {
            'click button': 'chooseFaction'
        },

        initialize: function (options) {
            this.app = options.app;

            // TODO handle config options other than presets
            var numPlayers = this.app.game.players.length;
            this.factions = PresetGames.players[numPlayers].factions;

            this.listenTo(this.app.game, 'changeProperty:activePlayer', this.render);
        },

        chooseFaction: function (e) {
            var chosenFaction = $(e.currentTarget).val(),
                currentPlayer = this.app.player,
                players = this.app.game.players;

            if (!currentPlayer.isActivePlayer())
                return;

            // Updating the player's faction will shim the player instance
            // with all the defaults and special handling for that faction.
            currentPlayer.set({
                faction: chosenFaction
            });

            this.app.game.activateNextPlayer();

            // Once every player has chosen a faction, move onto the
            // dwelling state.
            if (players.every(function (player) {
                return !!player.get('faction');
            })) {
                this.app.game.set({
                    state: 'dwellings'
                });
            }

            this.app.game.save();
        },

        getAvailableFactions: function () {
            var players = this.app.game.players;
            return _.difference(this.factions, players.pluck('faction'));
        },

        templateHelpers: function () {
            var players = this.app.game.players,
                currentPlayer = this.app.player;

            return {
                currentPlayer: currentPlayer.toJSON(),
                players: players.toJSON(),
                factions: this.getAvailableFactions()
            };
        },
    });

    return DraftingView;
});
