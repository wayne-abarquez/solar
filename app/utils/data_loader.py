from app import db
import json


def load_test_data(cls, filename):
    print "Loading {0} from {1}".format(cls, filename)
    with open(filename) as json_file:
        json_data = json.load(json_file)

    for data in json_data:
        instance = cls.from_dict(data)
        db.session.add(instance)

    db.session.commit()