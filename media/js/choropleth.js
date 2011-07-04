document.addEventListener("DOMContentLoaded", main, false);

function main () {  

    var conf = new ChoroplethConf();    
    var data;
    
    var xy = d3.geo.peters(conf.map_height),
    path = d3.geo.path().projection(xy);
    
    var svg_wrapper = d3.select("body")
    .append("svg:svg")
    .attr("id", "global_wrapper")
    .style("width", conf.map_width + "px")
    .style("height", conf.map_height + "px")
    .style("border-style", 'solid')
    .style("border-width", 2)
    .style("border-color", conf.border_color);

    var states = svg_wrapper
    .append("svg:g")
    .attr("id", "states")
    .attr("transform", "translate(0," + conf.map_height * 0.031 + ")")
    .attr("class", "Greens");
    
    var selected_state = svg_wrapper
    .append("svg:g")
    .attr("id", "state")
    .attr("transform", "translate(0," + conf.map_height * 0.031 + ")");
    
    var map_title = svg_wrapper
    .append("svg:text")
    .attr("y", conf.map_height - conf.map_height * 0.125)
    .attr('fill', conf.title_colour );
    // country name
    map_title
    .append("svg:tspan")
    .attr("id", "country_name")
    .attr('font-size', conf.map_height * 0.04)
    .attr("x", conf.map_width / 2.4)
    .text('');
    // title content
    map_title
    .append("svg:tspan")
    .attr('font-size', conf.map_height * 0.04)
    .attr("x", conf.map_width / 2.4)
    .attr("dy", conf.map_height * 0.035)
    .text(conf.title);
    // country value
    map_title
    .append("svg:tspan")
    .attr("id", "country_value")
    .attr('font-size', conf.map_height * 0.04)
    //.attr("dy", conf.map_height * 0.005)
    .attr("dx", conf.map_height * 0.01)
    .text('');
    // title metadata
    map_title
    .append("svg:tspan")
    .attr('font-size', conf.map_height * 0.02)
    .attr("x", conf.map_width / 2.4)
    .attr("dy", conf.map_height * 0.025)
    .text(conf.title_metadata);
    
    
//    var results_frame = svg_wrapper
//    .append("svg:circle")
//    //.attr("width", conf.result_box_h)
//    //.attr("height", conf.result_box_h)
//    .attr('fill', "none" )
//    .attr('stroke', '#6FA3A0')
//    .attr('stroke-width', '2.5')
//    .attr("cy", 270)
//    .attr("cx", 120) 
//    .attr("r", 42) 
//    .attr("id", "results");
    

    d3.json("/media/data/world_min.json", function(collection) {
        states
        .selectAll("path")
        .data(collection.features)
        .enter().append("svg:path")
        .on("mouseover", set_highligth_feature(conf.highlight_colour, 'stroke'))        
        .attr("class", data ? quantize : null)
        .attr("d", path)
        .each(set_initial_path_coords)        
        .append("svg:title")
        .text(function(d) {
            return d.properties.NAME;
        });
    });
    
    d3.json("/media/data/forests.json", function(json) {
        data = json;
        states.selectAll("path")
        .attr("class", quantize);
    });
    
 
    function quantize(d) {
//console.log(d.properties.SOV_A3, ~~(data[d.properties.SOV_A3]), data[d.properties.SOV_A3])
        return "q" + Math.min(8, ~~(data[d.properties.SOV_A3] * 2 / 12.5)) + "-9";
    }
    
    var initial_path_coords = {};
    function set_initial_path_coords (feature, i) {
        d3.select(this)
        .attr('id', feature.properties.SOV_A3 + '_el'); // TODO: some of these are undefined!
        initial_path_coords[feature.properties.SOV_A3] = {
            x : path.centroid(feature)[0],
            y : path.centroid(feature)[1]
        }
    }
    
    function handle_mouseover (colour, attr, width) {
        // this function handles all the behaviour on countries hover
        return function (feature, i) {
            var that = this;
            highligth_feature(colour, attr, width, that);
            highligth_results(data, feature);
        };
    }
    
    function handle_mouseout (colour, attr, width) {
        return function (feature, i) {
            var that = this;
            highligth_feature(colour, attr, width, that);
            reset_results();
        };
    }
    
    function set_highligth_feature (colour, attr) {
        // creating a new feature
        // so it lies on top of everithing else and it can be correctly highlited
        return function (feature, i) {
            var s = selected_state
            .selectAll("path")
            .data([feature], function(d) {
                return d.properties.SOV_A3;
            });

            s.enter().insert("svg:path", "g")
            .attr("d", path)
            .on("mouseout", handle_mouseout(conf.norm_stroke, attr, 1))
            .on("mouseover", handle_mouseover(colour, attr, 2));
//            .append("svg:title")
//            .text(function(d) {
//                return d.properties.NAME;
//            });

            s.exit()
            .remove(); 
        };
    }
    
    function highligth_feature (colour, attr, width, that) {
        d3.select(that)
        .style(attr, colour)
        .style("stroke-width", width)
        .style("opacity", .1)
        .transition()
        .duration(100)
        .style("opacity", 1);
    }

    function refresh() {
        states
        .selectAll("path")
        .attr("d", path);
    }
    
    function highligth_results (data, feature) {
        svg_wrapper 
        .select("#country_name")
        .attr('fill', conf.highlight_colour )
        .text(feature.properties.NAME);
        svg_wrapper 
        .select("#country_value")
        .attr('fill', conf.highlight_colour )
        .text(Math.round(data[feature.properties.ISO_A3] * 100) / 100);
        svg_wrapper
        .style("border-color", conf.highlight_colour);
    }
    
    function reset_results () {
        svg_wrapper
        .select("#country_name")
        .text('');        
        svg_wrapper 
        .select("#country_value")
        .text('');
        svg_wrapper
        .style("border-color", conf.border_color);
    }
    
}