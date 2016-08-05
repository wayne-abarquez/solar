from flask.ext.restful import Resource, abort, marshal
from flask import request
from app.services import solar_panel_service
from app.resources.solar_fields import solar_panel_create_fields, success_fields
from app.errors.exceptions import SolarNotFoundError
from app import rest_api
import logging

log = logging.getLogger(__name__)


class SolarPanelResource(Resource):
    """
    Resource for getting details for a Solar
    """

    def post(self, solar_id):
        data = request.json
        log.debug("Create Solar Panel request {0}: {1}".format(solar_id, data))
        # TODO check authenticated user
        # if current_user and current_user.is_authenticated:
        try:
            panel_data = solar_panel_service.add_panel(solar_id, data)
            result = dict(status=200, message="OK", panel=panel_data)
            return marshal(result, solar_panel_create_fields)
        except SolarNotFoundError as err:
            abort(404, message=err.message)
            # abort(401, message="Requires user to login")


class SolarPanelDetailResource(Resource):
    """
    Resource for Solar Panel details
    """

    def delete(self, solar_id, panel_id):
        data = request.json
        log.debug("Delete Solar Panel Detail request Solar={0} Panel={1} Data={2}".format(solar_id, panel_id, data))
        # TODO check authenticated user
        # if current_user and current_user.is_authenticated:
        try:
            solar_panel_service.delete_panel(solar_id, panel_id)
            result = dict(status=200, message="OK")
            return marshal(result, success_fields)
        except ValueError as err:
            abort(404, message=err.message)
            # abort(401, message="Requires user to login")

    def put(self, solar_id, panel_id):
        data = request.json
        log.debug("Update Solar Panel Detail request Solar={0} Panel={1} Data={2}".format(solar_id, panel_id, data))
        # TODO check authenticated user
        # if current_user and current_user.is_authenticated:
        try:
            panel_data = solar_panel_service.update_panel_area(solar_id, panel_id, data)
            result = dict(status=200, message="OK", panel=panel_data)
            return marshal(result, solar_panel_create_fields)
        except ValueError as err:
            abort(404, message=err.message)
            # abort(401, message="Requires user to login")


rest_api.add_resource(SolarPanelResource, '/api/solars/<int:solar_id>/panels')
rest_api.add_resource(SolarPanelDetailResource, '/api/solars/<int:solar_id>/panels/<int:panel_id>')