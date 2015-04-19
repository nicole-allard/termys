define([
    'backbone',
    'models/common/UniqueModel'
], function (
    Backbone,
    UniqueModel
) {
    var Action = Backbone.Model.extend({
        idAttribute: 'name',
        defaults: {
            name: null,
            playerFunctionName: null
        },

        take: function () {
            if (!this.app.player.isActivePlayer())
                return;

            // TODO set function names below, add functions to actions mixin
            // this.app.player[playerFunctionName]();
        }
    }, {
        buildActionsCollection: function () {
            return new Backbone.Collection(_.each([
                {
                    name: 'Terraform and Build'
                },
                {
                    name: 'Advance Shipping'
                },
                {
                    name: 'Advance Spades'
                },
                {
                    name: 'Upgrade Structure'
                },
                {
                    name: 'Send Priest to Cult'
                },
                {
                    name: 'Power Action'
                },
                {
                    name: 'Special Action'
                },
                {
                    name: 'Pass'
                }
            ], function (attrs) {
                return new Action(attrs);
            }));
        }
    });

    UniqueModel.addType('Action', Action);

    return Action;
});