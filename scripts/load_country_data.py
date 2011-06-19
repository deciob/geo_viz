import os
import csv
import simplejson as json
import geojson
import copy


#countries_geo = open('../data/volume_tropical_timber_imports_tmp.json')
#
#countries_data = csv.reader(open('../data/volume_tropical_timber_imports.csv', 'rb'), delimiter=',')
#
#countries_geo_json = json.load(countries_geo)


#importers = open('../data/importers.json')
exporters = json.load(open('../data/exporters.json'))
countries_data = csv.reader(open('../data/volume_tropical_timber_imports.csv', 'rb'), delimiter=',')


#print countries_geo_json


count = 0
data = {}
for row in countries_data:
    if count == 0:
        first_row = row
        count += 1
    elif len(row) > 0:
        data[row[0]] = dict(zip(first_row[1:-1], row[1:-1] ))

#print data


#importers = ['BE','FR','DE','IT','NL','PT','ES','UK']
#exporters = ['BR','CM','ID','MY','CF','CD','CG','GQ','GA','GH','CI','LR','NG']


filename = 'exporters_data.json'
exporters = copy.deepcopy(exporters)
for f in exporters.get('features'):
    properties = f.get('properties')
    code = properties.get('Code')
    properties['export_values'] = data.get(code)

file = open(filename,"w")
file.write(json.dumps(exporters))
file.close()

#    countries_geo_json_copy = copy.deepcopy(countries_geo_json)
#    deletables = []
#    count = 0
#    for f in countries_geo_json_copy.get('features'):
#        #print f.get('properties').get('Code'):
#        if (f.get('properties').get('Code') == exporter):
#            #or f.get('properties').get('Code') in importers):
#            properties = f.get('properties')
#            code = properties.get('Code')
#            properties['export_values'] = data.get(code)
#        else:
#            deletables.append(count)
#        count += 1
#    for i in range(len(deletables)-1, 0, -1):
#        del countries_geo_json_copy.get('features')[deletables[i]]
#file = open(filename,"w")
#file.write(json.dumps(countries_geo_json_copy))
#file.close()

#for exporter in exporters:
#    filename = 'volume_tropical_timber_imports_%s.json' % exporter
#    countries_geo_json_copy = copy.deepcopy(countries_geo_json)
#    deletables = []
#    count = 0
#    for f in countries_geo_json_copy.get('features'):
#        if (f.get('properties').get('Code') == exporter
#            or f.get('properties').get('Code') in importers):
#            properties = f.get('properties')
#            code = properties.get('Code')
#            properties['export_values'] = data.get(code)
#        else:
#            deletables.append(count)
#        count += 1
#    for i in range(len(deletables)-1, 0, -1):
#        del countries_geo_json_copy.get('features')[deletables[i]]
#    file = open(filename,"w")
#    file.write(json.dumps(countries_geo_json_copy))
#    file.close()

#print
#
#
#
#countries_geo.close()
#
#
#exit = json.dumps(countries_geo_json)
#countries_geo_final = open('../data/volume_tropical_timber_imports.json', 'w')
#countries_geo_final.write(exit)






#    if count > 0:
#    #print json.loads(features)
#        print f.iteritems()
#    count += 1
    #print geojson.loads(f, object_hook=geojson.GeoJSON.to_instance)
#    for f in features:
#        print f
#        print geojson.loads(f, object_hook=geojson.GeoJSON.to_instance)
#        #json.loads(f)
#        #print '@@@@@@@@@@@'
        

