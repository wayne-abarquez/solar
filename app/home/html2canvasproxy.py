# html2canvas-python-proxy 0.0.7
# Copyright (c) 2014 Guilherme Nascimento (brcontainer@yahoo.com.br)
#
# Released under the MIT license

import random
import time
import hashlib
import urllib2
import urlparse
import base64
import json
import re
import os
import logging

log = logging.getLogger(__name__)


class html2canvasproxy:
    # Config (If need)
    folder = 'images'
    timeout = 30
    mimetype = 'application/javascript'

    #commons
    ua = ''
    host = ''
    scheme = ''
    ref = ''
    url = ''
    http_username = ''
    http_password = ''
    callback = ''
    data = ''
    response = ''
    default_callback = 'console.log'
    status = 0
    routePath = '/'
    savePath = '/'
    prefix = 'htc_'
    real_extension = ''
    real_mimetype = ''
    real_charset = ''
    init_exec = time.time()
    ccache = 60 * 5 * 1000
    cross_domain = False
    mimes = [
        'image/bmp', 'image/windows-bmp', 'image/ms-bmp',
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'text/html', 'application/xhtml', 'application/xhtml+xml',
        'image/svg+xml', 'image/svg-xml'
    ]

    def log(self, msg):
        log.debug(msg)

    def __init__(self, callback, url):
        if callback == '' or callback is None:
            self.setResponse('error:No such parameter "callback"')
            self.log('error:No such parameter "callback"')
        elif re.match('[^A-Za-z0-9_[.]\\[\\]]', callback) is not None:
            self.setResponse('error:Parameter "callback" contains invalid characters (' + callback + ')')
            self.log('error:Parameter "callback" contains invalid characters (' + callback + ')')
        elif url == '' or url is None:
            self.setResponse('error:No such parameter "url"')
            self.log('error:No such parameter "url"')
        elif html2canvasproxy.isHttpUrl(url) == False:
            self.setResponse('error:Only http scheme and https scheme are allowed (' + url + ')')
            self.log('error:Only http scheme and https scheme are allowed (' + url + ')')
        else:
            self.callback = callback
            self.url = url

            # o = urlparse.urlparse(url)

            # if o.query != '':
            #     self.url += '?' + o.query

            # if o.username is not None:
            #     self.http_username = o.username

            # if o.password is not None:
            #     self.http_password = o.password

            # if self.http_username != '' or self.http_password != '':
            #     uri = (o.netloc.split('@'))[1]
            # else:
            #     uri = o.netloc

            # self.url = o.scheme + "://" + uri + o.path

    def enableCrossDomain(self):
        self.cross_domain = True;

    def initiate(self):
        if self.status != 0:
            return None

        self.downloadSource()

    def downloadSource(self):
        headers = {'User-Agent': self.ua}
        if self.ref != '':
            o = urlparse.urlparse(self.ref)
            self.scheme = o.scheme
            self.host = o.netloc

            headers['Referer'] = self.ref

        if self.http_username != '' or self.http_password != '':
            auth = self.http_username + ':' + self.http_password
            auth = auth.encode('ascii')
            auth = base64.b64encode(auth)

            headers['Authorization'] = 'Basic ' + auth

        try:
            req = urllib2.Request(self.url, None, headers)
            r = urllib2.urlopen(req)
            h = r.info()

            if h['Content-Type'] != '' and h['Content-Type'] != None:
                if re.match('^(image|text|application)\/', h['Content-Type']) is None:
                    self.setResponse('error:Invalid mime-type: ' + h['Content-Type'])
                    self.log('error:Invalid mime-type: ' + h['Content-Type'])
                else:
                    mime = str(re.sub('[;]([\s\S]+)$', '', h['Content-Type'])).strip().lower()
                    mime = re.sub('/x-', '/', mime)

                    if mime in self.mimes:
                        self.data = r.read()

                        extension = re.sub('^(image|text|application)\/', '', mime)
                        extension = re.sub('(windows[-]bmp|ms[-]bmp)', 'bmp', extension)
                        extension = re.sub('(svg[+]xml|svg[-]xml)', 'svg', extension)
                        extension = extension.replace('xhtml[+]xml', 'xhtml')
                        extension = extension.replace('jpeg', 'jpg')

                        self.real_extension = extension
                        self.real_mimetype = mime

                        cp = h['Content-Type'].find(';');

                        if cp != -1:
                            cp = cp + 1
                            charset = h['Content-Type']
                            self.real_charset = ';' + charset[cp:].strip()

                        self.saveFile()
                    else:
                        self.setResponse('error:Invalid mime-type: ' + h['Content-Type'])
                        self.log('error:Invalid mime-type: ' + h['Content-Type'])
            else:
                self.setResponse('error:No mime-type defined')
                self.log('error:No mime-type defined')

            r.close()
        except urllib2.URLError, e:
            self.setResponse('error:SOCKET: ' + str(e.reason))
            self.log('error:SOCKET: ' + str(e.reason))

    def remove_old_files(self):
        a = []
        for f in os.listdir(self.savePath):
            if f.find(self.prefix) == 0 and os.path.isfile(self.savePath + f) and (
                    (self.init_exec - os.path.getctime(self.savePath + f))) > (self.ccache * 2):
                os.unlink(self.savePath + f)

    def saveFile(self):
        file_name = hashlib.sha1(self.url).hexdigest()
        tmp_ext = str(random.randrange(1000)) + '_' + str(self.init_exec)

        if os.path.isfile(self.savePath + file_name + '.' + tmp_ext):
            self.saveFile()  #try again
        else:
            f = open(self.savePath + file_name + '.' + tmp_ext, 'wb')
            f.write(self.data)
            f.close()

            if os.path.isfile(self.savePath + file_name + '.' + self.real_extension):
                os.remove(self.savePath + file_name + '.' + self.real_extension)

            os.rename(self.savePath + file_name + '.' + tmp_ext,
                      self.savePath + '/' + file_name + '.' + self.real_extension)

            self.setResponse(self.scheme + '://' + self.host + self.routePath + file_name + '.' + self.real_extension)

    def hostName(self, url):
        if url == '' or url is None:
            self.setResponse('error:No such host in html2canvasproxy.hostName("url")')
            self.log('error:No such host in html2canvasproxy.hostName("url")')
        if html2canvasproxy.isHttpUrl(url) == False:
            self.setResponse(
                'error:Only http scheme and https scheme are allowed in html2canvasproxy.hostName(' + url + ')')
            self.log('error:Only http scheme and https scheme are allowed in html2canvasproxy.hostName(' + url + ')')
        elif self.ref == '':
            o = urlparse.urlparse(url)

            self.scheme = o.scheme
            self.host = o.netloc

    def referer(self, url):
        if url == '' or url is None:
            self.setResponse('error:No such referer in html2canvasproxy.referer("url")')
            self.log('error:No such referer in html2canvasproxy.referer("url")')

        if html2canvasproxy.isHttpUrl(url) == False:
            self.setResponse(
                'error:Only http scheme and https scheme are allowed in html2canvasproxy.referer(' + url + ')')
            self.log('error:Only http scheme and https scheme are allowed in html2canvasproxy.referer(' + url + ')')
        else:
            self.ref = url

            o = urlparse.urlparse(url)

            self.scheme = o.scheme
            self.host = o.netloc

    def route(self, currentPath, route):
        if re.match('(^/|[a-zA-Z][:])', currentPath) is None:
            self.setResponse('error:Invalid currentPath (' + currentPath + ')')
            self.log('error:Invalid currentPath (' + currentPath + ')')
        else:
            if not os.path.isdir(currentPath):
                self.setResponse('error:Not found ' + currentPath)
                self.log('error:Not found ' + currentPath)
            else:
                self.savePath = html2canvasproxy.fixPath(currentPath)
                if re.match('^/', currentPath) is None:
                    self.routePath = '/' + route
                else:
                    self.routePath = route

                if re.match('/$', self.routePath) is None:
                    self.routePath = self.routePath + '/'

    def userAgent(self, ua):
        self.ua = ua

    def result(self):
        if self.response == '':
            self.initiate()

        self.remove_old_files()

        if self.cross_domain:
            duheader = re.sub('(^"|"$)', '',
                              json.dumps(self.real_mimetype + self.real_charset)
                              )

            if self.real_extension == 'svg' or re.match('^image/', self.real_mimetype) is None:
                return {
                    'mime': self.mimetype,
                    'data': self.callback + '("data:' + duheader + ',' + html2canvasproxy.asciiToInline(
                        self.data) + '");'
                }
            else:
                return {
                    'mime': self.mimetype,
                    'data': self.callback + '("data:' + duheader + ';base64,' + base64.b64encode(self.data) + '");'
                }
        else:
            return {
                'mime': self.mimetype,
                'data': self.callback + '(' + json.dumps(self.response) + ');'
            }

    def setResponse(self, resp):
        if self.response == '':
            self.status = 2
            self.response = str(resp)

    def debug_vars(self):
        return self.__dict__

    @staticmethod
    def asciiToInline(str):
        i = 0;
        x = {
            '\n': '%0A',
            '\r': '%0D',
            ' ': '%20',
            '"': '%22',
            '#': '%23',
            '&': '%26',
            '\/': '%2F',
            '\\': '%5C',
            ':': '%3A',
            '?': '%3F',
            '\0': '%00',
            '\b': '',
            '\t': '%09'
        }

        for (k, v) in x.items():
            str = str.replace(k, v)

        return str;

    @staticmethod
    def fixPath(path):
        path = re.sub('(\/|\\\\)$', '', path)
        if re.match('[a-zA-Z][:]\\\\', path) is not None:
            return path + '\\'
        else:
            return path + '/'

    @staticmethod
    def resource(currentPath, f):
        currentPath = html2canvasproxy.fixPath(currentPath)

        if os.path.isfile(currentPath + f):
            fileName, ext = os.path.splitext(f)

            mime = 'application/octet-stream'

            ext = re.sub('^[.]', '', ext)

            if re.match('^(jp|bm|gi|pn)', ext) is not None:
                mime = 'image/' + ext
            elif ext == 'xhtml':
                mime = 'application/xml+xhtml'
            elif ext == 'svg':
                mime = 'image/svg+xml'
            elif ext == 'html':
                mime = 'text/html'

            f = open(currentPath + '/' + f)
            data = f.read()
            f.close()

            return {'mime': mime, 'data': data}
        else:
            return None

    @staticmethod
    def isHttpUrl(url):
        return re.match('^http(|s)[:][/][/][a-zA-Z0-9]', url) is not None