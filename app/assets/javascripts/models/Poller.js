define([
    'jquery',
    'underscore',
    'backbone'
], function (
    $,
    _,
    Backbone
) {
    var Poller = Backbone.Model.extend({
        initialize: function (attrs, options) {
            this.app = options.app;
        },

        start: function () {
            $.ajax({
                type: 'GET',
                url: 'home/get_or_create_game',
                data: {
                    playerName: this.app.player.get('name')
                }
            }).then(_.bind(function (response) {
                this.parse(response);
                this.interval = window.setInterval(_.bind(this.pull, this), 5000);
            }, this));

            return this;
        },

        stop: function () {
            window.clearInterval(this.interval);
            this.interval = null;

            return this;
        },

        pull: function () {
            $.ajax({
                type: 'GET',
                url: '/home/get_latest'
            }).then(this.parse);
        },

        parse: function (response) {
            response = Poller.camelizeObject(response));

        }
    }, {
        camelizeObject: function (obj) {
            if (!$.isPlainObject(obj))
                return obj;

            _.each(obj, function (value, key) {
                var camelizedKey = key.toCamelCase();
                obj[camelizedKey] = Poller.camelizeObject(obj[key]);

                if (key !== camelizedKey)
                    delete obj[key];
            });

            return obj;
        }
    });

    return Poller;
});
