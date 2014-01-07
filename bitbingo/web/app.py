#!/usr/bin/env python
# -*- coding: utf-8 -*-

__author__ = 'Jorge Niedbalski R. <jnr@pyrosome.org>'

from bitbingo.common.model import Game, Player
from bitbingo.common.app import app, login_manager

from flask import (render_template,
                   redirect,
                   flash,
                   url_for,
                   request)

from flask.views import MethodView
from flask.ext.login import (login_required, current_user, login_user,
                             logout_user)

from flask_wtf import Form
from wtforms import (StringField,
                     TextField,
                     PasswordField,
                     BooleanField,
                     validators)


@login_manager.user_loader
def load_user(player_id):
    return Player.select().where(Player.id == player_id).get()


@app.errorhandler(500)
def not_found(e):
    return render_template('500.html'), 500


@app.errorhandler(404)
def not_found(e):
    return render_template('404.html'), 404


class LoginForm(Form):
    wallet = StringField('Bitcoin Wallet address',
                         validators=[validators.required()])
    password = PasswordField('Password',
                             validators=[validators.required()])
    remember = BooleanField('Remember Me', false_values=('false', ''))


class SignupForm(Form):
    wallet = StringField('Bitcoin Wallet address',
                         validators=[validators.required()])
    password_confirmation = PasswordField('New Password',
                                          validators=[
                                              validators.required(),
                                              validators.EqualTo('password',
                                                                message='Passwords mismatch')
                                          ])

    password = PasswordField('Repeat Password')
    email = TextField('E-mail', validators=[validators.Email()])


class Login(MethodView):

    def get(self):
        if current_user.is_authenticated():
            return redirect(url_for("index"))

        form = LoginForm()
        return render_template("login.html", form=form)

    def post(self):
        form = LoginForm()
        if form.validate_on_submit():
            try:
                player = Player.login(form)
            except:
                return render_template("login.html", form=form, invalid=True)
            else:
                login_user(player, remember=True)
                return redirect(request.args.get("next") or url_for("index"))

        return render_template("login.html", form=form)


class Logout(MethodView):

    def get(self):
        if current_user.is_authenticated():
            logout_user()
        return redirect(url_for("index"))


class Signup(MethodView):

    def get(self):
        if current_user.is_authenticated():
            return redirect(url_for("index"))

        form = SignupForm()
        return render_template("signup.html", form=form)

    def post(self):
        form = SignupForm()
        if form.validate_on_submit():
            player = Player()
            player.wallet = form.wallet.data
            player.email = form.email.data
            player.active = True

            player.set_password(form.password.data)
            player.save()

            login_user(player, remember=True)
            flash("User signup successfully...")
            return redirect(request.args.get("next") or url_for("index"))

        return render_template("signup.html", form=form)


class Index(MethodView):

    def get(self):
        return render_template("index.html",
                               player=current_user)


class Support(MethodView):
    decorators = [login_required]

    def get(self):
        return render_template("support.html")


class Transactions(MethodView):
    decorators = [login_required]

    def get(self):
        return render_template("transactions.html")


#Routes for players
# app.add_url_rule('/player/signup',
#                  view_func=Signup.as_view('player.signup'),
#                  methods=['GET', 'POST'])

# app.add_url_rule('/player/login',
#                  view_func=Login.as_view('player.login'),
#                  methods=['GET', 'POST'])

app.add_url_rule('/player/logout',
                 view_func=Logout.as_view('player.logout'))

app.add_url_rule('/player/support',
                 view_func=Support.as_view('player.support'))

app.add_url_rule('/', view_func=Index.as_view('index'))

app.add_url_rule('/player/transactions',
                 view_func=Transactions.as_view('player.transactions'))
