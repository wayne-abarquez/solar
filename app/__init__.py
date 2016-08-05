import os
import sys
import logging
import tempfile

from flask import Flask
from flask.ext import restful
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.cors import CORS
from flask_login import LoginManager

from config import config_by_name

# Specify Environment via "export SOLAR_ENV=<environment_name>"
env = os.getenv('SOLAR_ENV') or 'dev'

app = Flask(__name__)
app.config.from_object(config_by_name[env])
app.static_folder = app.config.get('STATIC_FOLDER', '')
app.template_folder = app.config.get('TEMPLATES_FOLDER', '')
tempfile.tempdir = app.config.get('TMP_DIR', '')

# global SQLAlchemy instance
db = SQLAlchemy(app)

# Configure authentication
lm = LoginManager()
lm.session_protection = 'strong'
lm.login_view = 'auth.login'
lm.init_app(app)

# CORS Prevent 401 in Chrome
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# Config for Logging
stdout_handler = logging.StreamHandler(sys.stdout)
stdout_handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s - %(filename)s %(funcName)s: %(message)s'))
stdout_handler.setLevel(logging.DEBUG)
app.logger.addHandler(stdout_handler)
app.logger.setLevel(logging.DEBUG)

if app.config['LOG_FILENAME']:
    file_handler = logging.FileHandler(app.config['LOG_FILENAME'])
    file_handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s - %(filename)s %(funcName)s: %(message)s'))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.info('Will output log to %s', app.config['LOG_FILENAME'])

# global instance of flask-restful, used by resources
rest_api = restful.Api(app, catch_all_404s=True)

# monkey patch WTForm classes
import wtforms_json

wtforms_json.init()

# Import app/resources
from resources import *

# Register Home Blueprint
from .home import home as home_blueprint
app.register_blueprint(home_blueprint)

# Register Auth Blueprint
from .auth_mod import auth as auth_blueprint
app.register_blueprint(auth_blueprint)