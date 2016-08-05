from flask.ext.restful import Resource
from uuid import uuid4
from werkzeug.utils import secure_filename
from app import app
import os
import logging

log = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = app.config['ALLOWED_SOLAR_FILE_EXTENSIONS']
UPLOAD_FOLDER = app.config['UPLOAD_FOLDER']


class UploadResource(Resource):
    def allowed_file(self, filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    def copy_file(self, uploaded_file):
        filename = str(uuid4()) + os.pathsep + secure_filename(uploaded_file.filename)
        uploaded_file.save(os.path.join(UPLOAD_FOLDER, filename))
        return filename

    def get_file_extension(self, filename):
        return filename.rsplit('.', 1)[1].lower()

    def delete_file(self, filename):
        os.remove(os.path.join(os.path.join(UPLOAD_FOLDER, filename)))
    # def has_valid_form(self):
    #     return 'section' in request.form and 'field' in request.form

    # def get_form_data(self, filename):
    #     form = request.form
    #     field = dict()
    #     field[form['field']] = filename
    #     section = dict()
    #     section[form['section']] = field
    #     return section