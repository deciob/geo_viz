var viz_cluster = {};


viz_cluster.get_all_coordinates = function (data) {
    var coordinates = [];
    var data = data[0];
    var i;
    for (i = 0; i < data.length; ++i) {
        var x = data[i].getBBox().x;
        var y = data[i].getBBox().y;
        coordinates.push({'x': x, 'y': y, 'id': data[i].id});
    }
    return coordinates;
};

viz_cluster.get_coordinates_from_id = function (el_id) {
    //console.log(el_id)
    var element = d3.select('#' + el_id)[0][0];
    //debugger;
    var x = element.getBBox().x;
    var y = element.getBBox().y;
    return {'x': x, 'y': y, 'id': el_id};
};


viz_cluster.create_distance_matrix = function (coordinates) {
    //console.log('create_distance_matrix', coordinates)
    /* coordinates is a list of objects like this one:
     * id: "AO"
     * x: 520.6220092773438
     * y: 301.8377685546875
     */
    var i;
    var distance_matrix = [];
    for (i = 0; i < coordinates.length; ++i) {
        var ii;
        var row = [];
        var first_point = coordinates[i];
        for (ii = 0; ii < coordinates.length; ++ii) {
            var second_point = coordinates[ii];
            var distance = viz_geom.get_distance_between_points(
                first_point, second_point);
            row.push({'dist': distance, 'els': [first_point.id, second_point.id]});
        }
        distance_matrix.push(row);
    }
    return distance_matrix;
};


viz_cluster.update_matrix = function (matrix) {
    console.log('update_matrix', matrix)
    /*
     * matrix is an array of arrays with the following structure:
     *
     *  1: Object
     *      dist: 6.324990142819035
     *      els: Array[2]
     *          0: "AR" // row
     *          1: "AU" // column
     *      length: 2
     *
     *  els changes as the matrix is updated and grows into a nested structure
     */

    var new_matrix, cleaned_new_matrix;

    // pickes the obj with smallest distance from the distance-matrix
    var min_distance_obj = viz_cluster.get_min_distance_el(matrix);

    new_matrix = viz_cluster.add_new_cluster_els(matrix, min_distance_obj);
    cleaned_new_matrix = viz_cluster.remove_old_cluster_els(new_matrix, min_distance_obj);

    if (cleaned_new_matrix.length > 1) {
        viz_cluster.update_matrix(cleaned_new_matrix);
    }
};

viz_cluster.add_new_cluster_els = function (matrix, min_distance_obj) {
    //console.log('add_new_cluster_els, min_distance_el: ', min_distance_obj);
    /*
     * min_distance_obj is the object with the smallest distance value from matrix
     */
    var i, ii;
    var new_matrix = [];
    // adding new cluster elements to matrix
    /* at matrix.length 5:
     * 0: Object
            dist: 1.897618326269538
            els: Array[2]
            0: Object // why?
            1: "MA"
        length: 2
     */
    // tmp
    if (min_distance_obj.els[0].els) {
        var coordinates_a = viz_cluster.get_coordinates_from_id(min_distance_obj.els[0].els[0]); // fails!
        var coordinates_b = viz_cluster.get_coordinates_from_id(min_distance_obj.els[0].els[1]);
    } else {
        var coordinates_a = viz_cluster.get_coordinates_from_id(min_distance_obj.els[0]); // fails!
        var coordinates_b = viz_cluster.get_coordinates_from_id(min_distance_obj.els[1]);
    }

//    var coordinates_a = viz_cluster.get_coordinates_from_id(min_distance_obj.els[0]); // fails!
//    var coordinates_b = viz_cluster.get_coordinates_from_id(min_distance_obj.els[1]);
    var extra_row = [];

    for (i = 0; i < matrix.length; ++i) {
        var min_dist, els;        
        var row_copy = [];

        for (ii = 0; ii < matrix.length; ++ii) {
            row_copy.push(matrix[i][ii]);
        }

        // setting up the extra row (array of objects) on the first loop
        if (i === 0) {
            for (ii = 0; ii < matrix.length; ++ii) {
                var matrix_row_obj_id = matrix[i][ii].els[1]; // els[1] is the row el
                var coordinates = viz_cluster.get_coordinates_from_id(matrix_row_obj_id);
                var dist_a = viz_geom.get_distance_between_points(
                    coordinates, coordinates_a);
                var dist_b = viz_geom.get_distance_between_points(
                    coordinates, coordinates_b);
                if (dist_a < dist_b) {
                    min_dist = dist_a;
                    els = [min_distance_obj, min_distance_obj.els[0]];
                    //els = [min_distance_obj.els[0], min_distance_obj];
                } else if (dist_a > dist_b) {
                    min_dist = dist_b;
                    els = [min_distance_obj, min_distance_obj.els[1]];
                    //els = [min_distance_obj.els[1], min_distance_obj];
                } else {
                    console.log('dist_a === dist_b');
                }
                var new_matrix_el = {'dist': min_dist, 'els': els};
                extra_row.push(new_matrix_el);

            }
            extra_row.push({'dist': 0, 'els': min_distance_obj});
        }
        row_copy.push(extra_row[i]);
        //console.log('extra_row[i]', extra_row[i]);
        new_matrix.push(row_copy);
    }
    new_matrix.push(extra_row);
    return new_matrix;
};

viz_cluster.remove_old_cluster_els = function (matrix, min_distance_el) {
    //console.log('remove_old_cluster_els', matrix, matrix.length);
    var positions = min_distance_el.matrix_pos;
    //console.log('positions', positions)
    var i, ii;
    var new_matrix = [];
    for (i = 0; i < matrix.length; ++i) {
        //console.log(i, positions[0], positions[1])
        var new_row = [];
        if (i !== positions[0] && i !== positions[1]) {

            for (ii = 0; ii < matrix.length; ++ii) {
                new_row.push(matrix[i][ii]);
            }

            new_row.splice(positions[0], 1);
            new_row.splice(positions[1], 1);
            new_matrix.push(new_row);
        } else {
            //console.log('@@@', i)
        }
    }
    //console.log('new_matrix.length', new_matrix.length);
    return new_matrix;
};



viz_cluster.get_min_distance_el = function (matrix) {
    //console.log(matrix)
    var i, ii;
    var min_distance_el = {'dist': matrix[0][1].dist, 'pos': [0,1], 'els': matrix[0][1].els};
    for (i = 0; i < matrix.length; ++i) {
        var row = matrix[i];
        for (ii = i+1; ii < row.length; ++ii) {
            min_distance_el =
                matrix[i][ii].dist < min_distance_el.dist ?
                {'dist': matrix[i][ii].dist,  'matrix_pos': [i,ii], 'els': matrix[0][1].els} :
                min_distance_el;
        }
    }
    //debugger;
    //console.log(min_distance_el)
    return min_distance_el;
};


viz_cluster.update_clusters = function (clusters, min_distance_el) {
    //console.log(clusters, min_distance)
    var positions = [min_distance_el.matrix_pos[0], min_distance_el.matrix_pos[1]];//.sort();
    //console.log(positions)
    var new_cluster = [clusters[positions[0]], clusters[positions[1]]];
    clusters.splice(positions[1], 1);
    clusters.splice(positions[0], 1);
    clusters.push(new_cluster);
    //console.log(clusters)
    return clusters;
};


viz_cluster.get_single_linkage_min_distance = function (matrix) {
    
};




viz_cluster.cluster_points = function (data) {
    //console.log(data)
    var clusters = data[0];
    var coordinates = viz_cluster.get_all_coordinates(data);
    //console.log(coordinates, coordinates.length)
    var distance_matrix = viz_cluster.create_distance_matrix(coordinates);
    //console.log(distance_matrix)
    //var min_distance_el = viz_cluster.get_min_distance_el(distance_matrix);

    //var clusters = viz_cluster.update_clusters(clusters, min_distance_el); //TODO
    //console.log('cluster_points', distance_matrix, distance_matrix.length)


    viz_cluster.update_matrix(distance_matrix);

    //console.log(min_distance)
};