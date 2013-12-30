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


#TODO: move this to a helper class
def marshal_and_count(n, r, f=None, **other):
    if not isinstance(r, list):
        r = [r]

    if f:
        r = map(lambda q: marshal(q, f), r)

    d = dict({'count': len(r), '%s' % n: r})
    for k, v in other.items():
        d.update({k: v})
    return d


class ResultsResource(Resource):

    #TODO: move this to a fields class
    results_fields = {
        'id': fields.Integer,
        'random': fields.Float,
        'created': fields.DateTime,
        'scheduled_at': fields.DateTime,
        'winner': fields.String,
        'amount': fields.Float(attribute='bet_amount'),
        'players': fields.Float
    }

    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument("limit", type=int, default=0)

        args = parser.parse_args()
        return marshal_and_count('results',
                                 [bet for bet in
                                  Game.get_recent_bets(limit=args.get("limit", 0))],
                                 f=self.results_fields)


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
api.add_resource(ResultsResource, '/result')
