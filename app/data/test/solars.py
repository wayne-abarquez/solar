from faker import Factory
from app.constants import solar_constants

fake = Factory.create('en_US')
status = 'IN_PROCESS'


test_solars = [
    {
        # 'project_name': 'Project ' + fake.company(),
        # 'client_name': fake.name(),
        # 'client_contact_no': fake.phone_number(),
        # 'address': fake.street_address(),
        # 'site_description': fake.text(150),
        # 'status': solar_constants.statuses_dict[status],
        'coordinates': 'POINT (-122.462596 37.7809555)',
        'state': 'California',
        'county': 'San Francisco'
    },
    {
        # 'project_name': 'Project ' + fake.company(),
        # 'client_name': fake.name(),
        # 'client_contact_no': fake.phone_number(),
        # 'site_description': fake.text(150),
        # 'status': solar_constants.statuses_dict[status],
        'coordinates': 'POINT (-122.4209454 37.724134)',
        'state': 'California',
        'county': 'San Francisco'
    },
    {
        # 'project_name': 'Project ' + fake.company(),
        # 'client_name': fake.name(),
        # 'client_contact_no': fake.phone_number(),
        # 'site_description': fake.text(150),
        # 'status': solar_constants.statuses_dict[status],
        'coordinates': 'POINT (-96.6910514 32.963989)',
        'county': 'Dallas',
        'state': 'Texas'
    },
    {
        # 'project_name': 'Project ' + fake.company(),
        # 'client_name': fake.name(),
        # 'client_contact_no': fake.phone_number(),
        # 'site_description': fake.text(150),
        # 'status': solar_constants.statuses_dict[status],
        'coordinates': 'POINT (-97.2893189 32.800813)',
        'county': 'Dallas',
        'state': 'Texas'
    },
    {
        # 'project_name': 'Project ' + fake.company(),
        # 'client_name': fake.name(),
        # 'client_contact_no': fake.phone_number(),
        # 'site_description': fake.text(150),
        # 'status': solar_constants.statuses_dict[status],
        'coordinates': 'POINT (-118.369612 34.0872304)',
        'county': 'Los Angeles',
        'state': 'California'
    },
    {
        # 'project_name': 'Project ' + fake.company(),
        # 'client_name': fake.name(),
        # 'client_contact_no': fake.phone_number(),
        # 'site_description': fake.text(150),
        # 'status': solar_constants.statuses_dict[status],
        'coordinates': 'POINT (-96.7694029 32.8211096)',
        'county': 'Dallas',
        'state': 'Texas'
    }
]

for index, solar in enumerate(test_solars):
    solar['project_name'] = 'Project ' + fake.company()
    solar['client_name'] = fake.name()
    solar['client_contact_no'] = fake.phone_number()
    solar['site_description'] = fake.text(150)
    solar['status'] = solar_constants.statuses_dict[status]
    solar['address'] = fake.street_address()
    test_solars[index] = solar


