define([
    'jquery',
    'underscore',
    'marionette',

    'models/Poller',
    'models/Player',

    'views/LoginView',

    'overrides'
], function (
    $,
    _,
    Marionette,

    Poller,
    Player,

    LoginView
) {
    var AppRouter = Marionette.AppRouter.extend({
        routes: {},

        initialize: function () {
            $.when(this.initUser()).then(_.bind(function () {
                this.poller = new Poller({}, { app: this }).start();
            }, this));
        },

        initUser: function () {
            this.player = Player.initializeFromCookie();
            if (this.player)
                return this.player;

            var usernamePromise = $.Deferred();
            this.player = new Player();
            this.listenTo(this.player, 'change:name', function () {
                usernamePromise.resolve();
            });

            this.showView(new LoginView({
                model: this.player
            }));

            return usernamePromise.promise();
        },

        setGame: function (game) {
            this.game = game;
            this.trigger('change:game', game);
        },

        /**
         * Handles the configuration state of the game when this user is the
         * active configuring player.
         */
        handleConfirguation: function () {
            // TODO show the configuration view to let the user choose how
            // the game should be configured
            // For now, don't allow config, everything goes by preset values
            this.game.set({
                config: 'preset',
                state: 'bonus'
            });

            this.game.save();
        },

        showView: function (view) {
            $('body').html(view.render().$el);
        }
    });

    var appRouter;
    return {
        init: function () {
            appRouter = new AppRouter();
            window.TERMYS = { app: appRouter };
        },

        get: function () {
            if (!appRouter)
                appRouter = new AppRouter();

            return appRouter;
        }
    };
});
