from app.auth_mod.models import User
from app import db
import logging

log = logging.getLogger(__name__)

def authenticate_user(username_data, password_data):
    pass
    # user = User.query.filter_by(username=username_data)
    # if user is not None:
