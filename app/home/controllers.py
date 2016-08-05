from . import home
from flask import render_template, request, Response
from .forms import AddSolarForm
from flask_login import login_required, current_user
from html2canvasproxy import *
import logging

log = logging.getLogger(__name__)

# real_path = app.config.get('REAL_PATH', '')
# virtual_path = app.config.get('VIRTUAL_PATH', '')
real_path = '/var/www/solar/client/static/downloads'
virtual_path = '/static/downloads'


@home.route('/', methods=['GET', 'POST'])
@home.route('/index', methods=['GET', 'POST'])
@login_required
def index():
    return render_template('/index.html', user=current_user)


@home.route('/html2canvasproxy')
def get_html2canvasproxy():
    log.debug(request)
    h2c = html2canvasproxy(request.args.get('callback'), request.args.get('url'))
    # h2c.enableCrossDomain() #Uncomment this line to enable the use of "Data URI scheme"
    h2c.userAgent(request.headers['user_agent'])
    h2c.hostName(request.url)
    if request.referrer is not None:
        h2c.referer(request.referrer)
    h2c.route(real_path, virtual_path)
    if request.args.get('debug_vars'):  #
        return Response(str(h2c.debug_vars()), mimetype='text/plain')
    r = h2c.result()
    return Response(r['data'], mimetype=r['mime'])


@home.route('/image/screenshot/confirm')
def image_confirm():
    log.debug("/image/screenshot/confirm - Image Confirm Request")
    return render_template('image_screenshot_confirm.html')


@home.route('/image/preview')
def image_preview():
    log.debug("/image/preview - Image Preview Request")
    return render_template('image_preview.html')


@home.route('/solar/add', methods=['GET'])
def add_solar_view():
    return render_template('add_solar.html', form=AddSolarForm())


@home.route('/solar/edit', methods=['GET'])
def detail_solar_view():
    # TODO: solar files and panels form
    # scip_gen_info = SectionGroup.load_from_file('scip_general_info')
    # solar_files = SectionGroup.load_from_file('solar_files')
    params = dict(
        solar_form=AddSolarForm(),
        # scip_files=solar_files,
        # panels_form=CandidateSiteForm(),
    )

    return render_template('detail_solar.html', form=params)


@home.route('/solar/upload', methods=['GET'])
def upload_solar_view():
    return render_template('upload_solar_file.html')


@home.route('/solar/panel/edit', methods=['GET'])
def update_solar_panel():
    log.debug("Solar Panel Edit View Request")
    return render_template('partials/modals/_update_solar_panel.html')
