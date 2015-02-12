define([
    'underscore'
], function (
    _
    ) {
        'use strict';

        var UniqueModel = function(Model, attrs, options) {
            var pool = UniqueModel.pool(Model);
            var key  = attrs && attrs[Model.prototype.idAttribute];

            if (!key)
                return new Model(attrs, options);

            var instance = UniqueModel.get(Model, key);
            if (!instance)
                pool[key] = new Model(attrs, options);
            else
                pool[key].set(attrs);

            return pool[key];
        };

        UniqueModel.pool = {};

        UniqueModel.pool = function (Model) {
            var pool = UniqueModel.pool[Model.__type__];
            if (!pool)
                throw new Error('Model not registered. Use UniqueModel.addType');
            return pool;
        };

        UniqueModel.get = function (Model, key) {
            return UniqueModel.pool(Model)[key];
        };

        UniqueModel.set = function (Model, model) {
            var pool = UniqueModel.pool(Model);
            var key = model && model.get(Model.prototype.idAttribute);

            if (!key)
                return model;

            var instance = UniqueModel.get(Model, key);
            if (!instance)
                instance = pool[key] = model;
            else
                instance.set(model.attributes);

            return instance;
        };

        UniqueModel.addType = function (name, obj) {
            if (obj.__type__ && UniqueModel.pool[name])
                return;

            obj.__type__ = name;
            UniqueModel.pool[name] = {};
        };

        UniqueModel.boundModel = function (Model) {
            var constructor = _.bind(UniqueModel, UniqueModel, Model);
            constructor.prototype = Model.prototype;
            return constructor;
        };

        return UniqueModel;
    }
);
