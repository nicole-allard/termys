define([
    'underscore',
    'backbone',

    'models/common/UniqueModel',
    'models/Bonus',

    'utils/cookies',
    'utils/actions'
], function (
    _,
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
            turnPosition: -1,
            victoryPoints: 20,
            coins: 0,
            power: {
                1: 0,
                2: 0,
                3: 0
            },
            workers: 0,
            priests: 0,
            numKeys: 0,
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
            }
            // TODO figure out if a player actually needs to store spades
            // to handle special actions that bring down the spade cost
            // for subsequent terraforming
            // spades: 0
        },

        initialize: function (attributes, options) {
            this.on('change:name', this.updateCookie);
            this.on('change', this.updateProperties);

            this.app = options.app;
        },

        isRegistered: function () {
            // A player who has signed in on the front end will have a name,
            // but it's not until an associated player model has been created
            // in the database and the id synced to the frontend that the player
            // is registered with the game.
            return !!this.get('id');
        },

        isActivePlayer: function () {
            return this.app.game && this === this.app.game.activePlayer;
        },

        updateProperties: function () {
            if (this.get('bonus')) {
                this.bonus = UniqueModel.get(Bonus, this.get('bonus'));
                this.unset('bonus');
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

        toJSON: function () {
            return _.extend({
                isActivePlayer: this.isActivePlayer()
            }, this.attributes);
        },

        toDbJSON: function () {
            return _.extend(
                {
                    bonus: this.bonus && this.bonus.toDbJSON() || null
                },
                _.chain(this.attributes)
                .map(function (value, key) {
                    return [key, $.isPlainObject(value) ? JSON.stringify(value) : value];
                })
                .object()
                .value()
            );
        }
    }, {
        USER_COOKIE: 'username',

        initializeFromCookie: function (app) {
            var val = cookies.read(Player.USER_COOKIE);
            if (val)
                return new Player({
                    name: val
                }, {
                    app: app
                });
        }
    });

    _.extend(Player.prototype, actions);

    UniqueModel.addType('Player', Player);

    return Player;
});
