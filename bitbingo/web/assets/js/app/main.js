define(["jquery",
        "underscore",
        "backbone",
        "backbone-forms",
        "backbone-forms-list",
        "backbone-forms-bootstrap",
       ], function($, _, Backbone ) {

           require(['app/models',
                    'app/views',
                    'app/controllers'],

                   function(models, views, controllers) {
                       Application = {};
                       Application.controllers = [
                           controllers.HomeController
                       ];

                       Application.initialize = function() {
                           $(document).ready(function() {
                               $('.nav li').click(function() {
                                   if(!$(this).hasClass('active')) {
                                       $('.nav .active').removeClass('active');
                                       $(this).addClass('active');
                                   }
                               });

                           });

                           _.each(this.controllers, function(controller) {
                               _.extend(controllers.BaseController, controller).initialize();
                           });
                       };

                       Application.initialize();
                   }
           );
});
