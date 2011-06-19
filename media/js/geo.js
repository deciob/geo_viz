// ***** *****
// extending d3.geo with the peters projection
// see: http://mathworld.wolfram.com/PetersProjection.html
// ***** *****

d3.geo.peters = function(map_height) {

    // the following values are empirical best fits.
    // TODO: is there a more formal way?
    var scale = 0.36 * map_height,
        translate = [0.96 * map_height, 0.5 * map_height];

    function peters(coordinates) {
        var x_rad = coordinates[0] * Math.PI / 180,
        y_rad = coordinates[1] * Math.PI / 180,
        x = x_rad * Math.cos(44.138 * Math.PI / 180),
        y = -Math.sin(y_rad) * 1 / Math.cos(44.138 * Math.PI / 180);
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