define([
    'jquery',
    'marionette',
    'haml',

    'text!templates/login.haml'
], function (
    $,
    Marionette,
    Haml,

    loginTemplate
) {
    var LoginView = Marionette.ItemView.extend({
        template: Haml(loginTemplate),

        events: {
            'submit': 'updateUsername'
        },

        updateUsername: function (e) {
            this.model.set({
                name: $(e.currentTarget).find('input').val()
            });
        }
    });

    return LoginView;
});
