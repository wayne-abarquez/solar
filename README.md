# Setup
1) cd /var/www
2) sudo mkdir solar
3) sudo chown user:user solar
4) git clone https://github.com/wayne-abarquez/solar-demo.git solar
5) cd solar/
6) bin/setup.sh
7) bin/createdb.sh
8) bin/setup-nginx.sh
9) python manage.py db upgrade
10) bin/local/run-app.sh

# Create Test Data
# Test Users
python manage.py create_test_users
# Test Solar Data
python manage.py create_test_solars

