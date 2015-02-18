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

            this._showView(new LoginView({
                model: this.player
            }));

            return usernamePromise.promise();
        },

        setGame: function (game) {
            this.game = game;
            this.trigger('change:game', game);

            this.listenTo(game, 'changeProperty:activePlayer', this.handleStateChange);
            this.listenTo(game, 'change:state', this.handleStateChange);
        },

        handleStateChange: function () {
            // The joining state is special in that it's the only one handled by
            // all players at once, not just by the active player
            if (this.game.get('state') === 'joining') {
                this._showView(new JoiningView({
                    app: this
                }));
                return;
            }

            // Only allow the active player to handle the current state
            // so that we don't have multiple players acting at once.
            // Once the active players finishes, the state and/or the
            // active player will change.
            if (this.game.activePlayer !== this.player)
                return;

            switch(this.game.get('state')) {
            case 'config':
                this._showView(new ConfigurationView({
                    app: this
                }));
                break;
            }
        },

        _showView: function (view) {
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
