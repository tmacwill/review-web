import kata.router

import web.resource

kata.router.add_html_route('/review/{slug}', web.resource.Review)
kata.router.add_html_route('/upload', web.resource.Upload)
