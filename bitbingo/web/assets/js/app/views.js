define(['backbone', 'underscore', 'jquery', 'jquery.cookie', 'jquery.pnotify', 'app/models'],
       function(Backbone, _, $, cookies, pnotify, models) {

    views = {};
    views.Balance = Backbone.View.extend({
        el: $('#content'),

        template: _.template($("#account-container").html()),

        events: {
            "click #deposit-btn": "deposit"
        },

        initialize: function() {
            $('#balance-btn').remove();
            $('#players').empty();
            $('#game').empty();

            $(this.el).empty();
            $(this.el).html(
                this.template({
                    player: this.model
                })
            );

            this.form = new Backbone.Form({
                model: new models.Deposit(),
                template: _.template($('#deposit-form').html()),
                fieldClass: 'form-control'
            });

            $('#deposit').html(
                this.form.render().el
            );

            //$(this.el).show();
        },

        deposit: function(event) {
            event.preventDefault();
            var errors = this.form.commit({ validate: true });

            if(_.isEmpty(errors) || _.isNull(errors) || _.isUndefined(errors)) {
                var deposit = this.form.model.save();
                deposit.success(function(model, response) {
                    $.pnotify({
                        title: 'Your deposit is pending',
                        text: 'Please transfer  <strong>' + model.amount + '</strong> BTC to the following wallet address: <br><strong>' + model.address + '</strong>',
                        type: 'info',
                        icon: 'picon picon-document-encrypt'
                    });
                });
            }

            console.log(errors);

            // var errors = this.form.commit({validate: true});
            // console.log(errors);

            // if ( ! errors ) {
            //     var deposit = self.form.model.save();

            // }
        }
    });

    views.Badge = Backbone.View.extend({
        el: $("#badge-container"),
        template: _.template($("#badge-section").html()),

        initialize: function() {
            _(this).bindAll('render');
            this.render();
        },

        render: function() {
            $(this.el).html(this.template({
                player: this.model
            }));
        }
    });

    views.Navigation = Backbone.View.extend({
        el: $('#navitation-container'),
        template: _.template($('#navigation-section').html()),

        initialize: function() {
            if ( $('.navigation-container .nav li').length == 1 ) {
                $('.navigation-container .nav').append(
                     this.template({
                        player: this.model
                    })
                );
            }
        }
    });

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
            $(this.el).append(
                '<i class="fa fa-spinner fa-spin"></i> Loading game results ...');
        },

        render: function() {
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
            $(this.el).show();
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
                    self.form.fields.password.setError(
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
                    var fields = JSON.parse(response.responseJSON.message);

                    if ( !_.isEmpty(fields) ) {
                        self.form.fields[fields.field].setError(fields.value);
                    }
                });
            }
        }
    });

    return views;
});
