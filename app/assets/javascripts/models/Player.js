define([
    'backbone',

    'models/common/UniqueModel',
    'models/Bonus',

    'utils/cookies',
    'utils/actions'
], function (
    Backbone,

    UniqueModel,
    Bonus,

    cookies,
    actions
) {
    var Player = Backbone.Model.extend({
        // properties: {
        //     bonus: Bonus
        // },

        defaults: {
            name: '',
            faction: '',
            victoryPoints: 20,
            coins: 0,
            power: {
                1: 0,
                2: 0,
                3: 0
            },
            workers: 0,
            priests: 0,
            keys: 0,
            supply: {
                priests: 7,
                dwellings: 10,
                tradingHouses: 4,
                temples: 3,
                strongholds: 1,
                sanctuaries: 1,
                bridges: 3
            },
            shippingValue: 0,
            landSkippingValue: 0,
            income: {
                power: 0,
                coins: 0,
                workers: 0,
                priests: 0
            },
            spades: 0
        },

        initialize: function () {
            this.on('change:name', this.updateCookie);
            this.on('change', this.updateProperties);

            var App = require('app');
            this.app = App.get();
            if (this.app.game)
                this.listenToGame(this.app.game);
            else
                this.listenTo(this.app, 'change:game', this.listenToGame);
        },

        updateProperties: function () {
            if (this.get('bonus')) {
                this.bonus = UniqueModel.get(Bonus, this.get('bonus'));
                this.unset('bonus');
            }
        },

        listenToGame: function (game) {
            this.listenTo(game, 'changeProperty:activePlayer', this.handleStateChange);
            this.listenTo(game, 'change:state', this.handleStateChange);
        },

        handleStateChange: function () {
            var game = this.app.game;
            if (game.activePlayer === this) {
                if (game.get('state') === 'config')
                    this.app.handleConfiguration();
                // TODO handle other states
            }
        },

        updateCookie: function () {
            cookies.create(Player.USER_COOKIE, this.get('name'), {
                expiresIn: 1000 * 60 * 60 * 24
            });
        },

        addVictoryPoints: function (points) {
            this.set({
                victoryPoints: this.get('victoryPoints') + points
            });
        },

        toDbJSON: function () {
            return _.extend({
                bonus: this.bonus && this.bonus.toDbJSON() || null
            }, this.attributes);
        }
    }, {
        USER_COOKIE: 'username',

        initializeFromCookie: function () {
            var val = cookies.read(Player.USER_COOKIE);
            if (val)
                return new Player({
                    name: val
                });
        }
    });

    _.extend(Player.prototype, actions);

    UniqueModel.addType('Player', Player);

    return Player;
});
