#!/usr/bin/env python
# -*- coding: utf-8 -*-

__author__ = 'Jorge Niedbalski R. <jnr@pyrosome.org>'

from bitbingo.common.app import db

from peewee import *
from peewee import create_model_tables

from werkzeug.security import generate_password_hash, check_password_hash

import datetime


class BaseModel(db.Model):
    class Meta:
        database = db


class Player(db.Model):
    created = DateTimeField(default=datetime.datetime.now)
    wallet = TextField(index=True, unique=True)
    password = TextField(default=False)
    email = TextField(default=False)
    active = BooleanField(default=False)

    @classmethod
    def login(cls, form):
        customer = cls.select().where(cls.wallet == form.wallet.data).get()
        if not cls.check_password(customer.password, form.password.data):
            raise Exception('Invalid Password provided')
        return customer

    def set_password(self, password):
        self.password = generate_password_hash(password)

    @classmethod
    def check_password(cls, password, provided):
        return check_password_hash(password, provided)

    def is_authenticated(self):
        return True

    def get_id(self):
        return self.id

    def is_active(self):
        return self.active

    def is_anonymous(self):
        return False


class Game(db.Model):
    random = BigIntegerField()
    created = DateTimeField(default=datetime.datetime.now)
    scheduled_at = DateTimeField(default=datetime.timedelta(minutes=45))
    is_finished = BooleanField(default=False)
    winner = ForeignKeyField(Player,
                             related_name="wins",
                             null=True)


class Token(db.Model):
    #Used to validate a deposit
    is_expired = BooleanField(default=False)
    created = DateTimeField(default=datetime.datetime.now)
    value = TextField()

    @classmethod
    def generate_token(cls):
        pass


class PlayerGame(db.Model):
    player = ForeignKeyField(Player)
    game = ForeignKeyField(Game)


class Deposit(db.Model):
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


class Payment(db.Model):
    paid = BooleanField(default=False)
    created = DateTimeField(default=datetime.datetime.now)
    value = DecimalField()
    player = ForeignKeyField(Player,
                             related_name="payments",
                             null=True)


class Configuration(db.Model):
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


models = [Configuration, Token,
          Payment, Deposit,
          Player, Game,
          PlayerGame]


def setup_database():
    try:
        create_model_tables(models, fail_silently=True)
    except Exception as ex:
        raise
    else:
        return db


db = setup_database()
