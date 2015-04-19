define([
    'marionette'
], function (
    Marionette
) {
    var ActionView = Marionette.ItemView.extend({
        template: function () {
            return '';
        },
        className: function () {
            return 'action ' + this.model.get('name').toLowerCase().replace(/ /g, '-');
        },

        events: {
            'click': 'takeAction'
        },

        onRender: function () {
            this.$el.attr({
                title: this.model.get('name')
            });
        },

        takeAction: function () {
            this.model.take();
        }
    });

    var ActionSelectionView = Marionette.CollectionView.extend({
        className: 'actions',
        itemView: ActionView
    });

    return ActionSelectionView;
});