function WfsHelper() {

};

WfsHelper.GetFeatureIntersect = function (url, layerName, esriJsonGeometry, successFunc) {

    var jsonText =
        {
            'wfs:GetFeature': {
                '_service': "WFS",
                '_version': "1.1.0",
                '_outputFormat': "application/json",
                //'_xmlns:SqlWs': "http://hosseinnarimanirad.ir", 
                '_dataType': "xml",
                '_xmlns:wfs': "http://www.opengis.net/wfs",
                '_xmlns': "http://www.opengis.net/ogc",
                '_xmlns:gml': "http://www.opengis.net/gml",
                '_xmlns:xsi': "http://www.w3.org/2001/XMLSchema-instance",
                '_xsi:schemaLocation': "http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd",
                'wfs:Query': {
                    '_typeName': layerName,
                    Filter: {
                        Intersects: {
                            PropertyName: 'Geo',
                        }
                    }
                }
            }
        };


    var gml = Gml3Helper.ParseEsriJsonGeometry(esriJsonGeometry, true);

    var key = Object.keys(gml)[0];

    jsonText["wfs:GetFeature"]["wfs:Query"].Filter.Intersects[key] = gml[key]; //do not use ["gml:Point"]

    var x2js = new X2JS();

    var xmlDocText = x2js.json2xml_str(jsonText);

    //OPTION 1: Use Passway Controller
    var postData = JSON.stringify({ 'url': url, 'xmlContent': xmlDocText });

    $.ajax({
        type: "POST",
        url: configPresenter.RootUrl + '/api/Passway/CallHttpPostForXml',
        data: postData,
        contentType: 'application/json',
        success: successFunc,
        error: function (jqXHR, textStatus, error) {
            _setBusy(false);
        }
    });

    ////OPTION 2: Use direct http post to map server
    //$.ajax({
    //    type: "POST",
    //    url: url,
    //    data: xmlDocText,
    //    contentType: 'text/xml',
    //    success: successFunc
    //});




    //var point = { x: -60, y: 38 };

    //var gmlPoint = Gml2Helper.CreatePoint(point.x, point.y, false, 4326);
    //var gmlMultiPoint = Gml2Helper.CreateMultiPoint([{ X: -106, Y: 43 }, { X: -82, Y: 39 }, { X: -100, Y: 34 }, { X: -79, Y: 47 }], false, 4326);

    //var gmlLinestring = Gml2Helper.CreateLineString([{ X: point.x, Y: point.y }, { X: point.x + 10, Y: point.y + 10 }], false, 4326);
    //var gmlMultiLineString = Gml2Helper.CreateMultiLineString(
    //    [[{ X: point.x, Y: point.y }, { X: point.x + 10, Y: point.y + 10 }],
    //    [{ X: point.x - 5, Y: point.y - 5 }, { X: point.x - 5, Y: point.y + 6 }]], false, 4326);

    //var gmlPolygon = Gml2Helper.CreatePolygon(
    //    [[{ X: point.x, Y: point.y }, { X: point.x + 10, Y: point.y + 10 }, { X: point.x, Y: point.y + 10 }, { X: point.x, Y: point.y }],
    //    [{ X: point.x - 5, Y: point.y - 5 }, { X: point.x - 5, Y: point.y + 6 }, { X: point.x - 5, Y: point.y }, { X: point.x - 5, Y: point.y - 5 }]], false, 4326);

    //var gmlMultiPolygon = Gml2Helper.CreateMultiPolygon(
    //    [
    //        [[{ X: point.x, Y: point.y }, { X: point.x + 10, Y: point.y + 10 }, { X: point.x, Y: point.y + 10 }, { X: point.x, Y: point.y }],
    //        [{ X: point.x - 5, Y: point.y - 5 }, { X: point.x - 5, Y: point.y + 6 }, { X: point.x - 5, Y: point.y }, { X: point.x - 5, Y: point.y - 5 }]],
    //        [[{ X: point.x, Y: point.y }, { X: point.x + 10, Y: point.y + 10 }, { X: point.x, Y: point.y + 10 }, { X: point.x, Y: point.y }],
    //        [{ X: point.x - 5, Y: point.y - 5 }, { X: point.x - 5, Y: point.y + 6 }, { X: point.x - 5, Y: point.y }, { X: point.x - 5, Y: point.y - 5 }]]
    //    ], false, 4326);

    //console.log(gmlPoint); console.log(x2js.json2xml_str(gmlPoint));
    //console.log(gmlMultiPoint); console.log(x2js.json2xml_str(gmlMultiPoint));
    //console.log(gmlLinestring); console.log(x2js.json2xml_str(gmlLinestring));
    //console.log(gmlMultiLineString); console.log(x2js.json2xml_str(gmlMultiLineString));
    //console.log(gmlPolygon); console.log(x2js.json2xml_str(gmlPolygon));
    //console.log(gmlMultiPolygon); console.log(x2js.json2xml_str(gmlMultiPolygon));

}

WfsHelper.GetFeatureIntersectForArcGISServer = function (url, layerName, esriJsonGeometry, successFunc) {

    layerName = 'esri:' + layerName.replace(' ', '_');

    var jsonText =
        {
            'wfs:GetFeature': {
                '_service': "WFS",
                '_version': "1.1.0",
                //'_outputFormat': "application/json", //esri do not support json as output of WFS
                //'_xmlns:SqlWs': "http://hosseinnarimanirad.ir", 
                //'_dataType': "xml",
                '_xmlns:wfs': "http://www.opengis.net/wfs",
                '_xmlns': "http://www.opengis.net/ogc",
                '_xmlns:gml': "http://www.opengis.net/gml",
                '_xmlns:xsi': "http://www.w3.org/2001/XMLSchema-instance",
                '_xsi:schemaLocation': "http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd",
                'wfs:Query': {
                    '_typeName': layerName,
                    Filter: {
                        Intersects: {
                            PropertyName: 'esri:Shape',
                        }
                    }
                }
            }
        };


    var gml = Gml3Helper.ParseEsriJsonGeometry(esriJsonGeometry, true);

    var key = Object.keys(gml)[0];

    jsonText["wfs:GetFeature"]["wfs:Query"].Filter.Intersects[key] = gml[key]; //do not use ["gml:Point"]

    var x2js = new X2JS();

    var xmlDocText = x2js.json2xml_str(jsonText);

    //OPTION 1: Use Passway Controller
    var postData = JSON.stringify({ 'url': url, 'xmlContent': xmlDocText });
    $.ajax({
        type: "POST",
        url: configPresenter.RootUrl + '/api/Passway/CallHttpPostForXml',
        data: postData,
        contentType: 'application/json',
        dataType: 'xml',
        success: successFunc,
        error: function (jqXHR, textStatus, error) {
            _setBusy(false);
        }
    });
}

WfsHelper.GetFeatureIntersectWithMultipleGeometries = function (url, layerName, geoJsonArray, srid, successFunc) {

    var jsonText =
        {
            'wfs:GetFeature': {
                '_service': "WFS",
                '_version': "1.1.0",
                '_outputFormat': "application/json",
                '_xmlns:wfs': "http://www.opengis.net/wfs",
                '_xmlns': "http://www.opengis.net/ogc",
                '_xmlns:gml': "http://www.opengis.net/gml",
                '_xmlns:xsi': "http://www.w3.org/2001/XMLSchema-instance",
                '_xsi:schemaLocation': "http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd",
                'wfs:Query': {
                    '_typeName': layerName,
                    Filter: {
                        Or: {
                            Intersects: []
                        }
                        //Intersects: {
                        //    PropertyName: 'Geo',
                        //}

                    }
                }
            }
        };

    var intersectsArray = [];

    for (var i = 0; i < geoJsonArray.length; i++) {
        var gml = Gml3Helper.ParseGeoJson(geoJsonArray[i], true, srid);

        var key = Object.keys(gml)[0];

        //intersectsArray.push(
        //    {
        //        Intersects: {
        //            PropertyName: 'Geo',
        //        }
        //    });

        //intersectsArray[i].Intersects[key] = gml[key];

        //jsonText["wfs:GetFeature"]["wfs:Query"].Filter.Or.push(intersectsArray[i]);

        jsonText["wfs:GetFeature"]["wfs:Query"].Filter.Or.Intersects.push({ PropertyName: 'Geo' });
        jsonText["wfs:GetFeature"]["wfs:Query"].Filter.Or.Intersects[i][key] = gml[key];

    }

    //jsonText["wfs:GetFeature"]["wfs:Query"].Filter.Intersects[key] = gml[key]; //do not use ["gml:Point"]

    //jsonText["wfs:GetFeature"]["wfs:Query"].Filter.Or = intersectsArray; //do not use ["gml:Point"]

    var x2js = new X2JS();

    var xmlDocText = x2js.json2xml_str(jsonText);

    var postData = JSON.stringify({ 'url': url, 'xmlContent': xmlDocText });

    $.ajax({
        type: "POST",
        url: configPresenter.RootUrl + '/api/Passway/CallHttpPostForXml',
        data: postData,
        contentType: 'application/json',
        dataType: 'json',
        success: successFunc
    });

    //$.ajax({
    //    type: "POST",
    //    url: url,
    //    data: xmlDocText,
    //    contentType: 'text/xml',
    //    success: successFunc
    //});

}

WfsHelper.GetFeatureIntersectWithMultipleGeometriesForArcGISServer = function (url, layerName, geoJsonArray, srid, successFunc) {

    layerName = 'esri:' + layerName.replace(' ', '_');

    var jsonText =
        {
            'wfs:GetFeature': {
                '_service': "WFS",
                '_version': "1.1.0",
                //'_outputFormat': "application/json", //esri do not support json as output of WFS
                '_xmlns:wfs': "http://www.opengis.net/wfs",
                '_xmlns': "http://www.opengis.net/ogc",
                '_xmlns:gml': "http://www.opengis.net/gml",
                '_xmlns:xsi': "http://www.w3.org/2001/XMLSchema-instance",
                '_xsi:schemaLocation': "http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd",
                'wfs:Query': {
                    '_typeName': layerName,
                    Filter: {
                        Or: {
                            Intersects: []
                        }
                    }
                }
            }
        };

    var intersectsArray = [];

    for (var i = 0; i < geoJsonArray.length; i++) {
        var gml = Gml3Helper.ParseGeoJson(geoJsonArray[i], true, srid);

        var key = Object.keys(gml)[0];

        jsonText["wfs:GetFeature"]["wfs:Query"].Filter.Or.Intersects.push({ PropertyName: 'esri:Shape' });
        jsonText["wfs:GetFeature"]["wfs:Query"].Filter.Or.Intersects[i][key] = gml[key];

    }

    var x2js = new X2JS();

    var xmlDocText = x2js.json2xml_str(jsonText);

    var postData = JSON.stringify({ 'url': url, 'xmlContent': xmlDocText });

    $.ajax({
        type: "POST",
        url: configPresenter.RootUrl + '/api/Passway/CallHttpPostForXml',
        data: postData,
        contentType: 'application/json',
        dataType: 'xml',
        success: successFunc,
        error: function (jqXHR, textStatus, error) {
            _setBusy(false);
        }
    });

}

WfsHelper.GetWfsDescribeFeatureType = function (url, layerName, successFunc) {

    var jsonText = {
        'DescribeFeatureType': {
            '_service': "WFS",
            '_outputFormat': "application/json",
            '_version': "1.1.0",
            '_xmlns:SqlWs': "http://www.opengeospatial.net/sqlws",
            '_xmlns': "http://www.opengis.net/wfs",
            '_xmlns:xsi': "http://www.w3.org/2001/XMLSchema-instance",
            '_xsi:schemaLocation': "http://www.opengis.net/wfs   http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd",
            'TypeName': {
                '__text': layerName
            }
        }
    };

    var x2js = new X2JS();

    var xmlDocText = x2js.json2xml_str(jsonText);

    $.ajax({
        type: "POST",
        url: url,
        data: xmlDocText,
        contentType: 'text/xml',
        success: successFunc
    });
}