#!/usr/bin/env python
# usage:
# $ gunicorn pinhole.common.app:application
from os import environ

bind = "%s:%s" % (environ.get("IPADDR", '127.0.0.1'),
                  environ.get("PORT", '11000'))
debug = True
workers = 1
max_requests = 1
worker_class = "sync"
timeout = 900000
