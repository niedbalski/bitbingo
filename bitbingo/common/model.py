#!/usr/bin/env python
# -*- coding: utf-8 -*-

__author__ = 'Jorge Niedbalski R. <jnr@pyrosome.org>'

from bitbingo.common.app import db

from peewee import *
from peewee import create_model_tables

from werkzeug.security import generate_password_hash, check_password_hash
from uuid import uuid4 as generate_random_value

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
    balance = DecimalField(default=0.0)

    @classmethod
    def login(cls, wallet, password):
        player = cls.select().where(cls.wallet == wallet).get()
        if not cls.check_password(player.password, password):
            raise ValueError('Invalid Password provided')
        return player

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
    random = BigIntegerField(null=True)
    created = DateTimeField(default=datetime.datetime.now)
    scheduled_at = DateTimeField(default=datetime.timedelta(minutes=45))
    is_finished = BooleanField(default=False)
    amount = DecimalField(default=0.0)

    players = ForeignKeyField(Player,
                              related_name="games",
                              null=True)

    winner = ForeignKeyField(Player,
                             related_name="wins",
                             null=True)

    @classmethod
    def get_recent_bets(cls, limit=0):
        return cls.select().where(
            cls.is_finished == True).order_by(
                cls.scheduled_at.desc()).limit(limit)


class Token(db.Model):
    #Used to validate a deposit
    is_expired = BooleanField(default=False)
    created = DateTimeField(default=datetime.datetime.now)
    value = TextField()

    @classmethod
    def random(cls):
        obj = cls()
        obj.value = generate_random_value()
        obj.save()
        return obj


class Deposit(db.Model):
    paid = BooleanField(default=False)
    created = DateTimeField(default=datetime.datetime.now)
    updated = DateTimeField(default=datetime.datetime.now)
    amount = DecimalField(default=0)
    confirmations = IntegerField(default=0)
    transaction_hash = TextField(null=True)
    input_transaction_hash = TextField(null=True)
    input_address = TextField(null=True)
    destination_address = TextField(null=True)

    fee_percent = FloatField(default=0)

    player = ForeignKeyField(Player, related_name="deposits")
    token = ForeignKeyField(Token,
                            related_name="token")

class Payment(db.Model):
    paid = BooleanField(default=False)
    created = DateTimeField(default=datetime.datetime.now)
    amount = DecimalField(default=0)
    player = ForeignKeyField(Player,
                             related_name="payments",
                             null=True)


class Transaction(db.Model):
    kind = TextField(default='payment', choices=[
        ('payment', 'Payment'), ('deposit', 'Deposit')])

    amount = DecimalField(default=0.0)
    status = TextField()
    created = DateTimeField()

    payment = ForeignKeyField(Payment,
                              related_name="transactions", null=True)
    deposit = ForeignKeyField(Deposit,
                              related_name="transactions", null=True)

    @classmethod
    def log_payment(cls, payment):
        obj = cls()
        obj.kind = 'payment'
        obj.amount = payment.amount
        obj.status = payment.paid

        obj.transactions.append(obj)

        with db.transaction():
                obj.save()

    @classmethod
    def log_deposit(cls, deposit):
        obj = cls()
        obj.kind = 'deposit'
        obj.amount = deposit.amount
        obj.status = deposit.paid

        obj.transactions.append(obj)

        with db.transaction():
                obj.save()


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
          Player, Game]


def setup_database():
    try:
        create_model_tables(models, fail_silently=True)
    except Exception as ex:
        raise
    else:
        return db


db = setup_database()
