#!/usr/bin/env python
# -*- coding: utf-8 -*-

__author__ = 'Jorge Niedbalski R. <jnr@pyrosome.org>'

import os
import json
import logging

from bitbingo.common.model import *

FIXTURES_PATH = os.path.join(os.path.dirname(
    os.path.abspath(__file__)), 'fixtures')


def load_fixture(*args, **kwargs):
    (name) = (args[0])

    def wrapper(callback):
        rollback = kwargs.get('rollback', False)
        filename = os.path.join(FIXTURES_PATH, name + '.json')
        with open(filename) as fd:
            fixtures = json.load(fd)

        r = []
        for fixture in fixtures:
            obj = globals()[fixture['model']].create(**fixture)
            r.append(obj)
        f = callback(r)
        if rollback:
            for q in r:
                q.delete_instance()
        return f

    return wrapper


@load_fixture('initial', rollback=False)
def initial_fixture(objects):
    print len(objects), objects
