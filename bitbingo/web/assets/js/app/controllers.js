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
                            routes[k] = self.checkIsLogged.bind({
                                caller: self.routes[k].handler
                            }, self);
                        } else {
                            routes[k] = self.routes[k].handler.bind(self);
                        }
                    });
                }
            }

            var r = Backbone.Router.extend({
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

        checkIsLogged: function(ctx) {
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
                return ctx.loginRequired();
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

                'balance': {
                    loginRequired: true,
                    handler: this.balance
                },

                'login': {
                    loginRequired: false,
                    handler: this.login
                },

                'support': {
                    loginRequired: true,
                    handler: this.support
                },

                'signup': {
                    loginRequired: false,
                    handler: this.signup
                },

                'logout': {
                    loginRequired: true,
                    handler: this.logout
                }
            };
        },

        transactions: function(player) {
            this.router.navigate('', {
                trigger: true
            });
        },

        balance: function(player) {
            var navigation = new views.Navigation({
                model: player
            });

            var badge = new views.Badge({
                model: player
            });

            var balance = new views.Balance({
                model: player
            });

            badge.render();
        },

        support: function(player) {
            console.log(player);
        },

        logout: function(player) {
            var playerisLogged = this.isLogged();

            if ( _.isNull(player) || _.isUndefined(player) || player === false ) {
                return this.router.navigate('', {
                    trigger: true
                });
            }

            //remove the player cookie
            $.removeCookie('player');

            if ( $('.navigation-container .nav li').length > 1 ) {
                $('.home-tab').parent().siblings('li').not(this).remove();
            }

            var self = this;

            //Todo: bind this model to the view ...
            player = new models.Player();
            player.destroy({
                success: function(model, response) {
                    $.pnotify({
                        title: 'See you later',
                        text: 'You have been logged out successfully.',
                        type: 'success'
                    });

                    self.router.navigate('', {
                        trigger: true
                    });
                }
            });
        },

        index: function(){
            //This must be binded to the view!!!!!!!!!!!! and model
            var player = this.isLogged();

            $('body').on('touchstart.dropdown', '.dropdown-menu', function (e) {
                e.stopPropagation();
            });

            var navigation = new views.Navigation({
                model: player
            });

            var badge = new views.Badge({
                model: player
            });

            var games = new views.PlayedGames({
                collection: new models.Games()
            });

            $('#content').hide();
            $('#game').show();
            $('#players').show();

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
