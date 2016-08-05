from faker import Factory

fake = Factory.create('en_US')

test_password = 'password123'

test_users = [
    {
        'username': 'testadmin',
        'role_id': 1
    },
    {
        'username': 'testpm',
        'role_id': 2
    },
    {
        'username': 'testic',
        'role_id': 3
    },
    {
        'username': 'testclient',
        'role_id': 4
    }
]

for index, user in enumerate(test_users):
    user['name'] = fake.name()
    test_users[index] = user