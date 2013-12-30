#!/usr/bin/env python
# -*- coding: utf-8 -*-

__author__ = 'Jorge Niedbalski R. <jnr@pyrosome.org>'

import os

from flask import Flask, session
from flask_peewee.db import Database
from flask.ext.login import LoginManager

from importlib import import_module

app = Flask(__name__, static_url_path="/assets")
app.config.from_object("bitbingo.common.settings")
app.config.from_envvar("BITBINGO_SETTINGS", silent=True)

app.template_folder = app.config.get('TEMPLATE_FOLDER')
app.static_folder = app.config.get('STATIC_FOLDER')

db = Database(app)

#Login manager initialized
login_manager = LoginManager()
login_manager.init_app(app)

login_manager.login_view = "player.login"
login_manager.login_message = "Login is required to access this URL"


def application(environ=None, start_response=None):
    modules = ('api', 'web', )

    for module in modules:
        import_module('bitbingo.%s.app' % module)

    if not environ or not start_response:
        return app
    else:
        return app(environ, start_response)


