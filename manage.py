from app import app
from app import db
from flask.ext.script import Manager, prompt_bool
from flask.ext.migrate import Migrate, MigrateCommand
from app.data.sample_data import SampleData
from app.models import Solar, SolarFile
from app.auth_mod import models

manager = Manager(app)
migrate = Migrate(app, db)

manager.add_command('db', MigrateCommand)


@manager.command
def initdb():
    db.create_all()
    print "Initialized the Database"


@manager.command
def dropdb():
    if prompt_bool("Are you sure you want to Drop your Database?"):
        db.drop_all()
        print "Database Dropped"


@manager.command
def create_test_solars():
    SampleData.load_solar(no_of_solar=15)
    print "Loaded Test Solars"


@manager.command
def create_test_users():
    SampleData.load_users()
    print "Created test users"


if __name__ == '__main__':
    manager.run()