
require.config({
    baseUrl: "/assets/js/lib",
    shim: {
        'jquery.validator': {
            deps: [ 'jquery' ]
        }
    },

    paths: {
        'app': '../app',
        'jquery': "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min",
        'jquery.validator': "//cdnjs.cloudflare.com/ajax/libs/jquery-form-validator/2.1.27/jquery.form-validator.min",
    }

});


// Load the main app module to start the app
requirejs(["app/main"]);
