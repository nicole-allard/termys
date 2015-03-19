define([
    'underscore',
    'backbone',

    'presets/FactionShims',
    'models/common/UniqueModel',
    'models/Bonus',

    'utils/cookies',
    'utils/actions'
], function (
    _,
    Backbone,

    FactionShims,
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
                workers: 1,
                priests: 0
            }
            // TODO figure out how to store spade cost, increase track, etc.
            //
            // TODO figure out if a player actually needs to store spades
            // to handle special actions that bring down the spade cost
            // for subsequent terraforming
            // spades: 0
        },

        initialize: function (attributes, options) {
            this.on('change:name', this.updateCookie);
            this.on('change:faction', this.initializeFaction);
            this.on('build:structure', this.updateStructures);

            this.app = options.app;

            this.on('change', this.deserialize);
            this.deserialize();
        },

        initializeFaction: function () {
            var faction = this.get('faction');
            if (!faction)
                return;

            FactionShims[faction].call(this);
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

        isLastPlayer: function () {
            var players = this.app.game.players;
            return players.indexOf(this) === players.length - 1;
        },

        deserialize: function () {
            var bonus = this.get('bonus');
            if (bonus === null)
                this.bonus = null;
            else if (bonus)
                this.bonus = UniqueModel.get(Bonus, this.get('bonus'));

            this.unset('bonus');
            this.trigger('changeProperty:bonus');

            _.each(['power', 'supply', 'income'], function (attrName) {
                var val = this.get(attrName);
                if (val && typeof val === 'string')
                    this.set(attrName, JSON.parse(val), { silent: true });
            }, this);
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

        updateStructures: function (newStructure) {
            // TODO
            // update resources and income based on what
            // structure was removed from the board, and what
            // structure (if any) was returned to the board.
            // add cost for the new structure
        },

        increaseShipping: function () {
            // TODO
            // update shipping value and add appropriate cost
        },

        nextPlayer: function () {
            var players = this.app.game.players,
                index = players.indexOf(this);

            return players.at((index + 1) % players.length);
        },

        toJSON: function () {
            return _.extend({
                isActivePlayer: this.isActivePlayer()
            }, this.attributes);
        },

        // TODO determine why income is nil in the DB. Should be
        // the serialized version of the FE default value.
        serialize: function () {
            return _.extend(
                {
                    bonus: this.bonus && this.bonus.serialize() || null
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
        FACTION_COLORS: {
            'fakirs': 'yellow',
            'nomads': 'yellow',
            'chaos': 'red',
            'giants': 'red',
            'swarmlings': 'blue',
            'mermaids': 'blue',
            'dwarves': 'grey',
            'engineers': 'grey',
            'halflings': 'brown',
            'cultists': 'brown',
            'alchemists': 'black',
            'darklings': 'black',
            'auren': 'green',
            'witches': 'green'
        },

        initializeFromCookie: function (app) {
            var val = cookies.read(Player.USER_COOKIE);
            if (val)
                return new UniqueModel(Player,
                    {
                        name: val
                    }, {
                        app: app
                    }
                );
        }
    });

    _.extend(Player.prototype, actions);

    UniqueModel.addType('Player', Player);

    return Player;
});
