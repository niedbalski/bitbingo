#!/usr/bin/env python
# -*- coding: utf-8 -*-


__author__ = 'Jorge Niedbalski R. <jnr@pyrosome.org>'

import os

TEMPLATE_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                               '..', 'web', 'templates')

STATIC_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                             '..', 'web', 'assets')

DATABASE = {
    'name': 'bitbingo-development.db',
    'engine': 'peewee.SqliteDatabase',
}

DEBUG = True
SECRET_KEY = 'ssshhhh'