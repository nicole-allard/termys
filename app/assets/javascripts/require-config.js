require.config({
    baseUrl: '/assets',
    paths: {
        'bootstrap': 'vendor/bootstrap.min',
        'haml': 'vendor/haml'
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
            exports: 'mocha'
        }
    }
});
