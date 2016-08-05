from app import db
from app.models import BaseModel, OrmObject
from flask.ext.login import UserMixin
from app.auth_mod.auth_factory import AuthModuleFactory
from werkzeug.security import generate_password_hash, check_password_hash

class AccountStatusType:
    ACTIVE = 1
    SUSPENDED = 0


class TemporaryLockoutStatus:
    LOCKED = 1
    UNLOCKED = 0


class AuthModule:
    LOCAL = 'local'
    LDAP = 'ldap'


class RoleType:
    ADMIN = "ADMIN"
    PM = "PM"
    IC = "IC"
    CLIENT = "CLIENT"


class Role(db.Model, OrmObject):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text)


class User(BaseModel, UserMixin):
    name = db.Column(db.String(50))
    username = db.Column(db.String(50))
    password_hash = db.Column(db.String)
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))
    account_status = db.Column(db.Integer, default=AccountStatusType.ACTIVE)
    auth_module_name = db.Column(db.String(5), default=AuthModule.LOCAL)
    last_login_datetime = db.Column(db.DateTime)
    temporary_login_lockout = db.Column(db.Integer, default=TemporaryLockoutStatus.UNLOCKED)

    role = db.relationship(Role, foreign_keys=role_id)

    @property
    def password(self):
        raise AttributeError('password: write-only field')

    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)

    def authenticate(self, password):
        return check_password_hash(self.password_hash, password)
        # return AuthModuleFactory.Authenticate(self.auth_module_name, user=self, password=password)

    @staticmethod
    def get_by_username(username):
        return User.query.filter_by(username=username).first()

    def __repr__(self):
        return "<User '{}'>".format(self.username)