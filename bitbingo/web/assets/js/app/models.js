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

    return models;
});
