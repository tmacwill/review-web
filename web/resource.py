import kata.resource

class Resource(kata.resource.Resource):
    def get(self, *args, **kwargs):
        title = "Let's Review | %s" % self.title() if self.title() is not None else "Let's Review"
        head = self.head(*args, **kwargs)
        html = self.html(*args, **kwargs)

        return self.success('''
<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>%s</title>
        <script type="text/javascript" src="/static/build/js/lib.js"></script>
        <link rel="stylesheet" type="text/css" href="/static/build/css/lib.css"></script>
        %s
    </head>
    <body>
        <script>
          window.fbAsyncInit = function() {
            FB.init({
              appId: '1419141551728974',
              xfbml: true,
              version: 'v2.5'
            });
          };

          (function(d, s, id){
             var js, fjs = d.getElementsByTagName(s)[0];
             if (d.getElementById(id)) {return;}
             js = d.createElement(s); js.id = id;
             js.src = "//connect.facebook.net/en_US/sdk.js";
             fjs.parentNode.insertBefore(js, fjs);
           }(document, 'script', 'facebook-jssdk'));
        </script>
        <div id="container" class="container">
            %s
        </div>
    </body>
</html>
        ''' % (title, head, html))

    def head(self, *args, **kwargs):
        return ''

    def html(self, *args, **kwargs):
        return ''

    def title(self):
        return None

class Review(Resource):
    def head(self, *args, **kwargs):
        return '''
<script type="text/javascript">window.data = {slug: "%s"};</script>
<script type="text/javascript" src="/static/build/js/review.js"></script>
        ''' % kwargs['slug']

class Upload(Resource):
    def head(self, *args, **kwargs):
        return '''
<script type="text/javascript" src="/static/build/js/upload.js"></script>
<link rel="stylesheet" type="text/css" href="/static/build/css/upload.css"></script>
        '''
