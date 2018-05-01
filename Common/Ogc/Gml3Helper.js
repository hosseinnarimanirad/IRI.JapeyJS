//in the name of Allah

//GML 3.0.0

function Gml3Helper() {

};



//Gml3 <-> Esri Json Geometry
Gml3Helper.CreatePoint = function (x, y, writeGmlPrefix, srid) {

    var result = {
        'Point': {
            '__prefix': writeGmlPrefix ? 'gml' : undefined,
            'pos': {
                '__prefix': writeGmlPrefix ? 'gml' : undefined,
                '__text': x + ' ' + y
            }
        }
    };

    if (srid) {
        result.Point._srsName = 'http://www.opengis.net/gml/srs/epsg.xml#' + srid;
    }

    return result;
}

Gml3Helper.CreateMultiPoint = function (pointArray, writeGmlPrefix, srid) {

    var result = {
        'MultiPoint': {
            '__prefix': writeGmlPrefix ? 'gml' : undefined,
            'pointMember': []
        }
    };

    for (var i = 0; i < pointArray.length; i++) {
        result.MultiPoint.pointMember.push(
            Gml3Helper.CreatePoint(pointArray[i][0], pointArray[i][1], writeGmlPrefix, undefined)
        );

        result.MultiPoint.pointMember[i].__prefix = writeGmlPrefix ? 'gml' : undefined;
    }

    if (srid) {
        result.MultiPoint._srsName = 'http://www.opengis.net/gml/srs/epsg.xml#' + srid;
    }

    return result;
}

Gml3Helper.CreateLineString = function (pointArray, writeGmlPrefix, srid) {

    var result = {
        'LineString': {
            '__prefix': writeGmlPrefix ? 'gml' : undefined,
        }
    };

    //result['gml:LineString']['gml:coordinates'] = Gml3Helper.getCoordinatesNode(pointArray)
    result.LineString.posList = Gml3Helper.getCoordinatesNode(pointArray, writeGmlPrefix)

    if (srid) {
        result.LineString._srsName = 'http://www.opengis.net/gml/srs/epsg.xml#' + srid;
    }

    return result;
}

Gml3Helper.CreateMultiLineString = function (multiLineStringPointArray, writeGmlPrefix, srid) {

    var result = {
        'MultiLineString': {
            '__prefix': writeGmlPrefix ? 'gml' : undefined,
            'lineStringMember': []
        }
    };

    for (var i = 0; i < multiLineStringPointArray.length; i++) {
        result.MultiLineString.lineStringMember.push(
            Gml3Helper.CreateLineString(multiLineStringPointArray[i], writeGmlPrefix, undefined)
        );

        result.MultiLineString.lineStringMember[i].__prefix = writeGmlPrefix ? 'gml' : undefined;
    }

    //result['gml:LineString']['gml:coordinates'] = Gml3Helper.getCoordinatesNode(pointArray)

    if (srid) {
        result.MultiLineString._srsName = 'http://www.opengis.net/gml/srs/epsg.xml#' + srid;
    }

    return result;
}

Gml3Helper.CreatePolygon = function (ringArray, writeGmlPrefix, srid) {

    var result = {
        'Polygon': {
            '__prefix': writeGmlPrefix ? 'gml' : undefined,
            'exterior': {
                '__prefix': writeGmlPrefix ? 'gml' : undefined,
                'LinearRing': {
                    '__prefix': writeGmlPrefix ? 'gml' : undefined,
                    'posList': Gml3Helper.getCoordinatesNode(ringArray[0], writeGmlPrefix)
                }
            },
            //'innerBoundaryIs': []
        }
    };

    if (ringArray.length > 1) {
        result.Polygon.interior = [];

        for (var i = 1; i < ringArray.length; i++) {
            result.Polygon.interior.push(
                {
                    'LinearRing': {
                        '__prefix': writeGmlPrefix ? 'gml' : undefined,
                        'posList': Gml3Helper.getCoordinatesNode(ringArray[i], writeGmlPrefix)
                    }
                }
            );

            result.Polygon.interior[i - 1].__prefix = writeGmlPrefix ? 'gml' : undefined;
        }
    }



    if (srid) {
        result.Polygon._srsName = 'http://www.opengis.net/gml/srs/epsg.xml#' + srid;
    }

    return result;
}

Gml3Helper.CreateMultiPolygon = function (multiPolygonRingArray, writeGmlPrefix, srid) {

    var result = {
        'MultiSurface': {
            '__prefix': writeGmlPrefix ? 'gml' : undefined,
            'surfaceMember': []
        }
    };

    for (var i = 0; i < multiPolygonRingArray.length; i++) {

        var polygon = Gml3Helper.CreatePolygon(multiPolygonRingArray[i], writeGmlPrefix, undefined);

        result.MultiSurface.surfaceMember.push(polygon);
    }

    if (srid) {
        result.MultiSurface._srsName = 'http://www.opengis.net/gml/srs/epsg.xml#' + srid;
    }

    return result;
}


Gml3Helper.getCoordinatesNode = function (pointArray, writeGmlPrefix) {

    var coordinateString = "";

    for (var i = 0; i < pointArray.length; i++) {
        coordinateString = coordinateString + pointArray[i][0] + ' ' + pointArray[i][1] + ' ';
    }

    var result =
        {
            '__prefix': writeGmlPrefix ? 'gml' : undefined,
            '__text': Gml3Helper.getCoordinatesString(pointArray)
        };

    return result;
}

Gml3Helper.getCoordinatesString = function (pointArray) {
    var result = "";

    for (var i = 0; i < pointArray.length; i++) {
        result = result + pointArray[i][0] + ' ' + pointArray[i][1] + ' ';
    }

    return result;
}

Gml3Helper.ParseEsriJsonGeometry = function (esriJsonGeometry, writeGmlPrefix) {

    if (esriJsonGeometry.x) {
        return Gml3Helper.CreatePoint(esriJsonGeometry.x, esriJsonGeometry.y, writeGmlPrefix, esriJsonGeometry.spatialReference.wkid);
    }
    else if (esriJsonGeometry.points) {
        return Gml3Helper.CreateMultiPoint(esriJsonGeometry.points, writeGmlPrefix, esriJsonGeometry.spatialReference.wkid);
    }
    else if (esriJsonGeometry.paths) {
        return Gml3Helper.CreateMultiLineString(esriJsonGeometry.paths, writeGmlPrefix, esriJsonGeometry.spatialReference.wkid);
    }
    else if (esriJsonGeometry.rings) {
        return Gml3Helper.CreatePolygon(esriJsonGeometry.rings, writeGmlPrefix, esriJsonGeometry.spatialReference.wkid);
    }
}


// ----- ESRI JSON GEOMETRY ----
//Gml3Helper.ParseEsriJsonPoint = function (esriJsonPoint, writeGmlPrefix) {
//    return Gml3Helper.CreatePoint(esriJsonPoint.x, esriJsonPoint.y, writeGmlPrefix, esriJsonPoint.spatialReference.wkid);
//}
//Gml3Helper.ParseEsriJsonMultiPoint = function (esriJsonMultiPoint, writeGmlPrefix) {
//    return Gml3Helper.CreateMultiPoint(esriJsonMultiPoint.points, writeGmlPrefix, esriJsonMultiPoint.spatialReference.wkid);
//}
//Gml3Helper.ParseEsriPolyline = function (esriJsonLineString, writeGmlPrefix) {
//    return Gml3Helper.CreateMultiLineString(esriJsonLineString.paths, writeGmlPrefix, esriJsonLineString.spatialReference.wkid);
//}
//Gml3Helper.ParseEsriPolygon = function (esriJsonPolygon, writeGmlPrefix) {
//    return Gml3Helper.CreatePolygon(esriJsonPolygon.rings, writeGmlPrefix, esriJsonPolygon.spatialReference.wkid);
//}



//Gml3 <- GeoJson
Gml3Helper.ParseGeoJson = function (geoJson, writeGmlPrefix, srid) {
    if (geoJson.type == "Point") {
        return Gml3Helper.CreatePoint(geoJson.coordinates[0], geoJson.coordinates[1], writeGmlPrefix, srid);
    }
    if (geoJson.type == "MultiPoint") {
        return Gml3Helper.CreateMultiPoint(geoJson.coordinates, writeGmlPrefix, srid);
    }
    if (geoJson.type == "LineString") {
        return Gml3Helper.CreateLineString(geoJson.coordinates, writeGmlPrefix, srid);
    }
    if (geoJson.type == "MultiLineString") {
        return Gml3Helper.CreateMultiLineString(geoJson.coordinates, writeGmlPrefix, srid);
    }
    if (geoJson.type == "Polygon") {
        return Gml3Helper.CreatePolygon(geoJson.coordinates, writeGmlPrefix, srid);
    }
    if (geoJson.type == "MultiPolygon") {
        return Gml3Helper.CreateMultiPolygon(geoJson.coordinates, writeGmlPrefix, srid);
    }
}



Gml3Helper.GmlObjectToGeoJson = function (gmlObject, geometryColumnName) {

    var result = {
        type: "FeatureCollection",
        totalFeatures: gmlObject.FeatureCollection.featureMember.length,
        features: []
    };

    if (gmlObject.FeatureCollection.featureMember.length) {

        for (var i = 0; i < gmlObject.FeatureCollection.featureMember.length; i++) {

            var jsonFeature = Gml3Helper.SingleGmlFeatureMemberToGeoJson(gmlObject.FeatureCollection.featureMember[i], geometryColumnName);
            //var layerName = Object.keys(gmlObject.FeatureCollection.featureMember[i])[0];

            //var currentFeature = gmlObject.FeatureCollection.featureMember[i][layerName];

            //var jsonFeature = {
            //    geometry_name: geometryColumnName,
            //    type: "Feature",
            //    geometry: Gml3Helper.ToGeoJson(currentFeature[geometryColumnName]),
            //    properties: {}
            //};

            //for (var property in currentFeature) {
            //    if (currentFeature.hasOwnProperty(property) && !property.startsWith("_")) {
            //        var value = currentFeature[property].__text;

            //        jsonFeature.properties[property] = value ? value : "";
            //    }
            //}
            result.features.push(jsonFeature);
        }
    }
    //just one object
    else {

        var jsonFeature = Gml3Helper.SingleGmlFeatureMemberToGeoJson(gmlObject.FeatureCollection.featureMember, geometryColumnName);

        result.features.push(jsonFeature);
    }

    return result;
}

Gml3Helper.SingleGmlFeatureMemberToGeoJson = function (singleFeatureMember, geometryColumnName) {
    var layerName = Object.keys(singleFeatureMember)[0];

    var currentFeature = singleFeatureMember[layerName];

    var jsonFeature = {
        geometry_name: geometryColumnName,
        type: "Feature",
        geometry: Gml3Helper.ToGeoJson(currentFeature[geometryColumnName]),
        properties: {}
    };

    for (var property in currentFeature) {
        if (currentFeature.hasOwnProperty(property) && !property.startsWith("_")) {
            var value = currentFeature[property].__text;

            jsonFeature.properties[property] = value ? value : "";
        }
    }

    return jsonFeature;
}



//Gml3 -> GeoJson, potentially error prone, supporting MultiCurve as MultiLineString
Gml3Helper.ToGeoJson = function (gmlAsJson) {
    if (gmlAsJson.Point) {
        return {
            type: "Point",
            coordinates: parseGmlPointToGeoJsonCoordinates(gmlAsJson.Point)
        };
    }
    else if (gmlAsJson.MultiPoint) {
        var result = {
            type: "MultiPoint",
            coordinates: []
        };

        for (var i = 0; i < gmlAsJson.MultiPoint.pointMember.length; i++) {
            result.coordinates.push(parseGmlPointToGeoJsonCoordinates(gmlAsJson.MultiPoint.pointMember[i].Point));
        }
        return result;
    }
    else if (gmlAsJson.LineString) {
        var result = {
            type: "LineString",
            coordinates: []
        };

        result.coordinates = parseGmlLineStringToGeoJsonCoordinates(gmlAsJson.LineString);
        return result;
    }
    else if (gmlAsJson.MultiLineString) {
        var result = {
            type: "MultiLineString",
            coordinates: []
        };

        if (gmlAsJson.MultiLineString.lineStringMember.length) {
            for (var i = 0; i < gmlAsJson.MultiLineString.lineStringMember.length; i++) {
                result.coordinates.push(parseGmlLineStringToGeoJsonCoordinates(gmlAsJson.MultiLineString.lineStringMember[i].LineString));
            }
        }
        //in the case just one lineStringMember exist, it may not be returned as an array
        else {
            result.coordinates.push(parseGmlLineStringToGeoJsonCoordinates(gmlAsJson.MultiLineString.lineStringMember.LineString));
        }

        return result;
    }
    else if (gmlAsJson.Polygon) {
        var result = {
            type: "Polygon",
            coordinates: parseGmlPolygonToGeoJsonCoordinates(gmlAsJson.Polygon)
        };

        return result;
    }
    else if (gmlAsJson.MultiSurface) {
        var result = {
            type: "MultiPolygon",
            coordinates: []
        };

        if (gmlAsJson.MultiSurface.surfaceMember.length) {
            for (var s = 0; s < gmlAsJson.MultiSurface.surfaceMember.length; s++) {
                result.coordinates.push(parseGmlPolygonToGeoJsonCoordinates(gmlAsJson.MultiSurface.surfaceMember[s].Polygon));
            }
        }
        //in the case just one surfaceMember exist, it may not be returned as an array
        else if (gmlAsJson.MultiSurface.surfaceMember) {
            result.coordinates.push(parseGmlPolygonToGeoJsonCoordinates(gmlAsJson.MultiSurface.surfaceMember.Polygon));
        }


        return result;
    }
    else if (gmlAsJson.MultiCurve) {
        var result = {
            type: "MultiLineString",
            coordinates: []
        };

        if (gmlAsJson.MultiCurve.curveMember.length) {
            for (var i = 0; i < gmlAsJson.MultiCurve.curveMember.length; i++) {
                result.coordinates.push(parseGmlLineStringToGeoJsonCoordinates(gmlAsJson.MultiCurve.curveMember[i].LineString));
            }
        }
        //in the case just one lineStringMember exist, it may not be returned as an array
        else {
            result.coordinates.push(parseGmlLineStringToGeoJsonCoordinates(gmlAsJson.MultiCurve.curveMember.LineString));
        }

        return result;
    }
}

function parseGmlPointToGeoJsonCoordinates(gmlPoint) {
    var coordinates = gmlPoint.pos.__text.split(" ");

    return [parseFloat(coordinates[0]), parseFloat(coordinates[1])];
}

function parseGmlLineStringToGeoJsonCoordinates(gmlLineString) {
    var result = [];

    var xys = gmlLineString.posList.__text.split(" ");

    for (var i = 0; i < xys.length - 1; i += 2) {
        result.push([parseFloat(xys[i]), parseFloat(xys[i + 1])]);
    }

    return result;
}

function parseGmlPolygonToGeoJsonCoordinates(gmlPolygon) {
    var result = [];

    result.push(parseGmlLineStringToGeoJsonCoordinates(gmlPolygon.exterior.LinearRing));

    if (gmlPolygon.interior) {
        if (gmlPolygon.interior.length) {
            for (var i = 0; i < gmlPolygon.interior.length; i++) {
                result.push(parseGmlLineStringToGeoJsonCoordinates(gmlPolygon.interior[i].LinearRing));
            }
        }
        //in the case just one interior exist, it may not be returned as an array
        else {
            result.push(parseGmlLineStringToGeoJsonCoordinates(gmlPolygon.interior));
        }

    }

    return result;
}

(function gml3Test() {

    ///
    var point = {
        "type": "Point",
        "coordinates": [30, 10]
    };
    var gmlPoint = Gml3Helper.ParseGeoJson(point, true);
    var geojsonPoint = Gml3Helper.ToGeoJson(gmlPoint);
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
    var gmlMultiPoint = Gml3Helper.ParseGeoJson(multiPoint, true);
    var geojsonMultiPoint = Gml3Helper.ToGeoJson(gmlMultiPoint);
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
    var gmllineString = Gml3Helper.ParseGeoJson(lineString, true);
    var geojsonLineString = Gml3Helper.ToGeoJson(gmllineString);
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
    var gmlMultiLinestring = Gml3Helper.ParseGeoJson(multiLinestring, true);
    var geojsonMultiLinestring = Gml3Helper.ToGeoJson(gmlMultiLinestring);
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
    var gmlPolygon = Gml3Helper.ParseGeoJson(polygon, true);
    var geojsonPolygon = Gml3Helper.ToGeoJson(gmlPolygon);
    if (JSON.stringify(polygon) != JSON.stringify(geojsonPolygon)) {
        throw "exception at GML to GeoJSON - polygon"
    }

    var polygon2 = {
        "type": "Polygon",
        "coordinates": [
            [[30, 10], [40, 40], [20, 40], [10, 20], [30, 10]]
        ]
    };
    var gmlPolygon2 = Gml3Helper.ParseGeoJson(polygon2, true);
    var geojsonPolygon2 = Gml3Helper.ToGeoJson(gmlPolygon2);
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
    var gmlMultiPolygon = Gml3Helper.ParseGeoJson(multiPolygon, true);
    var geojsonMultiPolygon = Gml3Helper.ToGeoJson(gmlMultiPolygon);
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
    var gmlMultiPolygon2 = Gml3Helper.ParseGeoJson(multiPolygon2, true);
    var geojsonMultiPolygon2 = Gml3Helper.ToGeoJson(gmlMultiPolygon2);
    if (JSON.stringify(multiPolygon2) != JSON.stringify(geojsonMultiPolygon2)) {
        throw "exception at GML to GeoJSON - multiPolygon2"
    }
})();