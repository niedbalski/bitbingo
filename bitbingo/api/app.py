#!/usr/bin/env python
# -*- coding: utf-8 -*-

__author__ = 'Jorge Niedbalski R. <jnr@pyrosome.org>'

from bitbingo.common.app import app
from bitbingo.common.model import (Game,
                                   Player,
                                   Deposit,
                                   Token)

from flask.ext.login import (login_required, current_user, login_user,
                             logout_user)
from flask.ext.restful import (Resource, Api, marshal_with, fields,
                               marshal_with,
                               marshal, abort)
from flask.ext.restful import reqparse

import re
import json
import requests
import urllib


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


class FieldValueError(ValueError):

    def __init__(self, name, value):
        self.name = name
        self.value = value

        ValueError.__init__(self)

    def __str__(self):
        return json.dumps({
            'field': self.name,
            'value': self.value
        })


def wallet_is_valid(value, name, *args):
    wallet_regex = '^[13][1-9A-HJ-NP-Za-km-z]{26,33}'

    if not re.match(wallet_regex, value):
        raise FieldValueError(name,
                              "Bitcoin wallet format is incorrect")

    if Player.select().where(Player.wallet == value).count() > 0:
        raise FieldValueError(name,
                              "Bitcoin wallet already is used by another user")
    return value


class AuthResource(Resource):
    player_fields = {
        'id': fields.Integer,
        'created': fields.DateTime,
        'wallet': fields.String,
        'balance': fields.Float
    }

    @marshal_with(player_fields)
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("wallet",
                            type=str,
                            required=True)
        parser.add_argument("password",
                            type=str,
                            required=True)

        args = parser.parse_args()
        try:
            player = Player.login(args.get('wallet'), args.get('password'))
        except:
            return abort(404, message="Invalid provided credentials")

        login_user(player, remember=True)
        return player


class DepositResource(Resource):
    deposit_to_fields = {
        'ready': fields.String(attribute='paid'),
        'amount': fields.Float,
        'address': fields.String(attribute="input_address")
    }

    def generate_wallet(self, token):
        parameters = {
            "method": "create",
            "address": app.config.get("WALLET_ADDRESS"),
            "callback": "http://bitbi.io/api/v1/deposit?token=%s" % token.value
        }

        result = requests.get(
            "https://blockchain.info/api/receive?%s" %
            urllib.urlencode(parameters))

        if not result.status_code in (200, ):
            raise Exception('Invalid response code %s' % result.status_code)

        return result.json()

    @login_required
    @marshal_with(deposit_to_fields)
    def post(self, *args, **kwargs):
        parser = reqparse.RequestParser()
        parser.add_argument("amount",
                            type=str,
                            required=True)
        args = parser.parse_args()

        deposit = Deposit()
        deposit.amount = args.get('amount', 0.0)
        deposit.token = Token.random()
        deposit.player = current_user.id

        wallet = self.generate_wallet(deposit.token)

        deposit.fee_percent = wallet.get('fee_percent', 0.0)
        deposit.input_address = wallet.get('input_address')

        deposit.save()
        return deposit


class PlayerResource(Resource):
    player_fields = {
        'id': fields.Integer,
        'created': fields.DateTime,
        'wallet': fields.String,
        'balance': fields.Float
    }

    @marshal_with(player_fields)
    def get(self):
        if not current_user.is_authenticated():
            return app.login_manager.unauthorized()
        return current_user

    def delete(self):
        if not current_user.is_authenticated():
            return abort(404, "Player is not logged in")
        logout_user()
        return "User logged out"

    @marshal_with(player_fields)
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("wallet",
                            type=wallet_is_valid,
                            required=True)

        parser.add_argument("password",
                            type=str,
                            required=True)

        parser.add_argument("confirmation",
                            type=str,
                            required=True)

        parser.add_argument("email",
                            type=str,
                            default=None,
                            required=False)

        args = parser.parse_args()

        player = Player()
        player.wallet = args.get('wallet')
        player.set_password(args.get('password'))

        player.email = args.get('email')
        player.active = True

        player.save()
        login_user(player, remember=True)

        return player


class ResultsResource(Resource):

    #TODO: move this to a fields class
    results_fields = {
        'id': fields.Integer,
        'random': fields.Float,
        'created': fields.DateTime,
        'scheduled_at': fields.DateTime,
        'winner': fields.String,
        'amount': fields.Float,
        'players': fields.Float
    }

    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument("limit", type=int, default=0)
        args = parser.parse_args()

        bets = [bet for bet in Game.get_recent_bets(
            limit=args.get("limit", 0))]

        return marshal_and_count('results',
                                 bets,
                                 f=self.results_fields)

api.add_resource(ResultsResource, '/result')
api.add_resource(PlayerResource, '/player')
api.add_resource(DepositResource, '/deposit')
api.add_resource(AuthResource, '/player/login',
                 methods=['POST', 'DELETE'])
