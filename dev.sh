#!/bin/bash

./venv/bin/gunicorn --bind 127.0.0.1:9001 web:app
