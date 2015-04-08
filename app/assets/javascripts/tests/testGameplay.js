define([
    'jquery',
    'sinon',
    'app',

    'presets/PresetGames',
    'presets/FactionShims',
    'models/common/UniqueModel',
    'models/Game',
    'models/Player',
    'models/Bonus',
    'models/Round',

    'views/BonusesView',

    'utils/cookies'
], function (
    $,
    sinon,
    App,

    PresetGames,
    FactionShims,
    UniqueModel,
    Game,
    Player,
    Bonus,
    Round,

    BonusesView,

    cookies
) {
    describe('Game', function () {
        this.timeout(0);

        var setCurrentPlayer = function (name) {
            if (cookies.read.restore && cookies.read.restore.sinon)
                cookies.read.restore();

            sandbox.stub(cookies, 'read')
                .withArgs(Player.USER_COOKIE)
                .returns(name);
        };
        var stubAjax = function (response) {
            if ($.ajax.restore && $.ajax.restore.sinon)
                $.ajax.restore();

            sandbox.stub($, 'ajax', function () {
                return response;
            });
        };

        var activeGame = {
            id: 1,
            state: 'active',
            config: 'preset',
            active_player_id: 10,
            blocking_players: null,
            board: '[[null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,{"structure":{"playerId":10,"type":"dwelling"}},null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"structure":{"playerId":11,"type":"dwelling"}},null,null,null,null,null],[null,null,null,null,{"structure":{"playerId":11,"type":"dwelling"}},{"structure":{"playerId":10,"type":"dwelling"}},null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,{"structure":{"playerId":11,"type":"dwelling"}},null,null,null,null,null,null]]',
            rounds: '[{"fire:power":0},{"air:workers":0},{"earth:coins":0},{"water:spades":0},{"fire:workers":0},{"air:spades":0}]',
            cults: null,
            keys: null,
            favors: null,
            bonuses: '{"coins::":0,"workers::stronghold,sanctuary":0,"workers,power::":0}'
        },

        nic = {
            id: 10,
            name: 'Nic',
            bonus: '{"power:shipping:":0}',
            coins: 0,
            faction: 'witches',
            income: '{"power":0,"coins":0,"workers":1,"priests":0}',
            landSkippingValue: 0,
            numKeys: 0,
            power: '{"1":0,"2":0,"3":0}',
            priests: 0,
            shippingValue: 0,
            supply: '{"priests":7,"dwellings":10,"tradingHouses":4,"temples":3,"strongholds":1,"sanctuaries":1,"bridges":3}',
            turnPosition: 0,
            victoryPoints: 20,
            workers: 0
        },
        ken = {
            id: 11,
            name: 'Ken',
            bonus: '{"coins:spade:":0}',
            coins: 0,
            faction: 'nomads',
            income: '{"power":0,"coins":0,"workers":1,"priests":0}',
            landSkippingValue: 0,
            numKeys: 0,
            power: '{"1":0,"2":0,"3":0}',
            priests: 0,
            shippingValue: 0,
            supply: '{"priests":7,"dwellings":10,"tradingHouses":4,"temples":3,"strongholds":1,"sanctuaries":1,"bridges":3}',
            turnPosition: 1,
            victoryPoints: 20,
            workers: 0
        },

        sandbox, app;

        before(function () {
            sandbox = sinon.sandbox.create();
        });

        beforeEach(function () {
            sandbox.stub(window, 'alert');
            sandbox.stub($.prototype, 'modal');

            setCurrentPlayer('Nic');

            stubAjax($.Deferred()
                .resolve({
                    game: activeGame,
                    players: [ nic, ken ]
                })
                .promise()
            );
        });

        afterEach(function () {
            if (app) {
                if (app.poller)
                    app.poller.stop();

                app = null;
            }

            UniqueModel.forget(Player);
            UniqueModel.forget(Bonus);
            UniqueModel.forget(Round);

            sandbox.restore();
        });

        describe('play', function () {
            describe('upon app initialization', function () {
                beforeEach(function () {
                    sandbox.spy(Game.prototype, 'play');
                    sandbox.stub(Player.prototype, 'performIncome');
                    app = App.init();
                });

                it('should call game.play', function () {
                    sinon.assert.called(app.game.play);
                });

                it('should kick off the first round', function () {
                    expect(app.game.rounds.models[0].attributes.phase).to.equal(Round.PHASES.INCOME);
                });

                it('should mark all players as blocking phase completion', function () {
                    expect(app.game.blockingPlayers.phase.length).to.equal(2);
                    expect(app.game.blockingPlayers.phase.models).to.contain(app.game.players.models[0]);
                    expect(app.game.blockingPlayers.phase.models).to.contain(app.game.players.models[1]);
                });

                it('should kick off performIncome only for the active player', function () {
                    sinon.assert.calledOnce(app.player.performIncome);
                    sinon.assert.alwaysCalledOn(app.player.performIncome, app.game.players.models[0]);
                });
            });
        });
    });
});
