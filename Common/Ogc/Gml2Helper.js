//in the name of Allah

//GML 2.1.2

function Gml2Helper() {

};


//Gml2 <-> Esri Json Geometry
Gml2Helper.CreatePoint = function (x, y, writeGmlPrefix, srid) {

    var result = {
        'Point': {
            '__prefix': writeGmlPrefix ? 'gml' : undefined,
            'coordinates': {
                '__prefix': writeGmlPrefix ? 'gml' : undefined,
                '_decimal': '.',
                '_cs': ',',
                '_ts': ' ',
                '__text': x + ',' + y
            }
        }
    };

    if (srid) {
        result.Point._srsName = 'http://www.opengis.net/gml/srs/epsg.xml#' + srid;
    }

    return result;
}

Gml2Helper.CreateMultiPoint = function (pointArray, writeGmlPrefix, srid) {

    var result = {
        'MultiPoint': {
            '__prefix': writeGmlPrefix ? 'gml' : undefined,
            'pointMember': []
        }
    };

    for (var i = 0; i < pointArray.length; i++) {
        result.MultiPoint.pointMember.push(
            Gml2Helper.CreatePoint(pointArray[i][0], pointArray[i][1], writeGmlPrefix, undefined)
        );

        result.MultiPoint.pointMember[i].__prefix = writeGmlPrefix ? 'gml' : undefined;
    }

    if (srid) {
        result.MultiPoint._srsName = 'http://www.opengis.net/gml/srs/epsg.xml#' + srid;
    }

    return result;
}

Gml2Helper.CreateLineString = function (pointArray, writeGmlPrefix, srid) {

    var result = {
        'LineString': {
            '__prefix': writeGmlPrefix ? 'gml' : undefined,
        }
    };

    //result['gml:LineString']['gml:coordinates'] = Gml2Helper.getCoordinatesNode(pointArray)
    result.LineString.coordinates = Gml2Helper.getCoordinatesNode(pointArray, writeGmlPrefix)

    if (srid) {
        result.LineString._srsName = 'http://www.opengis.net/gml/srs/epsg.xml#' + srid;
    }

    return result;
}

//multiLineStringPointArray must be of type point[][]
Gml2Helper.CreateMultiLineString = function (multiLineStringPointArray, writeGmlPrefix, srid) {

    var result = {
        'MultiLineString': {
            '__prefix': writeGmlPrefix ? 'gml' : undefined,
            'lineStringMember': []
        }
    };

    for (var i = 0; i < multiLineStringPointArray.length; i++) {
        result.MultiLineString.lineStringMember.push(
            Gml2Helper.CreateLineString(multiLineStringPointArray[i], writeGmlPrefix, undefined)
        );

        result.MultiLineString.lineStringMember[i].__prefix = writeGmlPrefix ? 'gml' : undefined;
    }

    //result['gml:LineString']['gml:coordinates'] = Gml2Helper.getCoordinatesNode(pointArray)

    if (srid) {
        result.MultiLineString._srsName = 'http://www.opengis.net/gml/srs/epsg.xml#' + srid;
    }

    return result;
}

//
Gml2Helper.CreatePolygon = function (ringArray, writeGmlPrefix, srid) {

    var result = {
        'Polygon': {
            '__prefix': writeGmlPrefix ? 'gml' : undefined,
            'outerBoundaryIs': {
                '__prefix': writeGmlPrefix ? 'gml' : undefined,
                'LinearRing': {
                    '__prefix': writeGmlPrefix ? 'gml' : undefined,
                    'coordinates': Gml2Helper.getCoordinatesNode(ringArray[0], writeGmlPrefix)
                }
            },
            //'innerBoundaryIs': []
        }
    };

    if (ringArray.length > 1) {
        result.Polygon.innerBoundaryIs = [];

        for (var i = 1; i < ringArray.length; i++) {
            result.Polygon.innerBoundaryIs.push(
                {
                    'LinearRing': {
                        '__prefix': writeGmlPrefix ? 'gml' : undefined,
                        'coordinates': Gml2Helper.getCoordinatesNode(ringArray[i], writeGmlPrefix)
                    }
                }
            );

            result.Polygon.innerBoundaryIs[i - 1].__prefix = writeGmlPrefix ? 'gml' : undefined;
        }
    }



    if (srid) {
        result.Polygon._srsName = 'http://www.opengis.net/gml/srs/epsg.xml#' + srid;
    }

    return result;
}


Gml2Helper.CreateMultiPolygon = function (multiPolygonRingArray, writeGmlPrefix, srid) {

    var result = {
        'MultiPolygon': {
            '__prefix': writeGmlPrefix ? 'gml' : undefined,
            'polygonMember': []
        }
    };

    for (var i = 0; i < multiPolygonRingArray.length; i++) {

        var polygon = Gml2Helper.CreatePolygon(multiPolygonRingArray[i], writeGmlPrefix, undefined);

        result.MultiPolygon.polygonMember.push(polygon);
    }

    if (srid) {
        result.MultiPolygon._srsName = 'http://www.opengis.net/gml/srs/epsg.xml#' + srid;
    }

    return result;
}


Gml2Helper.getCoordinatesNode = function (pointArray, writeGmlPrefix) {

    var result =
        {
            '__prefix': writeGmlPrefix ? 'gml' : undefined,
            '_decimal': '.',
            '_cs': ',',
            '_ts': ' ',
            '__text': Gml2Helper.getCoordinatesString(pointArray)
        };

    return result;
}

Gml2Helper.getCoordinatesString = function (pointArray) {
    var result = "";

    for (var i = 0; i < pointArray.length; i++) {
        result = result + pointArray[i][0] + ',' + pointArray[i][1] + ' ';
    }

    return result;
}

Gml2Helper.ParseEsriJsonGeometry = function (esriJsonGeometry, writeGmlPrefix) {

    if (esriJsonGeometry.x) {
        return Gml2Helper.CreatePoint(esriJsonGeometry.x, esriJsonGeometry.y, writeGmlPrefix, esriJsonGeometry.spatialReference.wkid);
    }
    else if (esriJsonGeometry.points) {
        return Gml2Helper.CreateMultiPoint(esriJsonGeometry.points, writeGmlPrefix, esriJsonGeometry.spatialReference.wkid);
    }
    else if (esriJsonGeometry.paths) {
        return Gml2Helper.CreateMultiLineString(esriJsonGeometry.paths, writeGmlPrefix, esriJsonGeometry.spatialReference.wkid);
    }
    else if (esriJsonGeometry.rings) {
        return Gml2Helper.CreatePolygon(esriJsonGeometry.rings, writeGmlPrefix, esriJsonGeometry.spatialReference.wkid);
    }
}

// ----- ESRI JSON GEOMETRY ----
//Gml2Helper.ParseEsriJsonPoint = function (esriJsonPoint, writeGmlPrefix) {
//    return Gml2Helper.CreatePoint(esriJsonPoint.x, esriJsonPoint.y, writeGmlPrefix, esriJsonPoint.spatialReference.wkid);
//}
//Gml2Helper.ParseEsriJsonMultiPoint = function (esriJsonMultiPoint, writeGmlPrefix) {
//    return Gml2Helper.CreateMultiPoint(esriJsonMultiPoint.points, writeGmlPrefix, esriJsonMultiPoint.spatialReference.wkid);
//}
//Gml2Helper.ParseEsriJsonPolyline = function (esriJsonLineString, writeGmlPrefix) {
//    return Gml2Helper.CreateMultiLineString(esriJsonLineString.paths, writeGmlPrefix, esriJsonLineString.spatialReference.wkid);
//}
//Gml2Helper.ParseEsriJsonPolygon = function (esriJsonPolygon, writeGmlPrefix) {
//    return Gml2Helper.CreatePolygon(esriJsonPolygon.rings, writeGmlPrefix, esriJsonPolygon.spatialReference.wkid);
//}



//Gml2 <- GeoJson
Gml2Helper.ParseGeoJson = function (geoJson, writeGmlPrefix, srid) {
    if (geoJson.type == "Point") {
        return Gml2Helper.CreatePoint(geoJson.coordinates[0], geoJson.coordinates[1], writeGmlPrefix, srid);
    }
    if (geoJson.type == "MultiPoint") {
        return Gml2Helper.CreateMultiPoint(geoJson.coordinates, writeGmlPrefix, srid);
    }
    if (geoJson.type == "LineString") {
        return Gml2Helper.CreateLineString(geoJson.coordinates, writeGmlPrefix, srid);
    }
    if (geoJson.type == "MultiLineString") {
        return Gml2Helper.CreateMultiLineString(geoJson.coordinates, writeGmlPrefix, srid);
    }
    if (geoJson.type == "Polygon") {
        return Gml2Helper.CreatePolygon(geoJson.coordinates, writeGmlPrefix, srid);
    }
    if (geoJson.type == "MultiPolygon") {
        return Gml2Helper.CreateMultiPolygon(geoJson.coordinates, writeGmlPrefix, srid);
    }
}


//Gml3 -> GeoJson
Gml2Helper.ToGeoJson = function (gmlAsJson) {
    if (gmlAsJson.Point) {
        return {
            type: "Point",
            coordinates: Gml2Helper.parseGmlPointToGeoJsonCoordinates(gmlAsJson.Point)
        };
    }
    else if (gmlAsJson.MultiPoint) {
        var result = {
            type: "MultiPoint",
            coordinates: []
        };

        for (var i = 0; i < gmlAsJson.MultiPoint.pointMember.length; i++) {
            result.coordinates.push(Gml2Helper.parseGmlPointToGeoJsonCoordinates(gmlAsJson.MultiPoint.pointMember[i].Point));
        }
        return result;
    }
    else if (gmlAsJson.LineString) {
        var result = {
            type: "LineString",
            coordinates: []
        };

        result.coordinates = Gml2Helper.parseGmlLineStringToGeoJsonCoordinates(gmlAsJson.LineString);
        return result;
    }
    else if (gmlAsJson.MultiLineString) {
        var result = {
            type: "MultiLineString",
            coordinates: []
        };

        for (var i = 0; i < gmlAsJson.MultiLineString.lineStringMember.length; i++) {
            result.coordinates.push(Gml2Helper.parseGmlLineStringToGeoJsonCoordinates(gmlAsJson.MultiLineString.lineStringMember[i].LineString));
        }

        return result;
    }
    else if (gmlAsJson.Polygon) {
        var result = {
            type: "Polygon",
            coordinates: Gml2Helper.parseGmlPolygonToGeoJsonCoordinates(gmlAsJson.Polygon)
        };

        return result;
    }
    else if (gmlAsJson.MultiPolygon) {
        var result = {
            type: "MultiPolygon",
            coordinates: []
        };

        for (var s = 0; s < gmlAsJson.MultiPolygon.polygonMember.length; s++) {
            result.coordinates.push(Gml2Helper.parseGmlPolygonToGeoJsonCoordinates(gmlAsJson.MultiPolygon.polygonMember[s].Polygon));
        }

        return result;
    }
}

Gml2Helper.parseGmlPointToGeoJsonCoordinates = function (gmlPoint) {
    var coordinates = gmlPoint.coordinates.__text.split(",");

    return [parseFloat(coordinates[0]), parseFloat(coordinates[1])];
}

Gml2Helper.parseGmlLineStringToGeoJsonCoordinates = function (gmlLineString) {
    var result = [];

    var points = gmlLineString.coordinates.__text.split(" ");

    for (var i = 0; i < points.length; i++) {
        if (points[i]) {
            var xys = points[i].split(",");

            result.push([parseFloat(xys[0]), parseFloat(xys[1])]);
        }
    }

    return result;
};

Gml2Helper.parseGmlPolygonToGeoJsonCoordinates = function (gmlPolygon) {
    var result = [];

    result.push(Gml2Helper.parseGmlLineStringToGeoJsonCoordinates(gmlPolygon.outerBoundaryIs.LinearRing));

    if (gmlPolygon.innerBoundaryIs) {
        for (var i = 0; i < gmlPolygon.innerBoundaryIs.length; i++) {
            result.push(Gml2Helper.parseGmlLineStringToGeoJsonCoordinates(gmlPolygon.innerBoundaryIs[i].LinearRing));
        }
    }

    return result;
};

(function gml2Test() {

    ///
    var point = {
        "type": "Point",
        "coordinates": [30, 10]
    };
    var gmlPoint = Gml2Helper.ParseGeoJson(point, true);
    var geojsonPoint = Gml2Helper.ToGeoJson(gmlPoint);
    if (JSON.stringify(point) != JSON.stringify(geojsonPoint)) {
        throw "exception at GML to GeoJSON - point"
    }

    ///
    var multiPoint = {
        "type": "MultiPoint",
        "coordinates": [
            [10, 40], [40, 30], [20, 20], [30, 10]
        ]
    };
    var gmlMultiPoint = Gml2Helper.ParseGeoJson(multiPoint, true);
    var geojsonMultiPoint = Gml2Helper.ToGeoJson(gmlMultiPoint);
    if (JSON.stringify(multiPoint) != JSON.stringify(geojsonMultiPoint)) {
        throw "exception at GML to GeoJSON - multiPoint"
    }


    ///
    var lineString = {
        "type": "LineString",
        "coordinates": [
            [30, 10], [10, 30], [40, 40]
        ]
    };
    var gmllineString = Gml2Helper.ParseGeoJson(lineString, true);
    var geojsonLineString = Gml2Helper.ToGeoJson(gmllineString);
    if (JSON.stringify(lineString) != JSON.stringify(geojsonLineString)) {
        throw "exception at GML to GeoJSON - lineString"
    }

    ///
    var multiLinestring = {
        "type": "MultiLineString",
        "coordinates": [
            [[10, 10], [20, 20], [10, 40]],
            [[40, 40], [30, 30], [40, 20], [30, 10]]
        ]
    };
    var gmlMultiLinestring = Gml2Helper.ParseGeoJson(multiLinestring, true);
    var geojsonMultiLinestring = Gml2Helper.ToGeoJson(gmlMultiLinestring);
    if (JSON.stringify(multiLinestring) != JSON.stringify(geojsonMultiLinestring)) {
        throw "exception at GML to GeoJSON - multiLinestring"
    }

    ///
    var polygon = {
        "type": "Polygon",
        "coordinates": [
            [[35, 10], [45, 45], [15, 40], [10, 20], [35, 10]],
            [[20, 30], [35, 35], [30, 20], [20, 30]]
        ]
    };
    var gmlPolygon = Gml2Helper.ParseGeoJson(polygon, true);
    var geojsonPolygon = Gml2Helper.ToGeoJson(gmlPolygon);
    if (JSON.stringify(polygon) != JSON.stringify(geojsonPolygon)) {
        throw "exception at GML to GeoJSON - polygon"
    }

    var polygon2 = {
        "type": "Polygon",
        "coordinates": [
            [[30, 10], [40, 40], [20, 40], [10, 20], [30, 10]]
        ]
    };
    var gmlPolygon2 = Gml2Helper.ParseGeoJson(polygon2, true);
    var geojsonPolygon2 = Gml2Helper.ToGeoJson(gmlPolygon2);
    if (JSON.stringify(polygon2) != JSON.stringify(geojsonPolygon2)) {
        throw "exception at GML to GeoJSON - polygon2"
    }

    ///
    var multiPolygon = {
        "type": "MultiPolygon",
        "coordinates": [
            [
                [[30, 20], [45, 40], [10, 40], [30, 20]]
            ],
            [
                [[15, 5], [40, 10], [10, 20], [5, 10], [15, 5]]
            ]
        ]
    };
    var gmlMultiPolygon = Gml2Helper.ParseGeoJson(multiPolygon, true);
    var geojsonMultiPolygon = Gml2Helper.ToGeoJson(gmlMultiPolygon);
    if (JSON.stringify(multiPolygon) != JSON.stringify(geojsonMultiPolygon)) {
        throw "exception at GML to GeoJSON - multiPolygon"
    }

    var multiPolygon2 = {
        "type": "MultiPolygon",
        "coordinates": [
            [
                [[30, 20], [45, 40], [10, 40], [30, 20]]
            ],
            [
                [[15, 5], [40, 10], [10, 20], [5, 10], [15, 5]]
            ]
        ]
    };
    var gmlMultiPolygon2 = Gml2Helper.ParseGeoJson(multiPolygon2, true);
    var geojsonMultiPolygon2 = Gml2Helper.ToGeoJson(gmlMultiPolygon2);
    if (JSON.stringify(multiPolygon2) != JSON.stringify(geojsonMultiPolygon2)) {
        throw "exception at GML to GeoJSON - multiPolygon2"
    }
})();

//gml2Test();