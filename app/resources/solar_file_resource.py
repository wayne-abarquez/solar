from flask.ext.restful import Resource, abort, marshal
from flask import request
from app.resources.solar_fields import solar_file_create_fields, success_fields
from app import rest_api
from app.services import solar_file_service
from app.errors.exceptions import SolarNotFoundError
from app.home.forms import UpdatePhotoCaptionForm
from app.resources.file_resource import UploadResource
import logging

log = logging.getLogger(__name__)


class SolarPhotosResource(UploadResource):
    """
    Resource for solar photos
    """

    def post(self, solar_id):
        data = request.form
        log.debug("POST Solar Photo request {0}: {1}".format(solar_id, data))
        # TODO check authenticated user
        # if current_user and current_user.is_authenticated:
        uploaded_file = request.files['file']
        # TODO: Delete previous associated file before saving new one for good housekeeping
        if uploaded_file and self.allowed_file(uploaded_file.filename):
            try:
                solar_file_obj = solar_file_service.upload_photo(solar_id, uploaded_file)
                result = dict(status=200, message="OK", solar_file=solar_file_obj)
                return marshal(result, solar_file_create_fields)
            except SolarNotFoundError as err:
                abort(404, message=err.message)
        else:
            abort(400, message="Invalid parameters")
            # abort(401, message="Requires user to login")


class SolarPhotosDetailResource(UploadResource):
    """
    Resource for solar photos
    """

    def post(self, solar_id, photo_id):
        data = request.form
        log.debug("POST Solar Photo Update request Solar={0} Photo={1} Data={2}".format(solar_id, photo_id, data))
        # TODO check authenticated user
        # if current_user and current_user.is_authenticated:
        uploaded_file = request.files['file']
        log.debug("uploaded file: {0}".format(uploaded_file))
        # TODO: Delete previous associated file before saving new one for good housekeeping
        if uploaded_file and self.allowed_file(uploaded_file.filename):
            try:
                solar_file_obj = solar_file_service.update_photo(solar_id, photo_id, uploaded_file)
                result = dict(status=200, message="OK", solar_file=solar_file_obj)
                return marshal(result, solar_file_create_fields)
            except ValueError as err:
                abort(404, message=err.message)
        else:
            abort(400, message="Invalid parameters")
        # abort(401, message="Requires user to login")

    def put(self, solar_id, photo_id):
        data = request.json
        log.debug("PUT Solar Photo Detail request Solar={0} Photo={1} Data={2}".format(solar_id, photo_id, data))
        # TODO check authenticated user
        # if current_user and current_user.is_authenticated:
        new_caption = data['caption']
        form = UpdatePhotoCaptionForm.from_json(data)
        if form.validate():
            try:
                solar_file_obj = solar_file_service.update_photo_caption(solar_id, photo_id, new_caption)
                result = dict(status=200, message="OK", solar_file=solar_file_obj)
                return marshal(result, solar_file_create_fields)
            except ValueError as err:
                abort(404, message=err.message)
            else:
                abort(400, message="Invalid parameters")
                # abort(401, message="Requires user to login")

    def delete(self, solar_id, photo_id):
        data = request.json
        log.debug("Delete Solar Panel Detail request Solar={0} Panel={1} Data={2}".format(solar_id, photo_id, data))
        # TODO check authenticated user
        # if current_user and current_user.is_authenticated:
        try:
            filename = solar_file_service.delete_photo(solar_id, photo_id)
            # self.delete_file(filename)
            result = dict(status=200, message="OK")
            return marshal(result, success_fields)
        except ValueError as err:
            abort(404, message=err.message)
            # abort(401, message="Requires user to login")


rest_api.add_resource(SolarPhotosResource, '/api/solars/<int:solar_id>/photos')
rest_api.add_resource(SolarPhotosDetailResource, '/api/solars/<int:solar_id>/photos/<int:photo_id>')