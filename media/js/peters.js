document.addEventListener("DOMContentLoaded", main, false);

function main () {  

    var conf = new PetersConf(true);
    
    var xy = d3.geo.peters(conf.map_height),
    path = d3.geo.path().projection(xy);

    var states = d3.select("body")
    .append("svg:svg")
    .style("width", conf.map_width + "px")
    .style("height", conf.map_height + "px")
    .attr("id", "map")
    .attr("class", "bordered")
    .attr("class", "geo")
    .append("svg:g")
    .attr("id", "states");
    
    var selected_state = d3.select("svg")
    .append("svg:g")
    .attr("id", "state");

    var equator = d3.select("svg")
    .append("svg:line")
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", xy([0, 0])[1])
    .attr("y2", xy([0, 0])[1]);

    /*
    highligth_feature(conf.highlight_colour) and highligth_feature('#AFBDCC')
    are closure examples.
    These functions are called immediatley and return new functions. They share
    the same function body definition, but store different environments.
    (see: https://developer.mozilla.org/en/JavaScript/Guide/Closures)
    These new functions are attached to their respective events and called
    as: listener.call(this, d, i); (see d3.js line 1560)
     */

    d3.json("/media/data/110m_countries.json", function(collection) {
        states
        .selectAll("path")
        .data(collection.features)
        .enter().append("svg:path")
        .on("mouseover", set_highligth_feature(conf.highlight_colour, 'stroke'))
        //.on("mouseout", highligth_feature(conf.norm_stroke, 'stroke'))
        //.on('click', focus())
        .attr("d", path)
        .each(set_initial_path_coords)
        .append("svg:title")
        .text(function(d) {
            return d.properties.name;
        });
    });
    
    
    var initial_path_coords = {};
    function set_initial_path_coords (feature, i) {
        d3.select(this)
        .attr('id', feature.properties.id + '_el'); // TODO: some of these are undefined!
        initial_path_coords[feature.properties.id] = {
            x : path.centroid(feature)[0],
            y : path.centroid(feature)[1]
        }
    }


    function set_highligth_feature (colour, attr) {
        // creating a new feature
        // so it lies on top of everithing else and it can be correctly highlited
        return function(feature, i) {

            var s = selected_state
            .selectAll("path")
            .data([feature], function(d) { return d.properties.id; });
            
            s.enter().insert("svg:path", "g")
            .attr("d", path)
            .on("mouseout", highligth_feature(conf.norm_stroke, attr, 1))
            .on("mouseover", highligth_feature(colour, attr, 1.5))
            .on('click', focus());
            
            s.exit()
            .remove();       
        };
    }
    
    function highligth_feature (colour, attr, width) {
        return function() {
                d3.select(this)
                .style(attr, colour)
                .style("stroke-width", width)
                .style("opacity", .1)
                .transition()
                .duration(400)
                .style("opacity", 1);
        };
    }
    
    function highligth_feature2 (element, incolour, outcolor, attr, width) {
        
        element
        .style(attr, incolour)
        .style("stroke-width", 13)
        .style("opacity", .1)
        .transition()
        .duration(400)
        .style("opacity", 1);
        
        if (prev_selected_feature_id !== -1) {
            d3.select('#' + prev_selected_feature_id + '_el')
            .style(attr, outcolor)
        }
        
    }

    var prev_selected_feature_id = -1;
    function focus() {
        return function(feature, i) {
            var centroid = path.centroid(feature),
            x = initial_path_coords[feature.properties.id].x, //centroid[0],
            y = initial_path_coords[feature.properties.id].y, //centroid[1],
            tx, ty,
            x_factor = conf.map_width / 2,
            y_factor = conf.map_height / 2,
            zoom_factor = zoom_factor_from_feature_bbox(feature);
            if (conf.norm_scale !== conf.current_scale 
                && feature.properties.id === prev_selected_feature_id) {
                xy.scale(conf.norm_scale)
                .translate([x_factor, y_factor])
                refresh();
                conf.current_scale = conf.norm_scale;
            } else {
                if (x < conf.map_width / 2) {
                    tx = (x_factor * zoom_factor + (x_factor - x * zoom_factor));
                } else {
                    tx = (x_factor * zoom_factor - (x * zoom_factor - x_factor));
                }
                if (y < conf.map_height / 2) {
                    ty = (y_factor * zoom_factor + (y_factor - y * zoom_factor));
                } else {
                    ty = (y_factor * zoom_factor - (y * zoom_factor - y_factor));
                }
                xy.scale(conf.norm_scale * zoom_factor)
                .translate([tx, ty]);
                refresh();
                conf.current_scale = conf.norm_scale * zoom_factor;
            }
            
            // TODO: this is not ideal
            
            d3.select(this).remove();
            //console.log(d3.select('#' + feature.properties.id + '_el')[0]);
//            d3.select('#' + feature.properties.id + '_el')
//            .call(highligth_feature2, conf.highlight_colour, conf.highlight_colour2, 'stroke', 2);
            
            
            prev_selected_feature_id = feature.properties.id;
        };
    }


    function zoom_factor_from_feature_bbox (feature) {
        //d3.geo.bounds(feature) == [[left, bottom], [right, top]]
        var bbox = d3.geo.bounds(feature),
        geo_width,
        geo_height,
        width,
        height;

        // width
        if (bbox[0][0] < 0 && bbox[1][0] < 0){
            geo_width = Math.abs(bbox[0][0]) - Math.abs(bbox[1][0]);
        } else if (bbox[0][0] > 0 && bbox[1][0] > 0) {
            geo_width = bbox[1][0] - bbox[0][0];
        } else if (bbox[0][0] < 0 && bbox[1][0] > 0) {
            geo_width = Math.abs(bbox[0][0]) + bbox[1][0];
        }
        width = conf.map_width * geo_width / 360;
        // height
        if (bbox[0][1] < 0 && bbox[1][1] < 0){
            geo_height = Math.abs(bbox[0][1]) - Math.abs(bbox[1][1]);
        } else if (bbox[0][1] > 0 && bbox[1][1] > 0) {
            geo_height = bbox[1][1] - bbox[0][1];
        } else if (bbox[0][1] < 0 && bbox[1][1] > 0) {
            geo_height = Math.abs(bbox[0][1]) + bbox[1][1];
        }
        height = conf.map_height * geo_height / 180;

        if (width > height) {
            return Math.max(Math.round(Math.sqrt(conf.map_width/geo_width)) - 1, 1);
        } else {
            return Math.max(Math.round(Math.sqrt(conf.map_height/geo_height)) - 1, 1);
        }        
    }


    function refresh() {
        states
        .selectAll("path")
        .attr("d", path);

        equator
        .attr("y1", xy([0, 0])[1])
        .attr("y2", xy([0, 0])[1])
    }

}