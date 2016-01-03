#!/usr/bin/env python

import os
import sys

# root directories for css files
css_src = os.path.dirname(os.path.realpath(__file__)) + '/../static/src/css'
css_build = os.path.dirname(os.path.realpath(__file__)) + '/../static/build/css'

# root directories for javascript files
js_src = os.path.dirname(os.path.realpath(__file__)) + '/../static/src/js'
js_build = os.path.dirname(os.path.realpath(__file__)) + '/../static/build/js'

# modules to be included on all pages
js_include = [
    'blueimp-md5',
    'bootstrap',
    'jquery',
    'radio',
    'react',
    'react-dom',
    'underscore',
    './lib.js',
]

def build_css(src_file, build_file, min=False):
    # run sass from the src directory
    os.chdir(css_src)
    os.system('mkdir -p %s > /dev/null 2>&1' % css_build)

    flags = ''
    if min:
        flags = '--style compressed'

    os.system(
        'sass %s/%s %s/%s %s' %
        (css_src, src_file, css_build, build_file, flags)
    )

def build_js(src_file, build_file, min=False):
    # run browserify from the src directory
    os.chdir(js_src)
    os.system('mkdir -p %s > /dev/null 2>&1' % js_build)

    # if minification is enabled, then pipe output through uglify
    flags = ''
    prefix = ''
    if min:
        prefix = 'NODE_ENV=production'
        flags = '| uglifyjs -c'

    # build the library file by simply requiring all modules
    if src_file == 'lib.js':
        os.system(
            '%s browserify %s %s > %s/lib.js' %
            (prefix, ''.join(['-r ' + e + ' ' for e in js_include]), flags, js_build)
        )

    # build the given module
    else:
        os.system(
            '%s browserify %s -t [ babelify --presets [ react ] ] %s/%s %s > %s/%s' %
            (prefix, ''.join(['-x ' + e + ' ' for e in js_include]), js_src, src_file, flags, js_build, build_file)
        )

# build all entry points for pages
if len(sys.argv) == 1:
    build_css('lib.scss', 'lib.css', min=True)
    for file in os.listdir(css_src + '/pages'):
        build_css('pages/%s' % file, os.path.splitext(file)[0] + '.css', min=True)

    build_js('lib.js', 'lib.js', min=True)
    for file in os.listdir(js_src + '/pages'):
        build_js('pages/%s' % file, file, min=True)

# build individual files
elif len(sys.argv) > 2:
    if sys.argv[1].endswith('.js'):
        build_js(sys.argv[1], sys.argv[2], len(sys.argv) > 3)

    elif sys.argv[1].endswith('.scss'):
        build_css(sys.argv[1], sys.argv[2], len(sys.argv) > 3)
