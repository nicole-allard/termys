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
        start: function () {
            $.ajax({
                type: 'GET',
                url: 'home/get_or_create_game'
            }).then(this.parse);

            this.interval = window.setInterval(_.bind(this.pull, this), 5000);
            return this;
        },

        stop: function () {
            window.clearInterval(this.interval);
            this.interval = null;
        },

        pull: function () {
            $.ajax({
                type: 'GET',
                url: '/home/get_latest'
            }).then(this.parse);
        },

        parse: function (response) {
            console.log(JSON.stringify(Poller.camelizeObject(response)));
        }
    }, {
        camelizeObject: function (obj) {
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
