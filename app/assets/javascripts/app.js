define([
    'jquery',
    'underscore',
    'marionette',

    'models/Poller',
    'models/Player',

    'views/LoginView',
    'views/JoiningView',
    'views/ConfigurationView',
    'views/DraftingView',
    'views/GameView',

    'overrides',
    'bootstrap'
], function (
    $,
    _,
    Marionette,

    Poller,
    Player,

    LoginView,
    JoiningView,
    ConfigurationView,
    DraftingView,
    GameView
) {
    var AppRouter = Marionette.AppRouter.extend({
        routes: {},

        initialize: function () {
            $.when(this.initUser()).then(_.bind(function () {
                this.poller = new Poller({}, { app: this });
                this.poller.start();
            }, this));
        },

        initUser: function () {
            this.player = Player.initializeFromCookie(this);
            if (this.player)
                return this.player;

            var usernamePromise = $.Deferred();
            this.player = new Player({}, { app: this });
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

            this.handleStateChange();
        },

        handleStateChange: function () {
            switch(this.game.get('state')) {
            case 'config':
                this._showView(new ConfigurationView({
                    app: this
                }));
                return;
            case 'joining':
                this._showView(new JoiningView({
                    app: this
                }));
                return;
            case 'drafting':
                // TODO if config is set to random, choose random factions
                // for the players instead of showing DraftingView
                this._showView(new DraftingView({
                    app: this
                }));
                return;
            case 'dwellings':
                // TODO for configs other than preset show a dwellings view
                this.game.loadPresetDwellings();
                return;
            case 'bonuses':
                this._showView(new GameView({
                    app: this,
                    model: this.game
                }));
                this.game.handleInitialBonuses();
                return;
            case 'active':
                this._showView(new GameView({
                    app: this,
                    model: this.game
                }));
                this.game.play();
            }
        },

        _showView: function (view) {
            this.currentView = view;
            $('.modal').modal('hide');
            $('.game-container').html(view.render().$el);
            view.triggerMethod('show');
        }
    });

    var appRouter;
    return {
        init: function () {
            appRouter = new AppRouter();
            window.TERMYS = { app: appRouter };
            return appRouter;
        },

        get: function () {
            if (!appRouter)
                appRouter = new AppRouter();

            return appRouter;
        }
    };
});
