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
            this.on('change', this.updateProperties);
            this.updateProperties();
        },

        updateProperties: function () {
            if (this.get('playerId')) {
                this.player = new UniqueModel(Player, { id: this.get('playerId') });
                this.unset('playerId');
            }
        },

        toDbJSON: function () {
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
