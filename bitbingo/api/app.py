#!/usr/bin/env python
# -*- coding: utf-8 -*-

__author__ = 'Jorge Niedbalski R. <jnr@pyrosome.org>'

import re

from bitbingo.common.model import Game, Player
from bitbingo.common.app import app

from flask.ext.restful import (Resource, Api, marshal_with, fields,
                               marshal_with,
                               marshal, abort)
from flask.ext.restful import reqparse

api = Api(app, prefix="/api/v1")


class GameResource(Resource):
    def get(self):
        pass


class WalletValidationResource(Resource):

    wallet_validation = {
        'valid': fields.Boolean,
        'message': fields.String
    }

    wallet_regex = '^[13][1-9A-HJ-NP-Za-km-z]{26,33}'

    @marshal_with(wallet_validation)
    def post(self):
        #@Todo: move this to a parameters class
        parser = reqparse.RequestParser()
        parser.add_argument('wallet',
                            type=str,
                            required=True,
                            help="Specify wallet parameter")

        args = parser.parse_args()
        wallet = args.get('wallet')

        valid_address = not Player.select().where(
            Player.wallet == wallet).count() > 0

        message = "Wallet is OK"
        if not valid_address:
            message = "Wallet is already in use by another user"

        if not re.match(self.wallet_regex, wallet):
            message = "Invalid bitcoin wallet address"
            valid_address = False

        return {
            'valid': valid_address,
            'message': message
        }

api.add_resource(WalletValidationResource, '/wallet')
api.add_resource(GameResource, '/game')
