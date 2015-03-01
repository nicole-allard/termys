define([
    'jquery',
    'marionette',
    'haml',

    'text!templates/modal.haml'
], function (
    $,
    Marionette,
    Haml,

    modalTemplate
) {
    var ModalView = Marionette.Layout.extend({
        template: Haml(modalTemplate),
        regions: {
            contentRegion: '.js-content-region'
        },

        initialize: function (options) {
            this.id = options.id;
            this.contentView = options.contentView;
        },

        onShow: function () {
            this.contentRegion.show(this.contentView);
        },

        openModal: function () {
            var existing = $('#' + this.id + ' .modal');
            existing.remove();

            $('body').append(this.render().$el);
            this.$('.modal').modal();
            this.triggerMethod('show');
        }
    });

    return ModalView;
});
