require.config({
    baseUrl: '/assets',
    paths: {
        'bootstrap': 'vendor/bootstrap.min',
        'haml': 'vendor/haml',
        'sinon': 'sinon-1.14.1'
    },
    shim: {
        'jquery': {
            exports: '$'
        },
        'underscore': {
            exports: '_'
        },
        'backbone': {
            deps: ['underscore'],
            exports: 'Backbone'
        },
        'marionette': {
            deps: ['backbone'],
            exports: 'Marionette'
        },
        'bootstrap': {
            deps: ['jquery']
        },
        'haml': {
            exports: 'Haml'
        },
        'mocha': {
            deps: ['jquery', 'chai'],
            init: function() {
                this.mocha.setup('bdd');
                return this.mocha;
            }
        }
    }
});
