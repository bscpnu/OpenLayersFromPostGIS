var express = require('express');
var router = express.Router();

var pg = require("pg");

var username = "postgres"
var password = "postgres"
var host = "localhost"
//var database = "postgis_23_sample"
var database = "dbmanchester"
var conString = "postgres://"+username+":"+password+"@"+host+"/"+database;

query_all = "SELECT sym1, COALESCE(name, sym1) As name, ST_AsGeoJSON(geom)::json As geometry FROM public.human_built \
              UNION ALL SELECT sym1, COALESCE(name, sym1) As name, ST_AsGeoJSON(geom)::json As geometry FROM public.human_landuse \
              UNION ALL SELECT sym1, COALESCE(name, sym1) As name, ST_AsGeoJSON(geom)::json As geometry FROM public.physiography_water\
              UNION ALL SELECT sym1, COALESCE(name, sym1) As name, ST_AsGeoJSON(geom)::json As geometry FROM public.physiography_life";

//var query_all = "SELECT name, ST_AsGeoJSON(geom)::json as geometry FROM world";
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/coba', function(req, res, next) {
  res.render('coba', { title: 'Express' });
});
/*router.get('/map', function(req, res, next){
  res.render('map', { title: 'Imam Mustafa Kamal'});
});*/

/* GET Postgres JSON data */
router.get('/map', function (req, res) {
    var client = new pg.Client(conString);
    client.connect();
    var query = client.query(query_all);
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    // Pass the result to the map page
    query.on("end", function (result) {
        var data = JSON.stringify(result.rows) // Save the JSON as variable data
        //console.log(JSON.stringify(data));
        res.render('map', {
            title: "All Layers", // Give a title to our page
            jsonData: data // Pass data to the View
        });
    });
});

/* GET the filtered page */
router.get('/filter*', function (req, res) {
    var name = req.query.name;
    if (name.indexOf("--") > -1 || name.indexOf("'") > -1 || name.indexOf(";") > -1 || name.indexOf("/*") > -1 || name.indexOf("xp_") > -1){
        console.log("Bad request detected");
        res.redirect('/map');
        return;
    }else if(name == 'All'){
        console.log("Request passed");
        var client = new pg.Client(conString);
        client.connect();
        var query = client.query(query_all);
        query.on("row", function (row, result) {
            result.addRow(row);
        });
        // Pass the result to the map page
        query.on("end", function (result) {
            var data = JSON.stringify(result.rows) // Save the JSON as variable data
            //console.log(JSON.stringify(data));
            res.render('map', {
                title: "All Layers", // Give a title to our page
                jsonData: data // Pass data to the View
            });
        });
    }else {
        console.log("Request passed")

        var filter_query = "SELECT sym1, COALESCE(name, sym1) As name, ST_AsGeoJSON(geom)::json As geometry FROM public.human_built where sym1=\'" + name + "\'\
                      UNION ALL SELECT sym1, COALESCE(name, sym1) As name, ST_AsGeoJSON(geom)::json As geometry FROM public.human_landuse where sym1=\'" + name + "\' \
                      UNION ALL SELECT sym1, COALESCE(name, sym1) As name, ST_AsGeoJSON(geom)::json As geometry FROM public.physiography_water where sym1=\'" + name + "\' \
                      UNION ALL SELECT sym1, COALESCE(name, sym1) As name, ST_AsGeoJSON(geom)::json As geometry FROM public.physiography_life where sym1=\'" + name + "\'";
        var client = new pg.Client(conString);
        client.connect();
        var query = client.query(filter_query);
        query.on("row", function (row, result) {
            result.addRow(row);
        });
        // Pass the result to the map page
        query.on("end", function (result) {
            var data = JSON.stringify(result.rows)
            var newTitle = name + " Layer"// Save the JSON as variable data
            //console.log(JSON.stringify(data));
            res.render('map', {
                title: toTitleCase(newTitle), // Give a title to our page
                jsonData: data
                 // Pass data to the View
            });
        });
    };
});

/* GET the filtered page */
router.get('/rectangle*', function (req, res) {
    var xmin = req.query.xmin;
    var ymin = req.query.ymin;
    var xmax = req.query.xmax;
    var ymax = req.query.ymax;

    console.log("Request rectangle passed")
    var filter_query = "SELECT sym1, COALESCE(name, sym1) As name, ST_AsGeoJSON(geom)::json As geometry FROM public.human_built \
                        WHERE geom && ST_MakeEnvelope(\'"+xmin+"\', \'"+ymin+"\', \'"+xmax+"\', \'"+ymax+"\', 4326) \
                        UNION ALL \
                        SELECT sym1, COALESCE(name, sym1) As name, ST_AsGeoJSON(geom)::json As geometry FROM public.human_landuse \
                        WHERE geom && ST_MakeEnvelope(\'"+xmin+"\', \'"+ymin+"\', \'"+xmax+"\', \'"+ymax+"\', 4326) \
                        UNION ALL \
                        SELECT sym1, COALESCE(name, sym1) As name, ST_AsGeoJSON(geom)::json As geometry FROM physiography_water \
                        WHERE geom && ST_MakeEnvelope(\'"+xmin+"\', \'"+ymin+"\', \'"+xmax+"\', \'"+ymax+"\', 4326) \
                        UNION ALL \
                        SELECT sym1, COALESCE(name, sym1) As name, ST_AsGeoJSON(geom)::json As geometry FROM physiography_life \
                        WHERE geom && ST_MakeEnvelope(\'"+xmin+"\', \'"+ymin+"\', \'"+xmax+"\', \'"+ymax+"\', 4326)";

    var client = new pg.Client(conString);
    client.connect();
    var query = client.query(filter_query);
    query.on("row", function (row, result) {
            result.addRow(row);
    });
    // Pass the result to the map page
    query.on("end", function (result) {
        var data = JSON.stringify(result.rows) // Save the JSON as variable data
        //console.log(JSON.stringify(data));
        res.render('map', {
          title: "All Layers", // Give a title to our page
          jsonData: data // Pass data to the View
        });
    });
});


function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

module.exports = router;
