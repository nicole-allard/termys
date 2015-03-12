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
            this.app = options.app;
        },

        onClose: function () {
            this.app.modalView = null;
        },

        onShow: function () {
            this.app.modalView = this;
            this.contentRegion.show(this.contentView);
        },

        openModal: function () {
            var existing = $('#' + this.id + ' .modal');
            existing.remove();

            $('body').append(this.render().$el);
            this.$('.modal').modal();
            this.triggerMethod('show');
        },

        closeModal: function () {
            this.$('.modal').modal('hide');
        }
    });

    return ModalView;
});
