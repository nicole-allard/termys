define([
    'backbone',

    'models/common/UniqueModel',
    'models/Player'
], function (
    Backbone,

    UniqueModel,
    Player
) {
    var Structure = Backbone.Model.extend({
        // properties: {
        //     player: Player
        // },

        defaults: {
            type: ''
        },

        initialize: function (attrs) {
            this.on('change', this.deserialize);
            this.deserialize();
        },

        deserialize: function () {
            if (this.get('playerId')) {
                this.player = new UniqueModel(Player, { id: this.get('playerId') });
                this.unset('playerId');
            }
        },

        toJSON: function () {
            return _.extend({
                color: Player.FACTION_COLORS[this.player.get('faction')]
            }, this.attributes);
        },

        serialize: function () {
            return _.extend({
                playerId: this.player.id
            }, this.attributes);
        }
    }, {
        POWER_LEVELS: {
            'dwellings': 1,
            'tradingHouses': 2,
            'temples': 2,
            'sanctuaries': 3,
            'strongholds': 3
        }
    });

    UniqueModel.addType('Structure', Structure);

    return Structure;
});
