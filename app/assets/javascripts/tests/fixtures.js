define([
    'underscore'
], function (
    _
) {
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
    activeGame = _.defaults({
        state: 'active',
        bonuses: '{"coins::":0,"workers::stronghold,sanctuary":0,"workers,power::":0}'
    }, bonusesGame),

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
        income: '{"power":0,"coins":0,"workers":1,"priests":0}',
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
        income: '{"power":0,"coins":0,"workers":1,"priests":0}',
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
    bonusedNic = _.defaults({
        bonus: 'power:shipping:'
    }, factionedNic),
    bonusedKen = _.defaults({
        bonus: 'coins:spade:',
    }, factionedKen);

    return {
        baseGame: baseGame,
        joiningGame: joiningGame,
        draftingGame: draftingGame,
        dwellingsGame: dwellingsGame,
        bonusesGame: bonusesGame,
        activeGame: activeGame,

        basePlayer: basePlayer,
        baseNic: baseNic,
        baseKen: baseKen,
        joinedNic: joinedNic,
        joinedKen: joinedKen,
        orderedNic: orderedNic,
        orderedKen: orderedKen,
        factionedNic: factionedNic,
        factionedKen: factionedKen,
        bonusedNic: bonusedNic,
        bonusedKen: bonusedKen
    };
});