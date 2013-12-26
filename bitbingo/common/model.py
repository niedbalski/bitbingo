#!/usr/bin/env python
# -*- coding: utf-8 -*-

__author__ = 'Jorge Niedbalski R. <jnr@pyrosome.org>'

from bitbingo.common.app import db
from peewee import *

import datetime


class BaseModel(db.Model):
    class Meta:
        database = db


class Player(BaseModel):
    created = DateTimeField(default=datetime.datetime.now)
    wallet = TextField()
    password = TextField(default=False)
    email = TextField(default=False)


class Game(BaseModel):
    random = BigIntegerField()
    created = DateTimeField(default=datetime.datetime.now)
    scheduled_at = DateTimeField(default=datetime.timedelta(minutes=45))
    is_finished = BooleanField(default=False)
    winner = ForeignKeyField(Player,
                             related_name="wins",
                             null=True)


class PlayerGame(BaseModel):
    player = ForeignKeyField(Player)
    game = ForeignKeyField(Game)


class Deposit(BaseModel):
    is_ready = BooleanField(default=False)
    created = DateTimeField(default=datetime.datetime.now)
    updated = DateTimeField(default=datetime.datetime.now)
    value = DecimalField()
    confirmations = IntegerField(default=0)
    transaction_hash = TextField()
    input_transaction_hash = TextField()
    destination_address = TextField()

    token = ForeignKeyField(Token,
                            related_name="token")


class Payment(BaseModel):
    paid = BooleanField(default=False)
    created = DateTimeField(default=datetime.datetime.now)
    value = DecimalField()
    player = ForeignKeyField(Player,
                             related_name="payments",
                             null=True)


class Token(BaseModel):
    #Used to validate a deposit
    is_expired = BooleanField(default=False)
    created = DateTimeField(default=datetime.datetime.now)
    value = TextField()

    @classmethod
    def generate_token(cls):
        pass


class Configuration(BaseModel):
    # payment_daily , False
    # payment_weekly, False
    # notify_all_by_email , True
    created = DateTimeField(default=datetime.datetime.now)
    updated = DateTimeField(default=datetime.datetime.now)
    name = TextField()
    value = TextField()
    player = ForeignKeyField(Player,
                             related_name="options",
                             null=True)
