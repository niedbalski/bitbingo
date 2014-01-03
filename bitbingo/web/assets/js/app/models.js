define(['backbone', 'underscore'], function(Backbone, _) {

    var models = {};

    models.Game = Backbone.Model.extend({
        initialize: function() {}
    });

    models.Games = Backbone.Collection.extend({
        model: models.Game,

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

    models.Transaction = Backbone.Model.extend({
        url: '/api/v1/transaction'
    });

    models.Player = Backbone.Model.extend({
        url: '/api/v1/player',
        schema: {
            wallet: {
                type: "Text",
                validators: [ 'required' ],
                help: "Enter a valid bitcoin wallet address"
            },

            password: {
                type: "Password",
                validators: [ 'required' ],
                help: "Enter an alphanumeric value"
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
                } ],
                help: "Re-enter your password"
            },

            email: {
                type: "Text",
                validators: [ 'email' ],
                help: "Optional: Your e-mail address"
            }
        }
    });

    return models;
});
