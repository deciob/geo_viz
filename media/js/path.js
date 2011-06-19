$(document).ready(function(){

var width = 960,
height = 500,
// pixel origin starts upper-left, so flipping the y-origin to
// simulate a cartesian plane where... this is a test...
y = d3.scale.linear().domain([0,height]).range([height,0]);

// some data, every nested array group is the start-end of a segment
//var data = [
//    [[100, 200], [400, 200]]//, [200, 300]]//,
//    //[[100, 100], [250, 100], [400, 100]]
//    //[[100, 100], [200, 300]]
//];

var data = [[[604.25, 196], [838, 178]]]
//add_middle_point(data);

function getLine() {
    return d3.svg.line()
    .x(function(d, i) { return d[0] })
    .y(function(d, i) { return y(d[1]) })
    .interpolate("basis")
}

function get_middle_point (a, b) {
    var x = (b[0] + a[0]) / 2,
    y = (b[1] + a[1]) / 2,
    c = [x, y];
    return c;
}

function get_slope (a, b) {
    return (b[1] - a[1]) / (b[0] - a[0]);
}

function get_outer_middle_point (a, b) {
    //
    var m = get_slope(a, b),
    c = get_middle_point (a, b),
    y = c[1] + 40,
    x=100;
    x = (y - c[1]) / (-1 / m) + c[0]
    return([x, y]);
}

function add_outer_middle_point (data) {
    $.each(data, function (i, path) {
        var m = get_middle_point(path[0], path[1]),
        m_out = get_outer_middle_point(path[0], path[1])
        path.splice(1, 0, m_out);
        //console.log(path)
    })
}
add_outer_middle_point(data);


function create_bezier () {
    '<path d="M70 60 C 70 80, 110 80, 110 60" stroke="black" fill="transparent"/>'
    '<path d="M100,200 C100,100 250,100 250,200 S400,300 400,200" stroke="black" fill="transparent" />'
}

var s = d3.select("body")
.append("svg:svg")
.attr("width", "960px")
.attr("height", "500px")
.attr("id", "map")
.append("svg:g")
.attr("id", "cucu");

s.selectAll("path")
.data(data)
.enter().append("svg:path")
.attr("d", getLine())
.attr("fill", "none")
.attr("stroke", "steelblue")
.attr("stroke-width", 6)
;

});