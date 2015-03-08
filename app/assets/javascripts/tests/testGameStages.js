define([
    'jquery',
    'sinon',
    'app',

    'models/common/UniqueModel',
    'models/Player',

    'utils/cookies'
], function (
    $,
    sinon,
    App,

    UniqueModel,
    Player,

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
        basePlayer = {
            game_id: 1,
            id: 10,
            name: 'Nic',
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
        sandbox, app;

        before(function () {
            sandbox = sinon.sandbox.create();
        });

        beforeEach(function () {
            sandbox.stub(window, 'alert');
        });

        afterEach(function () {
            if (app) {
                if (app.poller)
                    app.poller.stop();

                app = null;
            }

            UniqueModel.forget(Player);

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
                var ajaxArgs = $.ajax.getCalls()[0].args;
                expect(ajaxArgs.length).to.equal(1);
                sinon.assert.match(ajaxArgs[0].url, 'get_or_create_game');
                expect(ajaxArgs[0].data.playerName).to.equal('Nic');
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
                            players: [ basePlayer ]
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
                    expect(app.game.players.models[0].id).to.equal(basePlayer.id);
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
                    var ajaxArgs = $.ajax.getCalls()[1].args;
                    expect(ajaxArgs.length).to.equal(1);
                    sinon.assert.match(ajaxArgs[0].url, 'update_game');
                    expect(ajaxArgs[0].data.game.state).to.equal('joining');
                    expect(ajaxArgs[0].data.game.config).to.be.ok;
                });
            });

            describe('when the game is in joining mode', function () {
                beforeEach(function () {
                    stubAjax($.Deferred()
                        .resolve({
                            game: _.defaults({
                                state: 'joining',
                                config: 'preset'
                            }, baseGame),
                            players: [ basePlayer ]
                        })
                        .promise()
                    );
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

                it('should pass the current player\'s name to a call to join ', function () {
                    setCurrentPlayer('Ken');

                    app = App.init();

                    app.currentView.joinGame();

                    sinon.assert.calledTwice($.ajax);
                    var ajaxArgs = $.ajax.getCalls()[1].args;
                    expect(ajaxArgs.length).to.equal(1);
                    sinon.assert.match(ajaxArgs[0].url, 'join_game');
                    expect(ajaxArgs[0].data.name).to.equal('Ken');
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
                                game: _.defaults({
                                    state: 'joining',
                                    config: 'preset'
                                }, baseGame),
                                players: [ basePlayer ]
                                // TOD return more than 1 player to test the actual setting up of the game
                            })
                            .promise()
                        );

                        app = App.init();
                        app.game.set({ config: 'preset' });
                        app.currentView.startGame();
                    });

                    // TO test:
                    //    add turnPosition to each player
                    //    sort players by turnPostion
                    //    set activePlayer to the first player in the newly sorted list
                    //    change state to drafting
                    //    preset bonuses
                    //    preset rounds
                    it('should randomize the players', function () {

                    });
                });
            });
        });
    });
});
