
require.config({
    baseUrl: "/assets/js/lib",
    shim: {
        'jquery.routes': {
            deps: [ 'jquery' ]
        },

        'jquery.model': {
            deps: [ 'jquery' ]
        },

        'RubberDuck': {
            requires: [ 'jquery',
                        'jquery.routes',
                        'jquery.model',
                        'Hanblebars' ],

            exports: 'RubberDuck'
        },
    },

    paths: {
        'app': '../app',
        'jquery': "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min",
        'jquery.model': 'jquery.model.min',
        'jquery.routes': 'jquery.routes',
        'Handlebars': 'handlebars',
        'RubberDuck': 'RubberDuck-0.1.7.min'
    }

});


// Load the main app module to start the app
requirejs(["app/main"]);
