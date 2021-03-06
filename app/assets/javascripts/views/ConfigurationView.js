define([
    'marionette',
    'haml',

    'text!templates/configuration.haml'
], function (
    Marionette,
    Haml,

    configurationTemplate
) {
    var ConfigurationView = Marionette.ItemView.extend({
        template: Haml(configurationTemplate),
        templateHelpers: function () {
            return {
                currentPlayer: this.app.player.toJSON(),
                activePlayer: this.app.game.activePlayer.toJSON()
            };
        },

        initialize: function (options) {
            this.app = options.app;
        },

        events: {
            'click .js-submit': 'finishConfiguration'
        },

        finishConfiguration: function (e) {
            if (e)
                e.preventDefault();

            if (!this.app.player.isActivePlayer())
                return;

            var configType = this.$('.js-config-type').val();

            // Indicate the completion of the configuration state and save
            // the config options
            this.app.game.set({
                config: configType,
                state: 'joining'
            });

            this.app.game.save();

            return false;
        }
    });

    return ConfigurationView;
});
