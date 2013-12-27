#!/usr/bin/env python
# -*- coding: utf-8 -*-

__author__ = 'Jorge Niedbalski R. <jnr@pyrosome.org>'


from bitbingo.common.model import Game
from bitbingo.common.app import app

from flask.ext.restful import (Resource, Api, marshal_with, marshal, abort)

api = Api(app, prefix="/api/v1")


class GameResource(Resource):
    def get(self):
        pass


api.add_resource(GameResource, '/game')
