
require.config({
    baseUrl: "/assets/js/lib",
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
        'app': '../app',
        'jquery': "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min",
        'jquery.validator': "//cdnjs.cloudflare.com/ajax/libs/jquery-form-validator/2.1.27/jquery.form-validator.min",
        'underscore': "underscore-min",
        'backbone': "backbone-min",
        'backbone-forms': "backbone-forms/backbone-forms.min",
        'backbone-forms-list': "backbone-forms/editors/list.min",
        'backbone-forms-bootstrap': "backbone-forms/templates/bootstrap3"
    }

});


// Load the main app module to start the app
requirejs(["app/main"]);
