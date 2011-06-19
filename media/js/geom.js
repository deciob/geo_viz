var viz_geom = {};

viz_geom.get_distance_between_points = function (a, b) {
    return Math.sqrt((Math.pow((b.x - a.x), 2) + Math.pow((b.y - a.y), 2)));
};