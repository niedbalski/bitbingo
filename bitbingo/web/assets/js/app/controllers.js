define(['backbone',
        'underscore',
        'jquery',
        'jquery.cookie',
        'jquery.pnotify',
        'bootstrap',
        'app/views',
        'app/models'],

       function(Backbone, _, $, cookies, notify, bootstrap, views, models) {

    controllers = {};
    controllers.BaseController = {
        routes: {},

        initialize: function() {
            var self = this;

            if(_.has(this, 'routes')) {
                this.routes = this.routes();

                routes = {};

                if(!_.isEmpty(this.routes)) {
                    _.each(_.keys(this.routes), function(k) {
                        if(self.routes[k].loginRequired === true) {
                            routes[k] = self.playerIsLogged.bind({
                                caller: self.routes[k].handler
                            }, self);
                        } else {
                            routes[k] = self.routes[k].handler.bind(self);
                        }

                        // if(self.routes[k].loginRequired === true) {
                        //     self.routes[k] = self.checkLogin.bind(
                        //         _.extend(self, {
                        //             original: self.routes[k].handler
                        //         }));


                        //     console.log(self.routes[k]);
                        //     console.log(self.routes[k].original);

                        // } else {
                        //     self.routes[k] = self.routes[k].handler.bind(self);
                        // }
                    });
                }
            }

            r = Backbone.Router.extend({
                routes:routes
            });

            this.router = new r();
            Backbone.history.start();
        },

        isLogged: function() {
            var player = $.cookie('player');
            if ( !_.isUndefined(player) ) {
                return JSON.parse(player);
            }
            return false;
        },

        playerIsLogged: function(ctx) {
            var player = ctx.isLogged();

            if ( player ) {
                return this.caller.apply(ctx, [player]);
            }
            var self = this;

            player = new models.Player().fetch();
            player.success(function(player) {
                $.cookie('player', JSON.stringify(player));
                return self.caller.apply(ctx, [player]);
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

                'transactions': {
                    loginRequired: true,
                    handler: this.transactions
                },

                'login': {
                    loginRequired: false,
                    handler: this.login
                },

                'signup': {
                    loginRequired: false,
                    handler: this.signup
                },

                'logout': {
                    loginRequired: true,
                    handler: this.logout
                }

                // "*actions" : {
                //      loginRequired: false,
                //      handler: this.index
                // }
            }
        },

        transactions: function(player) {
            this.router.navigate('', {
                trigger: true
            });
        },

        logout: function(player) {
            $.removeCookie('player');

            //Todo: bind this model to the view ...
            player = new models.Player();
            player.fetch().success(function(response) {
                player.destroy({
                    success: function(model, response) {
                        $.pnotify({
                            title: 'See you later',
                            text: 'You have been logged out successfully.',
                            type: 'success'
                        });
                        if ( $('.navigation-container .nav li').length > 1 ) {
                            $('.home-tab').parent().siblings('li').not(this).remove();
                        }
                    }
                });
            });

            this.router.navigate('', {
                trigger: true
            });
        },

        index: function(){

            //This must be binded to the view!!!!!!!!!!!! and model
            var player = this.isLogged();
            var navigation = _.template($('#navigation-section').html());

            $('body').on('touchstart.dropdown', '.dropdown-menu', function (e) {
                e.stopPropagation();
            });

            if ( $('.navigation-container .nav li').length == 1 ) {
                $('.navigation-container .nav').append(
                    navigation({
                        player: player
                    })
                );
            }

            var badge = _.template($('#badge-section').html());
            $('.badge-container').html(
                badge({
                    player: player
                })
            );

            var games = new models.Games();
            var gamesView = new views.PlayedGames({
                collection: games
            });
        },

        signup: function() {
            var player = new models.Player();
            var view = new views.Signup();

            return view.render(this, player);
        },

        login: function() {
            var player = new models.Player();
            var view = new views.Login();

            return view.render(this, player);
        }
    };

    return controllers;
});
