#!/usr/bin/env python
# -*- coding: utf-8 -*-

__author__ = 'Jorge Niedbalski R. <jnr@pyrosome.org>'

from bitbingo.common.model import Game
from bitbingo.common.app import app, login_manager

from flask import render_template, redirect
from flask.views import MethodView

from flask.ext.login import (login_required, current_user, login_user,
                             logout_user)

from flask_wtf import Form
from wtforms import (StringField,
                     TextField,
                     PasswordField,
                     validators)


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


class SignupForm(Form):
    wallet = StringField('Bitcoin Wallet address',
                         validators=[validators.required()])
    password = PasswordField('New Password',
                             validators=[validators.required(),
                             validators.EqualTo('confirm',
                                                message='Passwords mismatch')])
    confirm = PasswordField('Repeat Password')
    email = TextField('E-mail', validators=[validators.Email()])


class Login(MethodView):

    def get(self):
        form = LoginForm()
        return render_template("login.html", form=form)

    def post(self):
        form = LoginForm()
        if form.validate_on_submit():
            return "You are the master of the muppets", 200
        return render_template("login.html", form=form)


class Signup(MethodView):

    def get(self):
        form = SignupForm()
        return render_template("signup.html", form=form)

    def post(self):
        form = SignupForm()
        if form.validate_on_submit():
            return "Registered succesfully", 200
        return render_template("signup.html", form=form)


class Index(MethodView):

    #decorators = [login_required]

    def get(self):
        class Player(object):
            pass

        player = Player()
        player.balance = 1444.5
        player.logged_in = True

        return render_template("index.html",
                               player=player)


class Support(MethodView):

    decorators = [login_required]

    def get(self):
        return render_template("support.html")


class Transactions(MethodView):

    decorators = [login_required]

    def get(self):
        return render_template("transactions.html")


#Routes for players
app.add_url_rule('/player/signup',
                 view_func=Signup.as_view('player.signup'),
                 methods=['GET', 'POST'])

app.add_url_rule('/player/login',
                 view_func=Login.as_view('player.login'),
                 methods=['GET', 'POST'])

app.add_url_rule('/player/transactions',
                 view_func=Login.as_view('player.transactions'))

app.add_url_rule('/player/support',
                 view_func=Login.as_view('player.support'))

app.add_url_rule('/player/logout',
                 view_func=Login.as_view('player.logout'))

app.add_url_rule('/', view_func=Index.as_view('index'))
