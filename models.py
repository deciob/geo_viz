from google.appengine.ext import db


class Country(db.Model):
    name = db.StringProperty(required=True)
    code = db.StringProperty(required=True)
    centroid = db.GeoPtProperty()
    geometry = db.Text()
    active = db.BooleanProperty(required=True, default=True)
    

class Continent(db.Model):
    name = db.StringProperty(required=True)
    centroid = db.GeoPtProperty()
    geometry = db.Text()
    countries = db.ReferenceProperty(Country,
        collection_name='countries')


class IllegalTimberTrade(db.Model):
    destination = db.ReferenceProperty(Country, collection_name='destination countries')
    origin = db.ReferenceProperty(Country, collection_name='origin countries')
    value_in_euro = db.IntegerProperty()
    percentage = db.FloatProperty()
    date = db.DateProperty()

