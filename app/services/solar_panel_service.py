from app.models import Solar, SolarPanels
from app.utils import forms_helper
from app.errors import exceptions
from app import db
import logging

log = logging.getLogger(__name__)


def add_panel(solar_id, data):
    # Prepare Data
    solar = Solar.query.get(solar_id)
    if solar is None:
        raise exceptions.SolarNotFoundError("Solar id={0} not found".format(solar_id))

    if data['name'] and data['area']:
        panel = SolarPanels(name=data['name'],
                            area=forms_helper.parse_area(data['area']))
        solar.panels.append(panel)
        db.session.commit()
        return panel

    return None


def delete_panel(solar_id, panel_id):
    # Prepare Data
    solar = Solar.query.get(solar_id)
    if solar is None:
        raise exceptions.SolarNotFoundError("Solar id={0} not found".format(solar_id))

    solar_panel = SolarPanels.query.get(panel_id)
    if solar_panel is None:
        raise exceptions.SolarPanelNotFoundError("Solar Panel id={0} not found".format(panel_id))

    db.session.delete(solar_panel)
    db.session.commit()


def update_panel_area(solar_id, panel_id, data):
    # Prepare Data
    solar = Solar.query.get(solar_id)
    if solar is None:
        raise exceptions.SolarNotFoundError("Solar id={0} not found".format(solar_id))

    solar_panel = SolarPanels.query.get(panel_id)
    if solar_panel is None:
        raise exceptions.SolarPanelNotFoundError("Solar Panel id={0} not found".format(panel_id))

    solar_panel.update_from_dict(data, ['id', 'solar_id', 'area', 'date_created', 'date_modified'])

    if data['area']:
        solar_panel.area = forms_helper.parse_area(data['area'])

    db.session.commit()

    return solar_panel
