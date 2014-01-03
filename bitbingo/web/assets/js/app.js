
require.config({
    baseUrl: "/assets/js/",
    shim: {
        'jquery.cookie': {
            deps: [ 'jquery' ]
        },

        'jquery.pnotify': {
            deps: [ 'jquery' ]
        },

        'underscore': {
            exports: '_'
        },

        'backbone': {
            exports: "Backbone",
            deps: [ 'jquery', 'underscore' ]
        },

        'backbone-forms': {
            deps: [ 'backbone' ]
        },

        'bootstrap': {
            deps: [ 'jquery' ]
        }
    },



    paths: {
        'app': 'app',
        'jquery': "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min",
        'jquery.cookie': "lib/jquery.cookie.min",
        'jquery.pnotify': "lib/jquery.pnotify.min",
        'underscore': "lib/underscore-min",
        'bootstrap': "lib/bootstrap.min",
        'backbone': "lib/backbone-min",
        'backbone-forms': "lib/backbone-forms/backbone-forms.min",
        'backbone-forms-list': "lib/backbone-forms/editors/list.min",
        'backbone-forms-bootstrap': "lib/backbone-forms/templates/bootstrap3"
    }
});


// Load the main app module to start the app
requirejs(["app/main"]);
