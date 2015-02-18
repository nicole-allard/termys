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
        template: configurationTemplate,

        initialize: function (options) {
            this.app = options.app;
        },

        events: {
            'click .js-submit': 'finishConfiguration'
        },

        finishConfiguration: function () {
            var configType = this.$('.js-config-type').val();

            // Indicate the completion of the configuration state and save
            // the config options
            this.app.game.set({
                config: configType,
                state: 'joining'
            });

            this.app.game.save();
        }
    });

    return ConfigurationView;
});
