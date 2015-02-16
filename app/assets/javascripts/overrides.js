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

    var snakeCaseObject = function (obj) {
        if (!$.isPlainObject(obj))
            return obj;

        _.each(obj, function (value, key) {
            var snakeCaseKey = key.toSnakeCase();
            obj[snakeCaseKey] = snakeCaseObject(obj[key]);
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

        if (options && options.data)
            options.data = snakeCaseObject(options.data);

        return _ajax.call(this, url, options);
    });
});
