#!/usr/bin/env python
# -*- coding: utf-8 -*-

__author__ = 'Jorge Niedbalski R. <jnr@pyrosome.org>'

from bitbingo.common.model import Game
from bitbingo.common.app import app
from flask import render_template


@app.route('/')
def index():
    return render_template("index.html")
