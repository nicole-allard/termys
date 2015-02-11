define([
    'backbone',

    'utils/cookies',
    'utils/actions'
], function (
    Backbone,

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

    return Player;
});
