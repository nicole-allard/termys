define([
    'marionette',
    'haml',

    'models/Bonus',
    'models/Player',

    'text!templates/bonuses.haml',
    'text!templates/bonus.haml'
], function (
    Marionette,
    Haml,

    Bonus,
    Player,

    bonusesTemplate,
    bonusTemplate
) {
    var BonusView = Marionette.ItemView.extend({
        template: Haml(bonusTemplate),
        templateHelpers: function () {
            return {
                isSelectable: this.allowSelection && this.app.player.isActivePlayer(),
                activePlayer: this.app.game.activePlayer.toJSON()
            };
        },
        className: 'bonus',
        events: {
            'click .selectable': 'triggerSelection'
        },

        initialize: function (options) {
            this.allowSelection = options.allowSelection;
            this.app = options.app;
            this.listenTo(this.app.game, 'changeProperty:activePlayer', this.render);
        },

        triggerSelection: function () {
            this.trigger('select:bonus');
        }
    });

    var BonusesView = Marionette.CompositeView.extend({
        template: Haml(bonusesTemplate),
        itemView: BonusView,
        itemViewOptions: function () {
            return {
                app: this.app,
                allowSelection: this.allowSelection
            };
        },
        itemViewContainer: '.js-game-bonuses',

        initialize: function (options) {
            // True if the active user can click on a bonus view, false
            // if this view is for viewing purposes only.
            this.allowSelection = options && options.allowSelection;
            this.app = options.app;
        }
    });

    return BonusesView;
});