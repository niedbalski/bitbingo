define(['backbone', 'underscore', 'jquery'], function(Backbone, _, $) {

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

        initialize: function() {
            _(this).bindAll('render');
        },

        render: function(player) {

            this.form = new Backbone.Form({
                template: _.template($("#login-form").html()),
                model: player
            });

            $('#players').empty();

            $(this.el).empty();
            $(this.el).html(this.form.render().el);
        }
    });

    views.Signup = Backbone.View.extend({

        el: $('#content'),

        events: {
            "click #signup-submit": "submit"
        },

        initialize: function() {
            _(this).bindAll('submit', 'render');
        },

        render: function(player) {
            this.form = new Backbone.Form({
                model: player,
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
