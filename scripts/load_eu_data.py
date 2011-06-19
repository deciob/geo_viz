import os
import csv
import simplejson as json
import geojson
import copy

exporters = json.load(open('../data/country_centroids.json'))
countries_data = csv.reader(open('../data/eu_imports.csv', 'rb'), delimiter=',')

count = 0
data = {}
for row in countries_data:
    data[row[1]] = {'rank': row[0], 'imports': row[2], 'percentage': row[3]}


filename = 'eu_imports_data2.json'
exporters = copy.deepcopy(exporters)
deletables = []
count = 0
for f in exporters.get('features'):
    properties = f.get('properties')
    country_name = properties.get('SOVEREIGNT')
    code = properties.get('ISO_A2')
    if data.get(country_name):
        properties['export_values'] = data.get(country_name)
    else:
        del f #deletables.append(count)
    count += 1

#for i in range(len(deletables)-1, 0, -1):
#    del exporters.get('features')[deletables[i]]

file = open(filename,"w")
file.write(json.dumps(exporters))
file.close()