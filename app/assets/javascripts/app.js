define([
    'jquery',
    'underscore',
    'marionette',

    'models/Poller',
    'models/Player',
    'models/Action',

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
    Action,

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
                this.initActions();
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

        initActions: function () {
            this.actions = Action.buildActionsCollection();
        },

        setGame: function (game) {
            this.game = game;
            this.trigger('change:game', game);

            // Allow changes to complete before moving on to handling the next state,
            // otherwise the change of the game state could cause more game changes
            // which won't trigger 'change' events as they should, because the state
            // change hasn't completed yet.
            var deferredHandleStateChange = _.bind(_.defer, _, _.bind(this.handleStateChange, this));
            this.listenTo(game, 'changeProperty:activePlayer', deferredHandleStateChange);
            this.listenTo(game, 'change:state', deferredHandleStateChange);

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
