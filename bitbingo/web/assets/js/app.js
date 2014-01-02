
require.config({
    baseUrl: "/assets/js/",
    shim: {
        'jquery.validator': {
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
        }
    },

    paths: {
        'app': 'app',
        'jquery': "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min",
        'jquery.validator': "//cdnjs.cloudflare.com/ajax/libs/jquery-form-validator/2.1.27/jquery.form-validator.min",
        'underscore': "lib/underscore-min",
        'backbone': "lib/backbone-min",
        'backbone-forms': "lib/backbone-forms/backbone-forms.min",
        'backbone-forms-list': "lib/backbone-forms/editors/list.min",
        'backbone-forms-bootstrap': "lib/backbone-forms/templates/bootstrap3"
    }
});


// Load the main app module to start the app
requirejs(["app/main"]);
