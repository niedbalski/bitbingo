define(['backbone', 'underscore', 'jquery', 'jquery.cookie', 'jquery.pnotify'],
       function(Backbone, _, $) {

    views = {};
    views.PlayedGames = Backbone.View.extend({
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
            if ( ! $('#content').is(':empty') ) {
                $('#content').empty();
            }

            $(this.el).empty();
            $(this.el).html(this.template({
                games: this.collection.toJSON()
            }));
        }
    });


    views.Login = Backbone.View.extend({
        el: $('#content'),

        events: {
            "click #login-submit": "submit"
        },

        initialize: function() {
            _(this).bindAll('render', 'submit');
            $('.badge-container').empty();

        },

        render: function(controller, player) {
            this.controller = controller;

            _(this).bindAll('submit');

            this.form = new Backbone.Form({
                fieldClass: 'form-control',
                template: _.template($("#login-form").html()),
                //Schema
                schema: {
                    wallet: {
                        type:'Text',
                        validators: ['required'],
                        help: "Enter your bitcoin wallet address"
                    },
                    password: {
                        type: 'Password',
                        validators: ['required'],
                        help: "Enter your account password"
                    }
                }
            });

            $('#players').empty();

            $(this.el).empty().html(this.form.render().el);
        },

        submit: function(event) {
            event.preventDefault();

            var errors = this.form.validate();
            var self = this;

            if(_.isEmpty(errors) || _.isNull(errors) || _.isUndefined(errors)) {
                $.ajax({
                    url: '/api/v1/player/login',
                    type: 'POST',
                    dataType: 'json',
                    data: this.form.getValue()
                }).done(function(player) {
                    $.cookie('player', JSON.stringify(player));
                    //Todo: bind this to the event bus :)
                    $.pnotify({
                        title: 'Welcome back, friend!',
                        text: 'Just add some Bitcoins and start playing!',
                        type: 'success',
                        shadow: false
                    });
                    self.controller.router.navigate('', {trigger: true});
                }).fail(function(){
                    console.warn('Login Error');
                    self.form.fields['password'].setError(
                        "Invalid provided credentials. Try again");
                });

            }
        }

    });

    views.Signup = Backbone.View.extend({
        el: $('#content'),

        events: {
            "click #signup-submit": "submit"
        },

        initialize: function() {
            _(this).bindAll('submit', 'render');
            $('.badge-container').empty();

        },

        render: function(controller, player) {
            this.controller = controller;

            _(this).bindAll('submit');

            this.form = new Backbone.Form({
                model: player,
                template: _.template($('#signup-form').html()),
                fieldClass: 'form-control'
            });

            $('#players').empty();
            $('.badge-container').empty();

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
                    $.cookie('player', JSON.stringify(model));
                    self.controller.router.navigate('', {trigger: true});
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

    views.Home = Backbone.View.extend({

    });

    views.Transactions = Backbone.View.extend({
        el: $('#content'),

        initialize: function() {
        },

        render: function() {
            var transactions = new Transaction().fetch();
        }
    });

    return views;
});
