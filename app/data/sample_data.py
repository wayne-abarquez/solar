from app import db
from faker import Factory
from app.models import Solar
from app.auth_mod.models import User, Role
from app.constants import solar_constants
from app.data.test import solars, roles, users
fake = Factory.create('en_US')


class SampleData:
    @staticmethod
    def refresh_table(table_name):
        db.session.execute('TRUNCATE "' + table_name + '" RESTART IDENTITY CASCADE')
        db.session.commit()

    @staticmethod
    def load_solar(no_of_solar=10):
        # Clear Data on Table First
        SampleData.refresh_table('solar')

        for data in solars.test_solars:
            solar = Solar.from_dict(data)
            db.session.add(solar)
        db.session.commit()

    @staticmethod
    def load_roles():
        SampleData.refresh_table('role')
        for data in roles.test_roles:
            role = Role.from_dict(data)
            db.session.add(role)
        db.session.commit()

    @staticmethod
    def load_users():
        # Load Roles First
        SampleData.load_roles()

        SampleData.refresh_table('user')
        for data in users.test_users:
            user = User.from_dict(data)
            user.password = users.test_password
            db.session.add(user)
        db.session.commit()





