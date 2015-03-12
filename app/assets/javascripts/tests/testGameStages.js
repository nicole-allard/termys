define([
    'jquery',
    'sinon',
    'app',

    'presets/PresetGames',
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

        var baseGame = {
            id: 1,
            state: 'config',
            config: null,
            active_player_id: 10,
            blocking_players: null,
            board: null,
            rounds: null,
            cults: null,
            keys: null,
            favors: null,
            bonuses: null,
        },
        joiningGame = _.defaults({
            state: 'joining',
            config: 'preset'
        }),
        draftingGame = _.defaults({
            state: 'drafting',
            activePlayerId: 10,
            bonuses: '{"power:shipping:":0,"coins:spade:":0,"coins::":0,"workers::stronghold,sanctuary":0,"workers,power::":0}',
            rounds: '[{"fire:power":0},{"air:workers":0},{"earth:coins":0},{"water:spades":0},{"fire:workers":0},{"air:spades":0}]'
        }, joiningGame),
        dwellingsGame = _.defaults({
            state: 'dwellings'
        }, draftingGame),
        bonusesGame = _.defaults({
            board: '[[null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,{"structure":{"playerId":10,"type":"dwelling"}},null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"structure":{"playerId":11,"type":"dwelling"}},null,null,null,null,null],[null,null,null,null,{"structure":{"playerId":11,"type":"dwelling"}},{"structure":{"playerId":10,"type":"dwelling"}},null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,{"structure":{"playerId":11,"type":"dwelling"}},null,null,null,null,null,null]]',
            state: 'bonuses'
        }, draftingGame),

        basePlayer = {
            game_id: 1,
            faction: null,
            turn_position: null,
            victory_points: null,
            coins: null,
            power: null,
            workers: null,
            priests: null,
            num_keys: null,
            supply: null,
            shipping_value: null,
            land_skipping_value: null,
            income: null,
            bonus: null
        },
        baseNic = _.defaults({
            id: 10,
            name: 'Nic'
        }, basePlayer),
        baseKen = _.defaults({
            id: 11,
            name: 'Ken'
        }, basePlayer),
        joinedNic = {
            id: 10,
            name: 'Nic',
            bonus: null,
            coins: 0,
            faction: '',
            income: '{"power":0,"coins":0,"workers":0,"priests":0}',
            landSkippingValue: 0,
            numKeys: 0,
            power: '{"1":0,"2":0,"3":0}',
            priests: 0,
            shippingValue: 0,
            supply: '{"priests":7,"dwellings":10,"tradingHouses":4,"temples":3,"strongholds":1,"sanctuaries":1,"bridges":3}',
            turnPosition: -1,
            victoryPoints: 20,
            workers: 0
        },
        joinedKen = {
            id: 11,
            name: 'Ken',
            bonus: null,
            coins: 0,
            faction: '',
            income: '{"power":0,"coins":0,"workers":0,"priests":0}',
            landSkippingValue: 0,
            numKeys: 0,
            power: '{"1":0,"2":0,"3":0}',
            priests: 0,
            shippingValue: 0,
            supply: '{"priests":7,"dwellings":10,"tradingHouses":4,"temples":3,"strongholds":1,"sanctuaries":1,"bridges":3}',
            turnPosition: -1,
            victoryPoints: 20,
            workers: 0
        },
        orderedNic = _.defaults({
            turn_position: 0
        }, joinedNic),
        orderedKen = _.defaults({
            turn_position: 1
        }, joinedKen),
        factionedNic = _.defaults({
            faction: 'witches'
        }, orderedNic),
        factionedKen = _.defaults({
            faction: 'nomads'
        }, orderedKen),

        sandbox, app;

        before(function () {
            sandbox = sinon.sandbox.create();
        });

        beforeEach(function () {
            sandbox.stub(window, 'alert');
            sandbox.stub($.prototype, 'modal');
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

        describe('before player has authenticated', function () {
            before(function () {
                setCurrentPlayer(null);
            });

            beforeEach(function () {
                stubAjax($.Deferred().promise());
            });

            it('should not ping the server until the user authenticates', function () {
                app = App.init();

                sinon.assert.notCalled($.ajax);
            });

            it('should ping the server once the user authenticates', function () {
                app = App.init();

                expect(app.player).is.ok;
                expect(app.player.attributes.username).is.undefined;

                app.player.set({ name: 'Nic' });

                sinon.assert.calledOnce($.ajax);
                var ajaxArgs = $.ajax.firstCall.args;
                expect(ajaxArgs.length).to.equal(1);
                sinon.assert.match(ajaxArgs[0].url, 'get_or_create_game');
                expect(ajaxArgs[0].data.player).to.eql(_.omit(joinedNic, 'id'));
            });
        });

        describe('after player has authenticated', function () {
            before(function () {
                setCurrentPlayer('Nic');
            });

            describe('when there\'s no current game', function () {
                beforeEach(function () {
                    stubAjax($.Deferred()
                        .resolve({
                            game: baseGame,
                            players: [ joinedNic ]
                        })
                        .promise()
                    );
                });

                it('should initialize the game and active player model in default their default states', function () {
                    app = App.init();

                    sinon.assert.calledOnce($.ajax);

                    expect(app.game).is.ok;
                    expect(app.game.attributes.state).to.equal('config');
                    expect(app.game.players.length).to.equal(1);
                    expect(app.game.players.models[0].attributes).to.include({ name: 'Nic', id: 10, victoryPoints: 20 });
                    expect(app.game.players.models[0].attributes.income).to.be.ok;
                    expect(app.game.activePlayer).to.equal(app.game.players.models[0]);
                });

                it('should show the configuration view', function () {
                    app = App.init();

                    // Should be showing the configuration view
                    expect(app.currentView).is.ok;
                    expect(app.currentView.finishConfiguration).is.ok;

                    // Should have called get_or_create_game
                    sinon.assert.calledOnce($.ajax);
                });

                it('should not allow non-active users to update configuration options', function () {
                    setCurrentPlayer('Ken');

                    app = App.init();

                    app.currentView.finishConfiguration();

                    // Should not update game if changes are made by a non-active player
                    sinon.assert.calledOnce($.ajax);
                });

                it('should change the game state to joining when configuration is complete', function () {
                    app = App.init();

                    app.currentView.finishConfiguration();

                    // Should have called update_game with updated game attrs:
                    // joining state and new game config
                    sinon.assert.calledTwice($.ajax);
                    var ajaxArgs = $.ajax.secondCall.args;
                    expect(ajaxArgs.length).to.equal(1);
                    expect(ajaxArgs[0].url).to.match(/update_game/);
                    expect(ajaxArgs[0].data.game).to.contain({ state: 'joining' });
                    expect(ajaxArgs[0].data.game.config).to.be.ok;
                });
            });

            describe('when the game is in joining mode', function () {
                beforeEach(function () {
                    stubAjax($.Deferred()
                        .resolve({
                            game: joiningGame,
                            players: [ joinedNic ]
                        })
                        .promise()
                    );
                });

                it('should properly parse the initial player', function () {
                    app = App.init();

                    expect(app.game.players.length).to.equal(1);
                    expect(app.game.players.models[0].attributes).to.eql(joinedNic);
                });

                it('should properly parse the joined players', function () {
                    stubAjax($.Deferred()
                        .resolve({
                            game: joiningGame,
                            players: [
                                joinedNic,
                                joinedKen
                            ]
                        })
                        .promise()
                    );

                    app = App.init();

                    expect(app.game.players.length).to.equal(2);
                    expect(app.game.players.models[1].attributes).to.eql(joinedKen);
                });

                it('should show the joining view', function () {
                    app = App.init();

                    sinon.assert.calledOnce($.ajax);

                    // Should be showing joining view
                    expect(app.currentView).is.ok;
                    expect(app.currentView.joinGame).is.ok;
                });

                it('should not try to join a player who has already joined', function () {
                    app = App.init();

                    app.currentView.joinGame();

                    sinon.assert.calledOnce($.ajax);
                });

                it('should pass the current player\'s attributes to a call to join ', function () {
                    setCurrentPlayer('Ken');

                    app = App.init();

                    app.currentView.joinGame();

                    sinon.assert.calledTwice($.ajax);
                    var ajaxArgs = $.ajax.secondCall.args;
                    expect(ajaxArgs.length).to.equal(1);
                    expect(ajaxArgs[0].url).to.match(/join_game/);
                    expect(ajaxArgs[0].data.player).to.eql(_.omit(joinedKen, 'id'));
                });

                it('should not allow a player who has not yet joined to start the game', function () {
                    setCurrentPlayer('Ken');

                    app = App.init();

                    app.currentView.startGame();

                    sinon.assert.calledOnce($.ajax);
                });

                it('should not allow the game to be started with fewer than 2 players', function () {
                    app = App.init();

                    app.currentView.startGame();

                    sinon.assert.calledOnce($.ajax);
                });

                describe('a user starts the game in preset config', function () {
                    beforeEach(function () {
                        stubAjax($.Deferred()
                            .resolve({
                                game: joiningGame,
                                players: [
                                    joinedNic,
                                    joinedKen
                                ]
                            })
                            .promise()
                        );

                        // To test for an expected result, use reverse instead of randomize
                        sandbox.stub(Array.prototype, 'randomize', Array.prototype.reverse);

                        app = App.init();
                        app.currentView.startGame();
                    });

                    it('should save the game', function () {
                        sinon.assert.calledTwice($.ajax);

                        var ajaxArgs = $.ajax.secondCall.args;
                        expect(ajaxArgs.length).to.equal(1);
                        expect(ajaxArgs[0].url).to.match(/update_game/);
                    });

                    it('should randomize the players', function () {
                        sinon.assert.calledOnce(Array.prototype.randomize);

                        var ajaxArgs = $.ajax.secondCall.args[0];
                        expect(ajaxArgs.data.game.players.length).to.equal(2);
                        expect(ajaxArgs.data.game.players[0]).to.include({ name: 'Ken', id: 11, turnPosition: 0 });
                        expect(ajaxArgs.data.game.players[1]).to.include({ name: 'Nic', id: 10, turnPosition: 1 });
                        expect(ajaxArgs.data.game).to.include({ activePlayerId: 11 });
                    });

                    it('should change the game state', function () {
                        var ajaxArgs = $.ajax.secondCall.args[0];
                        expect(ajaxArgs.data.game).to.include({ state: 'drafting' });
                    });

                    it('should initialize preset bonuses for the number of players', function () {
                        expect(app.game.bonuses).to.be.ok;
                        expect(app.game.bonuses.length).to.equal(5);
                        expect(app.game.bonuses.models[0].attributes).to.contain({
                            id: 'power:shipping:',
                            coins: 0
                        });
                        expect(app.game.bonuses.models[1].attributes).to.contain({
                            id: 'coins:spade:',
                            coins: 0
                        });
                        expect(app.game.bonuses.models[2].attributes).to.contain({
                            id: 'coins::',
                            coins: 0
                        });
                        expect(app.game.bonuses.models[3].attributes).to.contain({
                            id: 'workers::stronghold,sanctuary',
                            coins: 0
                        });
                        expect(app.game.bonuses.models[4].attributes).to.contain({
                            id: 'workers,power::',
                            coins: 0
                        });
                    });

                    it('should send bonuses in save request', function () {
                        var ajaxArgs = $.ajax.secondCall.args[0];
                        expect(ajaxArgs.data.game.bonuses).to.be.a('string');

                        var bonuses = JSON.parse(ajaxArgs.data.game.bonuses);
                        expect(bonuses).to.be.a('object');
                        expect(bonuses).to.contain({
                            'power:shipping:': 0,
                            'coins:spade:': 0,
                            'coins::': 0,
                            'workers::stronghold,sanctuary': 0,
                            'workers,power::': 0
                        });
                    });

                    it('should initialize the preset rounds for the number of players', function () {
                         expect(app.game.rounds).to.be.ok;
                         expect(app.game.rounds.length).to.equal(6);
                         expect(app.game.rounds.models[0].attributes).to.contain({
                            id: 'fire:power',
                            phase: 0
                         });
                         expect(app.game.rounds.models[1].attributes).to.contain({
                            id: 'air:workers',
                            phase: 0
                         });
                         expect(app.game.rounds.models[2].attributes).to.contain({
                            id: 'earth:coins',
                            phase: 0
                         });
                         expect(app.game.rounds.models[3].attributes).to.contain({
                            id: 'water:spades',
                            phase: 0
                         });
                         expect(app.game.rounds.models[4].attributes).to.contain({
                            id: 'fire:workers',
                            phase: 0
                         });
                         expect(app.game.rounds.models[5].attributes).to.contain({
                            id: 'air:spades',
                            phase: 0
                         });
                    });

                    it('should send rounds in save request', function () {
                        var ajaxArgs = $.ajax.secondCall.args[0];
                        expect(ajaxArgs.data.game.rounds).to.be.a('string');

                        var rounds = JSON.parse(ajaxArgs.data.game.rounds);
                        expect(rounds).to.be.a('array');
                        expect(rounds[0]).to.eql({ 'fire:power': 0 });
                        expect(rounds[1]).to.eql({ 'air:workers': 0 });
                        expect(rounds[2]).to.eql({ 'earth:coins': 0 });
                        expect(rounds[3]).to.eql({ 'water:spades': 0 });
                        expect(rounds[4]).to.eql({ 'fire:workers': 0 });
                        expect(rounds[5]).to.eql({ 'air:spades': 0 });
                    });
                });
            });

            describe('when the game is in drafting mode', function () {
                beforeEach(function () {
                    stubAjax($.Deferred()
                        .resolve({
                            game: draftingGame,
                            players: [
                                orderedNic,
                                orderedKen
                            ]
                        })
                        .promise()
                    );
                });

                it('should show the drafting view', function () {
                    app = App.init();

                    expect(app.currentView.chooseFaction).to.be.ok;
                });

                it('should make a fetch call', function () {
                    app = App.init();

                    sinon.assert.calledOnce($.ajax);
                    expect($.ajax.firstCall.args[0].url).to.match(/get_or_create_game/);
                });

                it('should initialize the game from the fetch', function () {
                    app = App.init();

                    expect(app.game.attributes).to.contain({ state: 'drafting', config: 'preset' });
                    expect(app.game.activePlayer).to.be.ok;
                    expect(app.game.activePlayer.attributes).to.contain({ name: 'Nic', id: 10 });
                });

                it('should initialize the bonuses from the fetch', function () {
                    app = App.init();

                    expect(app.game.bonuses).to.be.ok;
                    expect(app.game.bonuses.length).to.equal(5);
                    expect(app.game.bonuses.models[0].attributes).to.contain({
                        id: 'power:shipping:',
                        coins: 0
                    });
                    expect(app.game.bonuses.models[1].attributes).to.contain({
                        id: 'coins:spade:',
                        coins: 0
                    });
                    expect(app.game.bonuses.models[2].attributes).to.contain({
                        id: 'coins::',
                        coins: 0
                    });
                    expect(app.game.bonuses.models[3].attributes).to.contain({
                        id: 'workers::stronghold,sanctuary',
                        coins: 0
                    });
                    expect(app.game.bonuses.models[4].attributes).to.contain({
                        id: 'workers,power::',
                        coins: 0
                    });
                });

                it('should initialize the rounds from the fetch', function () {
                    app = App.init();

                    expect(app.game.rounds).to.be.ok;
                    expect(app.game.rounds.length).to.equal(6);
                    expect(app.game.rounds.models[0].attributes).to.contain({
                       id: 'fire:power',
                       phase: 0
                    });
                    expect(app.game.rounds.models[1].attributes).to.contain({
                       id: 'air:workers',
                       phase: 0
                    });
                    expect(app.game.rounds.models[2].attributes).to.contain({
                       id: 'earth:coins',
                       phase: 0
                    });
                    expect(app.game.rounds.models[3].attributes).to.contain({
                       id: 'water:spades',
                       phase: 0
                    });
                    expect(app.game.rounds.models[4].attributes).to.contain({
                       id: 'fire:workers',
                       phase: 0
                    });
                    expect(app.game.rounds.models[5].attributes).to.contain({
                       id: 'air:spades',
                       phase: 0
                    });
                });

                it('should not allow a non-active player to choose a faction', function () {
                    setCurrentPlayer('Ken');

                    app = App.init();

                    app.currentView.chooseFaction({ currentTarget: $('<button>').val('witches') });

                    // Should not have updated the non-active player
                    expect(app.player.attributes).to.contain({ id: 11, name: 'Ken', faction: '' });

                    // Should not have tried to save player changes
                    sinon.assert.calledOnce($.ajax);
                });

                it('should call save once the active player has chosen a faction', function () {
                    app = App.init();

                    app.currentView.chooseFaction({ currentTarget: $('<button>').val('witches') });

                    // Should save the changes
                    sinon.assert.calledTwice($.ajax);

                    var ajaxArgs = $.ajax.secondCall.args[0];
                    expect(ajaxArgs.url).to.match(/update_game/);
                    expect(ajaxArgs.data.game).to.contain({ activePlayerId: 11, state: 'drafting' });
                    expect(ajaxArgs.data.game.players[0]).to.contain({ id: 10, name: 'Nic', faction: 'witches' });
                });

                // TODO test that the faction shim was called when the player chose a faction

                it('should update the game and players once the active player has chosen a faction', function () {
                    app = App.init();

                    // Stub game save, otherwise the response will be parsed and overwrite the values set
                    // before the save
                    sandbox.stub(app.game, 'save');

                    app.currentView.chooseFaction({ currentTarget: $('<button>').val('witches') });

                    // Should update the active player's faction
                    expect(app.player.attributes).to.contain({ id: 10, name: 'Nic', faction: 'witches' });

                    // Should update the active player, but stay in the drafting state
                    expect(app.game.activePlayer.attributes).to.contain({ id: 11, name: 'Ken', faction: '' });
                });

                it('should switch the game state once the last player has chosen a faction', function () {
                    setCurrentPlayer('Ken');

                    app = App.init();

                    // Stub game save, otherwise the response will be parsed and overwrite the values set
                    // before the save
                    sandbox.stub(app.game, 'save');

                    app.game.players.models[0].set({ faction: 'witches' });
                    app.game.set({ activePlayerId: 11 });

                    app.currentView.chooseFaction({ currentTarget: $('<button>').val('nomads') });

                    // Should update the active player's faction
                    expect(app.player.attributes).to.contain({ id: 11, name: 'Ken', faction: 'nomads' });

                    // Should update the active player and the game state
                    expect(app.game.activePlayer.attributes).to.contain({ id: 10, name: 'Nic' });
                    expect(app.game.attributes).to.contain({ state: 'dwellings' });
                });
            });
        });

        describe('when the game is in dwellings mode', function () {
            beforeEach(function () {
                stubAjax($.Deferred()
                    .resolve({
                        game: dwellingsGame,
                        players: [
                            factionedNic,
                            factionedKen
                        ]
                    })
                    .promise()
                );
            });


            it('should initialize tha players from the fetch', function () {
                // Don't let the game save, not releveant for this particular test
                sandbox.stub(Game.prototype, 'save');

                app = App.init();

                sinon.assert.calledOnce($.ajax);
                expect($.ajax.firstCall.args[0].url).to.match(/get_or_create_game/);

                expect(app.game.players.length).to.equal(2);
                expect(app.game.players.models[0].attributes).to.contain({ id: 10, name: 'Nic', turnPosition: 0, faction: 'witches' });
                expect(app.game.players.models[1].attributes).to.contain({ id: 11, name: 'Ken', turnPosition: 1, faction: 'nomads' });
            });

            describe('with a preset config', function () {
                it('should initialize preset dwellings', function () {
                    app = App.init();

                    expect(app.game.board).to.be.ok;

                    // 9 rows, even numbered rows have 13 hexes, odd numbered rows have 12
                    expect(app.game.board.hexes.length).to.equal(9);
                    expect(app.game.board.hexes[0].length).to.equal(13);
                    expect(app.game.board.hexes[1].length).to.equal(12);

                    expect(app.game.board.hexes[2][6].structure).to.be.ok;
                    expect(app.game.board.hexes[2][6].structure.attributes).to.contain({ type: 'dwelling' });
                    expect(app.game.board.hexes[2][6].structure.player.attributes).to.contain({ id: 10, name: 'Nic', faction: 'witches' });

                    expect(app.game.board.hexes[4][7].structure).to.be.ok;
                    expect(app.game.board.hexes[4][7].structure.attributes).to.contain({ type: 'dwelling' });
                    expect(app.game.board.hexes[4][7].structure.player.attributes).to.contain({ id: 11, name: 'Ken', faction: 'nomads' });
                });

                it('should update the game state to bonuses', function () {
                    app = App.init();

                    expect(app.game.attributes).to.contain({ state: 'bonuses' });
                });

                it('should save the game and the dwellings', function () {
                    app = App.init();

                    sinon.assert.calledTwice($.ajax);
                    var ajaxArgs = $.ajax.secondCall.args[0];
                    expect(ajaxArgs.url).to.match(/update_game/);
                    expect(ajaxArgs.data.game).to.contain({ board: '[[null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,{"structure":{"playerId":10,"type":"dwelling"}},null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,{"structure":{"playerId":11,"type":"dwelling"}},null,null,null,null,null],[null,null,null,null,{"structure":{"playerId":11,"type":"dwelling"}},{"structure":{"playerId":10,"type":"dwelling"}},null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null,null,null,null,null],[null,null,null,null,null,null,{"structure":{"playerId":11,"type":"dwelling"}},null,null,null,null,null,null]]' });
                });
            });
        });

        describe('when the game is in bonuses mode', function () {
            var bonusView;

            beforeEach(function () {
                stubAjax($.Deferred()
                    .resolve({
                        game: bonusesGame,
                        players: [
                            factionedNic,
                            factionedKen
                        ]
                    })
                    .promise()
                );

                bonusView = new Backbone.View({
                    model: Bonus.expand({ key: 'power:shipping:', value: 0 })
                });

                sandbox.spy(Bonus.prototype, 'take');
            });

            it('should initialize the game board from the fetch', function () {
                app = App.init();

                expect(app.game.board).to.be.ok;

                // 9 rows, even numbered rows have 13 hexes, odd numbered rows have 12
                expect(app.game.board.hexes.length).to.equal(9);
                expect(app.game.board.hexes[0].length).to.equal(13);
                expect(app.game.board.hexes[1].length).to.equal(12);

                expect(app.game.board.hexes[2][6].structure).to.be.ok;
                expect(app.game.board.hexes[2][6].structure.attributes).to.contain({ type: 'dwelling' });
                expect(app.game.board.hexes[2][6].structure.player.attributes).to.contain({ id: 10, name: 'Nic', faction: 'witches' });

                expect(app.game.board.hexes[4][7].structure).to.be.ok;
                expect(app.game.board.hexes[4][7].structure.attributes).to.contain({ type: 'dwelling' });
                expect(app.game.board.hexes[4][7].structure.player.attributes).to.contain({ id: 11, name: 'Ken', faction: 'nomads' });
            });

            it('should show the bonuses view', function () {
                app = App.init();

                expect(app.modalView).to.be.ok;
                expect(app.modalView.contentView instanceof BonusesView).to.be.ok;
            });

            it('shouldn\'t allow a non-active player to select a bonus', function () {
                setCurrentPlayer('Ken');

                app = App.init();

                app.modalView.contentView.trigger('itemview:select:bonus', bonusView);

                sinon.assert.notCalled(Bonus.prototype.take);
            });

            it('should update the active player when they select a bonus', function () {
                app = App.init();

                var prevPlayerAttrs = _.clone(app.player.attributes);

                // Stub game save, otherwise the response will be parsed and overwrite the values set
                // before the save
                sandbox.stub(app.game, 'save');

                // Trigger taking the bonus
                app.modalView.contentView.trigger('itemview:select:bonus', bonusView);

                sinon.assert.calledOnce(Bonus.prototype.take);
                sinon.assert.calledWith(Bonus.prototype.take, app.player);

                expect(app.player.bonus).to.equal(bonusView.model);
                expect(app.player.attributes).to.eql(
                    _.defaults({
                        shippingValue: prevPlayerAttrs.shippingValue + 1,
                        income: _.defaults({
                            power: prevPlayerAttrs.income.power + 3
                        },
                        prevPlayerAttrs.income)
                    }, prevPlayerAttrs)
                );
            });

            it('should remove the chosen bonus from the game\'s bonuses once a player takes one' , function () {
                app = App.init();

                expect(app.game.bonuses.length).to.equal(5);
                expect(app.game.bonuses.findWhere({ id: bonusView.model.id })).to.be.ok;

                // Stub game save, otherwise the response will be parsed and overwrite the values set
                // before the save
                sandbox.stub(app.game, 'save');

                // Trigger taking the bonus
                app.modalView.contentView.trigger('itemview:select:bonus', bonusView);

                expect(app.game.bonuses.length).to.equal(4);
            });

            it('should update the active player once they\'ve chosen a bonus ', function () {

            });

            it('should call save once the player takes a bonus', function () {

            });

            it('should update the game state to active once all the player have chosen a bonus', function () {

            });
        });
    });
});
