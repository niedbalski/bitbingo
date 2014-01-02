define(['backbone', 'underscore', 'jquery', 'app/views', 'app/models'],
       function(Backbone, _, $, views, models) {

    controllers = {};
    controllers.BaseController = {
        routes: {},

        initialize: function() {
            var self = this;

            if(_.has(this, 'routes')) {
                this.routes = this.routes();
                if(!_.isEmpty(this.routes)) {
                    _.each(_.keys(this.routes), function(k) {
                        if( _.has(self.routes[k], 'loginRequired') &&
                            self.routes[k].loginRequired === true) {
                            self.routes[k] = self.checkLogin.bind(_.extend(self,
                                                                       { original: k }));
                        } else {
                            self.routes[k] = self.routes[k].handler;
                        }
                    });
                }
            }

            r = Backbone.Router.extend({
                routes:this.routes
            });

            this.router = new r();
            Backbone.history.start();
        },

        checkLogin: function() {
            var self = this;

            player = new models.Player().fetch();
            player.success(function() {
                if(_.has(this , 'original')) {
                    return this.routes[this.original].handler(player);
                }
            });

            player.error(function() {
                return self.loginRequired();
            });
        },

        defaultRoute: function() {
            this.router.navigate('', {
                trigger: true
            });
        },

        loginRequired: function() {
            if(_.has(this.routes, 'login')) {
                this.router.navigate('login', {
                    trigger: true
                });
            }
        }
    };

    controllers.HomeController = {
        routes: function() {
            return {
                '': {
                    loginRequired: false,
                    handler: this.index
                },

                'required': {
                    loginRequired: true,
                    handler: this.private
                },

                'login': {
                    loginRequired: false,
                    handler: this.login
                },

                'signup': {
                    loginRequired: false,
                    handler: this.signup
                },

                "*actions" : {
                    loginRequired: false,
                    handler: this.index
                }
            }
        },

        private: function(player) {
            console.debug(player);
        },

        index: function(){
            var games = new models.Games();
            var view = new views.PlayedGames({
                collection: games
            });
        },

        signup: function() {
            var player = new models.Player();
            var view = new views.Signup();

            return view.render(player);
        },

        login: function() {
            var player = new models.Player();
            var view = new views.Login();

            return view.render(player);
        }
    };

    return controllers;
});
