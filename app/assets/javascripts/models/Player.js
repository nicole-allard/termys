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

        // TODO test
        performIncome: function () {
            var supply = this.get('supply'),
                newValues = _.chain(this.get('income'))
                    .map( function (value, attr) {
                        // Special handling for adding power
                        if (attr === 'power')
                            return [attr, Player.attainPower(this.get('power'), value)];

                        // Check the supply for the attr to attain. (If not specified,
                        // supply is infinte). Increase the attr by the income value,
                        // or as many as available in the supply if not enough.
                        var attrSupply = supply[attr],
                            increase = value;
                        if (attrSupply === undefined) {
                            attrSupply = Infinity;
                        } else {
                            // Update supply remaining
                            increase = Math.min(value, attrSupply);
                            supply[attr] = attrSupply - increase;
                        }

                        return [attr, this.get(attr) + increase];
                    }, this)
                    .object()
                    .value();

            // Update the newly computed attr values, and the updated supplies
            this.set(_.extend({
                supply: supply
            }, newValues));

            // Remove this player from the phase blocking players list
            this.app.game.blockingPlayers.phase.remove(this);

            this.app.game.save();
        },

        isRegistered: function () {
            // A player who has signed in on the front end will have a name,
            // but it's not until an associated player model has been created
            // in the database and the id synced to the frontend that the player
            // is registered with the game.
            return !!this.get('id');
        },

        /**
         * Returns whether or not this player is allowed to make changes to the
         * game state right now.
         */
        canMakeChanges: function () {
            // The active player can always make changes
            if (this.isActivePlayer())
                return true;

            // The only times when all players are able to make changes in parallel are
            // during the joining phase, and during the active phase if the current round
            // is in the income or cleanup phase.
            var gameState = this.app.game.get('state'),
                activeRound = gameState === 'active' && this.app.game.getActiveRound(),
                phase = activeRound && activeRound.get('phase');

            return (gameState === 'joining' || _.contains([Round.PHASES.INCOME, Round.PHASES.CLEANUP], phase));
        },

        isActivePlayer: function () {
            return this.app.game && this === this.app.game.activePlayer;
        },

        isStartingPlayer: function () {
            return this.app.game && this === this.app.game.startingPlayer;
        },

        isLastPlayer: function () {
            var players = this.app.game.players;
            return players.indexOf(this) === players.length - 1;
        },

        deserialize: function () {
            var bonus = this.get('bonus');
            // Only clear out the bonus if specifically set to null. If undefined,
            // it could just mean that it wasn't changed.
            if (bonus === null)
                this.bonus = null;
            else if (bonus)
                this.bonus = Bonus.expand({ app: this.app, key: bonus });

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
                isActivePlayer: this.isActivePlayer(),
                isStartingPlayer: this.isStartingPlayer(),
                color: Player.FACTION_COLORS[this.get('faction')],
                bonus: this.bonus ? this.bonus.toJSON() : null
            }, this.attributes);
        },

        serialize: function () {
            return _.extend(
                {
                    bonus: this.bonus && JSON.stringify(this.bonus.id) || null
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
        },

        /**
         * Tries to attain <increase> amount of power. Moves as many as possible
         * from bowl 1 to bowl 2, and then if that's not enough, moves the rest
         * from bowl 2 to bowl 3.
         * @param  {Object} bowls - A mapping from bowl number to contained power
         * @param  {int} increase - The number of power to attain
         * @return {Object} - An updated mapping from bowl number to power
         */
        attainPower: function (bowls, increase) {
            var moved, bowl;
            for (bowl = 1; bowl < 3 && increase; bowl++) {
                moved = Math.min(increase, bowls[bowl]);
                bowls[bowl] -= moved;
                bowls[bowl + 1] += moved;
                increase -= moved;
            }
        }
    });

    _.extend(Player.prototype, actions);

    UniqueModel.addType('Player', Player);

    return Player;
});
