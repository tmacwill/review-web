#!/usr/bin/env python

import os
import sys

if len(sys.argv) < 3:
    print('Usage: build.py src build')
    sys.exit(1)

src = os.path.dirname(os.path.realpath(__file__)) + '/../static/src/js'
build = os.path.dirname(os.path.realpath(__file__)) + '/../static/build/js'

os.system(
    'browserify -t [ babelify --presets [ react ] ] -t sassify %s/%s -o %s/%s' %
    (src, sys.argv[1], build, sys.argv[2])
)
