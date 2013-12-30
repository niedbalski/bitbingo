define(["jquery",
        "underscore",
        "backbone",
        "backbone-forms",
        "backbone-forms-list",
        "backbone-forms-bootstrap",
        "jquery.validator"
       ], function($, _, Backbone, validator) {

    $(document).ready(function() {

        var Game = Backbone.Model.extend({
            initialize: function() {}
        });

        var Games = Backbone.Collection.extend({
            model: Game,

            initialize: function() {
                this.limit = 10;
            },

            url: function() {
                return '/api/v1/result?limit=' + encodeURIComponent(this.limit);
            },

            parse: function(response) {
                return response.results;
            }
        });

        var GamesView = Backbone.View.extend({
            el: $("#players"),
            template: _.template($('#played-games').html()),

            initialize: function() {
                _(this).bindAll('render', 'loading');

                this.collection.bind('request', this.loading);
                this.collection.bind('sync', this.render);

                this.collection.fetch();
            },

            loading: function() {
                $(this.el).append('<i class="fa fa-spinner fa-spin"></i> Loading game results from server');
            },

            render: function() {
                $('#content').empty();

                $(this.el).empty();
                $(this.el).html(this.template({games: this.collection.toJSON()}));
            }
        });

        var Player = Backbone.Model.extend({
            url: '/api/v1/player'
        });

        var SignupView = Backbone.View.extend({

            el: $('#content'),

            events: {
                "click #signup-submit": "onSubmit"
            },

            onSubmit: function(event) {
                event.preventDefault();
                var errors = this.form.validate();

                console.log(this.form.getValue());
                console.log(errors);

                if(errors.length > 0) {
                    _.each(errors, function(message, field) {
                        console.log(message, field);
                    });
                }
            },

            initialize: function() {
                this.render();
            },

            render: function() {
                _(this).bindAll('onSubmit');

               this.form = new Backbone.Form({
                   template: _.template($("#signup-form").html()),
                   model: new Player()
                }).render();

                console.log(this.form);

                $('#players').empty();

                $(this.el).empty();
                $(this.el).html(this.form.render().el);
            }
        });

        var LoginView = Backbone.View.extend({
            el: $('#content'),

            initialize: function() {
                this.render();
            },

            render: function() {
                //_(this).bindAll();
               this.form = new Backbone.Form({
                   template: _.template($("#login-form").html()),
                   model: new Player()
                });

                $('#players').empty();

                $(this.el).empty();
                $(this.el).html(this.form.render().el);
            }
        });

        var AppRouter = Backbone.Router.extend({
            routes: {
                '': function() {
                    var AppView = new GamesView({
                        collection: new Games()
                    });
                },

                'signup': function() {
                    new SignupView();
                },

                'login': function() {
                    new LoginView();
                }

            }
        });


        var router = new AppRouter();
        Backbone.history.start();

        // $.validate({
        //     form: "#signup, #login",
        //     validateOnBlur : false,
        //     errorMessagePosition : 'top',
        //     modules: 'security'
        // });
    });

});
