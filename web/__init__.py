import os

import kata

config = os.environ.get('CONFIG_FILE', os.path.dirname(os.path.realpath(__file__)) + '/config.ini')
kata.initialize(config)

app = kata.config.app()

import web.routes
