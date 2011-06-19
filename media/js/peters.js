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
        .append("svg:g")
        .attr("id", "states");

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
            .on("mouseover", highligth_feature(conf.highlight_colour))
            .on("mouseout", highligth_feature(conf.norm_colour))
            .on('click', focus())
            .attr("d", path)
            .append("svg:title")
            .text(function(d) {
                return d.properties.name;
            });
    });

    function highligth_feature (opacity) {
        return function(feature, i) {
            var centroid = path.centroid(feature),
            x = centroid[0],
            y = centroid[1];
            if (conf.norm_scale === conf.current_scale) {
                d3.select(this)
                .transition()
                .style("fill", opacity);
            }
        };
    }

    var prev_selected_feature_i = -1;
    function focus() {
        return function(feature, i) {
            
            var centroid = path.centroid(feature),
            x = centroid[0],
            y = centroid[1],
            tx, ty,
            x_factor = conf.map_width / 2,
            y_factor = conf.map_height / 2,
            zoom_factor = zoom_factor_from_feature_bbox(feature);
            if (conf.norm_scale !== conf.current_scale) {
                xy.scale(conf.norm_scale)
                    .translate([x_factor, y_factor])
                refresh();
                conf.current_scale = conf.norm_scale;
            } else {
                if (x < conf.map_width / 2) {
                    tx = (x_factor * zoom_factor +(x_factor - x * zoom_factor));
                } else {
                    tx = (x_factor * zoom_factor -(x * zoom_factor - x_factor));
                }
                if (y < conf.map_height / 2) {
                    ty = (y_factor * zoom_factor +(y_factor - y * zoom_factor));
                } else {
                    ty = (y_factor * zoom_factor -(y * zoom_factor - y_factor));
                }
                xy.scale(conf.norm_scale * zoom_factor)
                    .translate([tx, ty]);
                refresh();
                conf.current_scale = conf.norm_scale * zoom_factor;
            }
            prev_selected_feature_i = i;
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

    //        d3.select("#scale span")
    //        .text(xy.scale());
    //        d3.select("#translate-x span")
    //        .text(xy.translate()[0]);
    //        d3.select("#translate-y span")
    //        .text(xy.translate()[1]);
    }


//    $("#scale").slider({
//        min: 0,
//        max: 3000,
//        value: 500,
//        slide: function(event, ui) {
//            xy.scale(ui.value);
//            refresh();
//        }
//    });
//
//
//    $("#translate-x").slider({
//        min: -2000,
//        max: 2000,
//        value: 480,
//        slide: function(event, ui) {
//            var translate = xy.translate();
//            translate[0] = ui.value;
//            xy.translate(translate);
//            refresh();
//        }
//    });
//
//
//    $("#translate-y").slider({
//        min: -2000,
//        max: 2000,
//        value: 250,
//        slide: function(event, ui) {
//            var translate = xy.translate();
//            translate[1] = ui.value;
//            xy.translate(translate);
//            refresh();
//        }
//    });

}