function EsriJsonGeometryHelper() {

}

EsriJsonGeometryHelper.ParseGeoJson = function (geoJson, srid) {

    if (geoJson.type == "Point") {
        return { "x": geoJson.coordinates[0], "y": geoJson.coordinates[1], "spatialReference": { "wkid": srid } };
    }
    else if (geoJson.type == "MultiPoint") {
        return { "points": [geoJson.coordinates], "spatialReference": { "wkid": srid } };
    }
    else if (geoJson.type == "LineString") {
        return { "paths": [geoJson.coordinates], "spatialReference": { "wkid": srid } };
    }
    else if (geoJson.type == "MultiLineString") {
        return { "paths": geoJson.coordinates, "spatialReference": { "wkid": srid } };
    }
    else if (geoJson.type == "Polygon") {
        return { "rings": geoJson.coordinates, "spatialReference": { "wkid": srid } };
    }
    else if (geoJson.type = "MultiPolygon") {

        var resultArray = [];

        if (geoJson.coordinates) {

            var resultArray = geoJson.coordinates[0];

            for (var i = 1; i < geoJson.coordinates.length; i++) {
                resultArray = resultArray.concat(geoJson.coordinates[i]);
            }
        }

        return { "rings": resultArray, "spatialReference": { "wkid": srid } };
    }
    else {
        return undefined;
    }

}

EsriJsonGeometryHelper.ToGeoJson = function (esriJsonGeometry) {

    if (esriJsonGeometry.x) {
        return { type: "Point", "coordinates": [esriJsonGeometry.x, esriJsonGeometry.y] };
    }
    else if (esriJsonGeometry.points) {
        return { type: "MultiPoint", "coordinates": esriJsonGeometry.points };
    }
    else if (esriJsonGeometry.paths) {

        if (esriJsonGeometry.paths[0][0].length) {
            return { type: "MultiLineString", "coordinates": esriJsonGeometry.paths };
        }
        else {
            return { type: "LineString", "coordinates": esriJsonGeometry.paths };
        }
    }
    else if (esriJsonGeometry.rings) {
        return { type: "Polygon", "coordinates": esriJsonGeometry.rings };
    }
    else {
        return undefined;
    }
}