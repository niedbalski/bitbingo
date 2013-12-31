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
            url: '/api/v1/player',
            schema: {
                wallet: {
                    type: "Text",
                    validators: [ 'required' ]
                },
                password: {
                    type: "Password",
                    validators: [ 'required' ]
                },
                confirmation: {
                    type: "Password",
                    validators: [ 'required', function(value, form) {
                        errs = {};
                        if ( value != form.password ) {
                            errs = {
                                type: "confirmation",
                                message: "Password confirmation doesn't match"
                            }
                        }
                        if ( !_.isEmpty(errs) ) return errs;
                    } ]
                },
                email: {
                    type: "Text",
                    validators: [ 'email' ]
                }
            }
        });

        var SignupView = Backbone.View.extend({
            el: $('#content'),

            events: {
                "click #signup-submit": "submit"
            },

            initialize: function() {
                var self = this;

                _(this).bindAll('submit', 'render');

                this.player = new Player().fetch()
                this.player.success(function() {
                    router.navigate('', {trigger: true});
                });

                this.player.error(function() {
                    self.render();
                });
            },

            render: function() {
               this.form = new Backbone.Form({
                   model: new Player(),
                   template: _.template($('#signup-form').html()),
                   fieldClass: 'form-control'
                });

                $('#players').empty();

                $(this.el).empty();
                $(this.el).html(this.form.render().el);
            },

            submit: function(event) {
                event.preventDefault();

                var errors = this.form.commit();
                var self = this;

                if(_.isEmpty(errors) || _.isNull(errors) || _.isUndefined(errors)) {
                    var player = this.form.model.save();

                    player.success(function(model, response) {
                        router.navigate('', {trigger: true});
                    });

                    player.error(function(response) {
                        var fields = JSON.parse(response.responseJSON.message)
                        if ( !_.isEmpty(fields) ) {
                            self.form.fields[fields.field].setError(fields.value);
                        }
                    });

                }
            }
        });

        var LoginView = Backbone.View.extend({
            el: $('#content'),

            initialize: function() {
                var self = this;

                this.player = new Player().fetch()
                this.player.success(function() {
                    router.navigate('', {trigger: true});
                });

                this.player.error(function() {
                    self.render();
                });
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
