# Part 2. OpenLayersFromPostGIS
## Components: PostGIS, OpenLayers, NodeJS, and Express with Jade
#### Program Assigment SDB Class, Pusan National University 2017
#### Imam Mustafa Kamal (201683609) & Boubenna hadjer (201593278)

#### After sucessfully converting OSM data to PostGIS as shown in https://github.com/bscpnu/ConvertOsmPostGIS, in this part we display those data to the web. 

Features list that will be displayed are as follow:
Road, railroad, building, parking, park, industrial, barrier, platform, playing_field, plaza, water, waterway, grass and garden. Those features list are retrieved from tables: human_built, human_landuse, physiography_water, and physiongraphy_life.

First thing first, let's create an index for our data to make it more easily searchable using the following statement

--CREATE INDEX human_built_gist ON public.human_built USING gist (geom);
--CREATE INDEX human_landuse_gist ON public. human_landuse USING gist (geom);
--CREATE INDEX physiography_water_gist ON public. physiography_water USING gist (geom);
--CREATE INDEX physiography_life_gist ON public. physiography_life USING gist (geom);

Screenshot
1. localhost:3000/map
![overview](https://user-images.githubusercontent.com/29518994/27261767-c2bc8fca-5484-11e7-8269-6c0156540efe.png)

2. Select road layer
![road network](https://user-images.githubusercontent.com/29518994/27261789-2d7fc4c6-5485-11e7-9ea8-76d4080a04da.png)

3. Select spatial object
![select map](https://user-images.githubusercontent.com/29518994/27261800-55b71d86-5485-11e7-8adb-b4a701fbad3f.png)

4. Query data in rectangle area. input (xmin, ymin, xmax, ymax) = (-2.2364, 53.4823, -2.2301, 53.4862)
![select rectangle](https://user-images.githubusercontent.com/29518994/27261816-8f46dcb2-5485-11e7-8586-1e2b06ef09ea.png)

Query : SELECT sym1, COALESCE(name, sym1) As name, ST_AsGeoJSON(geom)::json As geometry FROM public.human_built WHERE geom && ST_MakeEnvelope(\'"+xmin+"\', \'"+ymin+"\', \'"+xmax+"\', \'"+ymax+"\', 4326).

From above figure (point number 4), it can reveal that all the spatial object overlapping with the given rectangle coordinate will be included.
