define([
], function (
) {
    String.prototype.toCamelCase = function () {
        return this.replace(/(\_[a-z])/g, function($1){return $1.toUpperCase().replace('_','');});
    };
});
