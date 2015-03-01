require.config({
    baseUrl: 'assets',
    paths: {
        'jquery': 'vendor/jquery',
        'underscore': 'vendor/underscore',
        'backbone': 'vendor/backbone',
        'marionette': 'vendor/marionette',
        'bootstrap': 'vendor/bootstrap.min',
        'haml': 'vendor/haml',
        'text': 'vendor/text'
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
        }
    }
});
