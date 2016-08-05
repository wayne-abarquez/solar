bind = '127.0.0.1:8001'
accesslog = '/var/www/solar/logs/gunicorn-access.log'
errorlog = '/var/www/solar/logs/gunicorn-error.log'
limit_request_line = 0
workers = 2
preload = True
timeout = 120
