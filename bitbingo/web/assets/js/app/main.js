define(["jquery",
        "jquery.model",
        "jquery.routes",
        "Handlebars",
        "RubberDuck"], function($, model, routes, Handlebars, RubberDuck) {

    $(document).ready(function() {

        //Rubberduck the world!! cuek, cuek, cueeeeeeeeeeeeeeeeeeeeeeek
        window['RubberDuck'] = RubberDuck;

        var app = new RubberDuck.app({
            name: 'BitBingoApp',
            path: 'assets/js/app/',
            controllers: [ 'test' ]
        });

        app.done(function(app) {
            app.run();
        });
    });

});
