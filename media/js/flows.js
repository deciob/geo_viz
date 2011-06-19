$(document).ready(function(){

    var norm_scale = 180,
    current_scale = norm_scale,
    map_height = $(window).height() - 150, //500,
    map_width = (960 * map_height) / 500,
    highlight_colour = '#D94141',
    flip_y = d3.scale.linear().domain([0, map_height]).range([map_height, 0]);


    // ***** *****
    // extending d3.geo with the peters projection
    // see: http://mathworld.wolfram.com/PetersProjection.html
    // ***** *****

    d3.geo.peters = function() {
        var scale = (180 / 500) * map_height,
        translate = [(480 / 500) * map_height, (250 /  500) * map_height];

        function peters(coordinates) {
            var x_rad = coordinates[0] * Math.PI / 180,
            y_rad = coordinates[1] * Math.PI / 180,
            x = x_rad * Math.cos(44.138 * Math.PI / 180),
            y = -Math.sin(y_rad) * 1/Math.cos(44.138 * Math.PI / 180);
            return [
                scale * x + translate[0],
                scale * Math.max(-2, Math.min(2, y)) + translate[1]
            ];
        }

        peters.scale = function(x) {
            if (!arguments.length) return scale;
            scale = +x;
            return peters;
        };

        peters.translate = function(x) {
            if (!arguments.length) return translate;
            translate = [+x[0], +x[1]];
            return peters;
        };

        return peters;
    };


    // ***** some functions... ******

    var highligth_feature = function (opacity) {
        return function(feature, i) {
            if (norm_scale === current_scale) {
                d3.select(this)
                .transition()
                .style("fill", opacity);
            }
        };
    };

    var focus = function () {
        return function(feature, i) {
            var centroid = path.centroid(feature),
            x = centroid[0],
            y = centroid[1],
            tx, ty,
            x_factor = map_width / 2,
            y_factor = map_height / 2,
            zoom_factor = zoom_factor_from_feature_bbox(feature);
            if (norm_scale !== current_scale) {
                peters
                .scale(norm_scale)
                .translate([x_factor, y_factor])
                refresh();
                current_scale = norm_scale;
            } else {
                if (x < 480) {
                    tx = (x_factor*zoom_factor +(x_factor - x*zoom_factor));
                } else {
                    tx = (x_factor*zoom_factor -(x*zoom_factor - x_factor));
                }
                if (y < 250) {
                    ty = (y_factor*zoom_factor +(y_factor - y*zoom_factor));
                } else {
                    ty = (y_factor*zoom_factor -(y*zoom_factor - y_factor));
                }
                peters
                .scale(180*zoom_factor)
                .translate([tx, ty])
                refresh();
                current_scale = 180*zoom_factor;
            }
        }
    };

    var zoom_factor_from_feature_bbox = function (feature) {
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
        width = map_width * geo_width / 360;
        // height
        if (bbox[0][1] < 0 && bbox[1][1] < 0){
            geo_height = Math.abs(bbox[0][1]) - Math.abs(bbox[1][1]);
        } else if (bbox[0][1] > 0 && bbox[1][1] > 0) {
            geo_height = bbox[1][1] - bbox[0][1];
        } else if (bbox[0][1] < 0 && bbox[1][1] > 0) {
            geo_height = Math.abs(bbox[0][1]) + bbox[1][1];
        }
        height = map_height * geo_height / 180;

        if (width > height) {
            return Math.max(Math.round(Math.sqrt(map_width/geo_width)) - 1, 1);
        } else {
            return Math.max(Math.round(Math.sqrt(map_height/geo_height)) - 1, 1);
        }
    };

    var refresh = function () {
        states
        .selectAll("path")
        .attr("d", path);
        //        equator
        //        .attr("y1", peters([0, 0])[1])
        //        .attr("y2", peters([0, 0])[1])
    };


    // ***** lines and curves... ******

    var getLine = function () {
        return d3.svg.line()
        .x(function(d, i) {
            return d[0]
        })
        .y(function(d, i) { 
            return d[1]
        })
        .interpolate("basis")
    }

    var get_middle_point = function (a, b) {
        var x = (b[0] + a[0]) / 2,
        y = (b[1] + a[1]) / 2,
        c = [x, y];
        return c;
    }

    var get_slope = function (a, b) {
        return (b[1] - a[1]) / (b[0] - a[0]);
    }

    var get_delta = function (a, b) {
        // returns the absolute difference between 2 values
        var delta;
        if (a >= 0 && b >= 0 && a > b) {
            delta = a - b;
        } else if (a >= 0 && b >= 0 && a < b) {
            delta = b - a;
        } else if (a < 0 && b >= 0) {
            delta = -(a) + b;
        } else if (a >= 0 && b < 0) {
            delta = -(b) + a;
        } else if (a < 0 && b < 0 && a < b) {
            delta = -(a) - b;
        } else if (a < 0 && b < 0 && b < a) {
            delta = -(b) - a;
        } else if (a === b) {
            delta = 0;
        }
        return delta;
    }

    var get_outer_middle_point = function (a, b) {
        //
        var m = get_slope(a, b),
        c = get_middle_point (a, b),
        delta_x = get_delta(a[0], b[0]),
        delta_y = get_delta(a[1], b[1]),
        y,
        x;

        if (delta_x > delta_y) {
            //console.log(1)
            //y = a[0] < c[0] ? c[1] + 30 : c[1] - 30;
            y = a[0] < c[0] ? c[1] + (.3 * delta_y) : c[1] - (.3 * delta_y);
            x = (y - c[1]) / (-1 / m) + c[0];
        } else if (delta_x < delta_y) {
            //console.log(delta_x)
            //x = a[1] < c[1] ? c[0] + 30 : c[0] - 30;
            //y = x * ((-1 / m) + c[0]) + c[1];
            y = a[0] < c[0] ? c[1] + (.3 * delta_x) : c[1] - (.3 * delta_x);
            x = (y - c[1]) / (-1 / m) + c[0];
        }

        return([x, y]);
    }

    var add_outer_middle_point = function (data) {
        //console.log('add_outer_middle_point', data)
        $.each(data, function (i, path) {
            var m_out = get_outer_middle_point(path[0], path[1]);
            path.splice(1, 0, m_out);
        });
    };


    // ******** ********
    // data visualizations
    // ******** ********

    var set_point_radius = function (obj, i) {
        if (obj.properties.export_values) {
            var export_values_sum = obj.properties.export_values['EU'];
            return Math.max(3, export_values_sum * 13);
        } else {
            return 0;
        }
    };

    var peters = d3.geo.peters(),
    // setting pointRadius to 0.01 instead of 0, because of Firefox4 behaviour.
    path = d3.geo.path().projection(peters).pointRadius(0.01);//(set_point_radius);
    
    var base_map = d3.select("body")
        .append("svg:svg")
        .style("width", map_width + "px")
        .style("height", map_height + "px")
        .attr("id", "map");
    
    var states = base_map
        .append("svg:g")
        .attr("id", "states");

    //    var equator = d3.select("svg")
    //    .append("svg:line")
    //    .attr("x1", "0%")
    //    .attr("x2", "100%")
    //    .attr("stroke-opacity", 0.3);


    // ***** exporters ******

    var expo_list = d3.select("body")
        .append("div")
        .attr("id", "expo_list")
        .style("font-size", "8px")
        .style("opacity", 0.8)
        .style("color", '#3b3e72')
        .style("line-height", "2em")
        .style("top", ((270 / 500) * map_height) + 'px')
        .append("ul");


    // ***** country polygons ******
    d3.json("/data/110m_countries.json", function(collection) {
        states
        .selectAll("path")
        .data(collection.features)
        .enter()
        .append("svg:path")
        .attr("opacity", 0.7)
        //.on("mouseover", highligth_feature(highlight_colour))
        //.on("mouseout", highligth_feature('#AFBDCC'))
        //.on('click', focus(180))
        .attr("id", function(d) {
            return 'poly_' + d.properties.id;
        })
        .attr("class", "country_paths")
        .attr("d", path)
        .append("svg:title")
        .text(function(d) {
            return d.properties.name;
        });
        //        equator
        //        .attr("y1", peters([0, 0])[1])
        //        .attr("y2", peters([0, 0])[1]);
    });


    // ***** flows ******

    var highligth_exports = function (params) {

        return function() {
            //TODO: why all this stuff needs to live inside the return statement?

            var focus_codes = [];
            if (params.features && focus_codes.length === 0) {
                focus_codes.push('poly_' + params.features.properties.Code);
                $.each(params.features.properties.export_values, function (code, val) {
                    focus_codes.push('poly_' + code);                    
                });
            }
            
            var set_country_opacity = function (obj, i) {
                var el = d3.select(this);
                if ($.inArray(el.attr("id"), focus_codes) === -1) {
                    el.transition()
                      .attr("opacity", 0.4);
                } else {
                    el.transition()
                      .attr("opacity", 1);
                }
            };

            // too slow!!! could be useful in firefox though!
//            var handle_transition = function (d, exporter) {
//                for (var i = 0; i < d[0].length; i++) {
//                    var sel = d3.select(d[0][i]);
//                    var sel_id = sel.attr('id');
//                    var importer_id = sel_id.slice(2);
//
//                    if (!params.out) {
////                        d3.selectAll(".country_paths")
////                            .attr("opacity", 0.2);
//                        d3.select('#poly'+importer_id)
//                            .attr("opacity", 1);
//                    } else if (params.out) {
//                        sel.transition()
//                            .attr("stroke-opacity", 0.2);
//                        d3.selectAll(".country_paths")
//                            .attr("opacity", 0.4);
//                    }
//
//                    if (!params.out &&
//                            sel_id.indexOf(params.exporter_code) !== -1) {
//                        sel.transition()
//                            .attr("stroke-opacity", params.flow_opacity_focus)
//                            .attr("stroke", params.flow_stroke_focus);
//                    } else if (!params.out &&
//                            sel_id.indexOf(params.exporter_code) === -1) {
//                        sel.transition()
//                            .attr("stroke-opacity", params.flow_opacity_other)
//                            .attr("stroke", params.flow_stroke_other);
//                    }
//                }
//            };
           
            d3.select(this)
                .transition()
                .style("font-size", params.font_size + 'px')
                .style("color", params.flow_stroke);
            d3.selectAll(".connections_group_all")
                //.call(handle_transition, params.exporter_code);
                .transition()
                .attr("stroke-opacity", params.flow_opacity_other)
                .attr("stroke", params.flow_stroke_other);
            d3.selectAll(".connections_group_" + params.exporter_code)
                .transition()
                .attr("stroke-opacity", params.flow_opacity_focus)
                .attr("stroke", params.flow_stroke_focus);
            if (params.out) {
                d3.selectAll(".country_paths")
                    .transition()
                    .attr("opacity", 0.7);
            } else {
                d3.selectAll(".country_paths")
                    .each(set_country_opacity);
            }
            
        }
    };

    var draw_lines = function (d, i) {        
        var periphery_pixels = [];
        var flow_data = [];
        var exporter_code = d.properties.Code;
        var exporter_name = d.properties.Country;
        var adjust = 0;//(data.properties.export_values['EU'] * 13);
        var centre_pixels = [this.getBBox().x + adjust, this.getBBox().y + adjust];

        var style_lines = function (d, i) {
            d3.select(this)
                .attr("stroke-width", flow_data[i].data * 3)
                .attr("id", exporter_code + '_' + flow_data[i].id);
        };

        var set_importers = function (d, i) {
            periphery_pixels.push([this.getBBox().x, this.getBBox().y]);
        }

        $.each(d.properties.export_values, function (country, value) {
            flow_data.push({'data': value, 'id': country});
            d3.select('#'+country)
                .each(set_importers);
        });

        var get_data = function () {
            var data = [];
            $.each(periphery_pixels, function(i, pixels) {
                var line = [centre_pixels, pixels];
                data.push(line);
            });
            return data;
        };

        var connections = base_map
            .append("svg:g")
            .attr("id", "connections_" + exporter_code);

        var data = get_data();
        add_outer_middle_point(data);

        connections
            .selectAll("path")
            .data(data)
            .enter().append("svg:path")
            .attr("class", "connections_group_all connections_group_" + exporter_code)
            .attr("d", getLine())
            .attr("fill", "none")
            .attr("stroke", "#1a6f51")
            .attr("stroke-opacity", 0.2)
            .each(style_lines);

        var mouse_in = {
            'out': false,
            'features': d,
            'font_size': 14,
            'flow_opacity_focus': 0.8,
            'flow_opacity_other': 0,
            'flow_stroke_focus': '#1a6f51', //'#ff6f09',
            'flow_stroke_other': '#1a6f51',
            'exporter_code': exporter_code,
            'country_opacity_focus': 1,
            'country_opacity_other': 0.2
        };

        var mouse_out = {
            'out': true,
            'features': d,
            'font_size': 8,
            'flow_opacity_focus': 0.2,
            'flow_opacity_other': 0.2,
            'flow_stroke_focus': '#1a6f51',
            'flow_stroke_other': '#1a6f51',
            'exporter_code': exporter_code,
            'country_opacity_focus': 0.6,
            'country_opacity_other': 0.6
        };

        expo_list
            .append("li")
            .text(exporter_name)
            .attr('id', 'expo_list_' + exporter_code)
            .on("mouseover", highligth_exports(mouse_in))
            .on("mouseout", highligth_exports(mouse_out));
    };

    // loading importers point features
    var importers_wrapper = base_map
        .append("svg:g")
        .attr("id", "importers");
    d3.json("/data/importers.json", function(importers) {
        importers_wrapper
        .selectAll("path")
        .data(importers.features)
        .enter().append("svg:path")
        .attr("id", function(d) {
            return d.properties['Code'];
            })
        .attr("class", "importers")
        .attr("d", path);
    });

    // loading exporters point features and drawing flows with importers
    var exporters_wrapper = base_map
        .append("svg:g")
        .attr("id", "exporters");
    d3.json("/data/exporters_data.json", function(exporters) {
        exporters_wrapper
        .selectAll("path")
        .data(exporters.features)
        .enter().append("svg:path")
        .attr("id", function(d) {
            return d.properties['Code'];
            })
        .attr("class", "exporters")
        .attr("d", path)
        .each(draw_lines);
    });

});