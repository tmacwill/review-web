upstream review_web {
    server 127.0.0.1:9001 fail_timeout=0;
}

upstream review_api {
    server 127.0.0.1:9002 fail_timeout=0;
}

server {
    listen 80;
    client_max_body_size 4G;
    server_name letsreview.io www.letsreview.io;
    keepalive_timeout 5;

    location /static/ {
        alias /home/vagrant/review-web/static/;
        autoindex off;
    }

    location /api/ {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_redirect off;
        proxy_pass http://review_api/;
    }

    location / {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_redirect off;
        proxy_pass http://review_web;
    }
}
