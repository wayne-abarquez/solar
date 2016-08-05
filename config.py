import os

base_dir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    DEBUG = False
    TESTING = False
    SECRET_KEY = 'solar-2015'
    WTF_CSRF_ENABLED = True
    WTF_CSRF_SECRET_KEY = 'solar-2015'
    LOG_FILENAME = '/var/www/solar/logs/solar.log'
    STATIC_FOLDER = '/var/www/solar/client/static'
    TEMPLATES_FOLDER = '/var/www/solar/client/templates'
    SQLALCHEMY_TRACK_MODIFICATIONS = True
    UPLOAD_FOLDER = '/var/www/solar/client/static/uploads'
    ALLOWED_SOLAR_FILE_EXTENSIONS = set(['pdf', 'png', 'jpg', 'jpeg', 'gif', 'tif', 'tiff'])
    REAL_PATH = '/var/www/solar/client/static/downloads'
    VIRTUAL_PATH = '/static/downloads'
    TMP_DIR = '/var/www/solar/tmp'
    GOOGLE_MAP_API_KEY = 'AIzaSyBU2IhITO_ygNUan5ortuYxJc6idxrsFlE'


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'postgresql://solaruser:youcantguess@localhost:5432/solar'


class TestingConfig(Config):
    TESTING = True
    WTF_CSRF_ENABLED = False
    SQLALCHEMY_DATABASE_URI = 'postgresql://solaruser:youcantguess@localhost:5432/solar'


class ProductionConfig(Config):
    SQLALCHEMY_DATABASE_URI = 'postgresql://solaruser:youcantguess@localhost:5432/solar'


config_by_name = dict(
    dev=DevelopmentConfig,
    test=TestingConfig,
    prod=ProductionConfig
)