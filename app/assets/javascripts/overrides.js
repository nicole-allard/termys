define([
    'jquery',
    'underscore'
], function (
    $,
    _
) {
    Number.prototype.mod = function(n) {
        return ((this%n)+n)%n;
    };

    String.prototype.toCamelCase = function () {
        return this.replace(/(\_[a-z])/g, function ($1) { return $1.toUpperCase().replace('_',''); });
    };

    String.prototype.toSnakeCase = function () {
        return this.replace(/([A-Z])/g, function ($1) { return '_' + $1.toLowerCase(); });
    };

    Array.prototype.randomize = function () {
        var i, j, tmp;
        for (i = this.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            tmp = this[i];
            this[i] = this[j];
            this[j] = tmp;
        }

        return this;
    };

    var snakeCaseObject = function (obj) {
        if (!$.isPlainObject(obj))
            return obj;

        _.each(obj, function (value, key) {
            var snakeCaseKey = key.toSnakeCase(),
                snakeCaseValue;

            if ($.isArray(value))
                snakeCaseValue = _.map(value, snakeCaseObject);
            else
                snakeCaseValue = snakeCaseObject(value);

            obj[snakeCaseKey] = snakeCaseValue;
            if (snakeCaseKey !== key)
                delete obj[key];
        });

        return obj;
    };

    $.ajax = _.wrap($.ajax, function (_ajax, url, options) {
        // If url is an object, simulate pre-1.5 signature
        if (typeof url === 'object') {
            options = url;
            url = undefined;
        }

        if (options && options.data) {
            options.data = snakeCaseObject(options.data);

            _.each(options.data, function (value, key) {
                if ($.isPlainObject(value))
                    options.data[key] = JSON.stringify(value);
            });
        }


        return _ajax.call(this, url, options);
    });
});
