import os

from google.appengine.ext import webapp
from google.appengine.ext.webapp import template



class MainHandler(webapp.RequestHandler):
    def get(self):
        template_values = {}
        path = os.path.join(os.path.dirname(__file__), 'templates/index.html')
        self.response.out.write(template.render(path, template_values))


class PetersFocus(webapp.RequestHandler):
    def get(self):
        template_values = {}
        path = os.path.join(os.path.dirname(__file__), 'templates/focus.html')
        self.response.out.write(template.render(path, template_values))


class PetersFlows(webapp.RequestHandler):
    def get(self):
        template_values = {}
        path = os.path.join(os.path.dirname(__file__), 'templates/flows.html')
        self.response.out.write(template.render(path, template_values))


class PathTest(webapp.RequestHandler):
    def get(self):
        template_values = {}
        path = os.path.join(os.path.dirname(__file__), 'templates/path_test.html')
        self.response.out.write(template.render(path, template_values))
        

class CVTest(webapp.RequestHandler):
    def get(self):
        template_values = {}
        path = os.path.join(os.path.dirname(__file__), 'templates/cv.html')
        self.response.out.write(template.render(path, template_values))
        
class Choropleth(webapp.RequestHandler):
    def get(self):
        template_values = {}
        path = os.path.join(os.path.dirname(__file__), 'templates/choropleth.html')
        self.response.out.write(template.render(path, template_values))
        
class ChoroplethLayout(webapp.RequestHandler):
    def get(self):
        template_values = {}
        path = os.path.join(os.path.dirname(__file__), 'templates/choropleth_layout.html')
        self.response.out.write(template.render(path, template_values))
