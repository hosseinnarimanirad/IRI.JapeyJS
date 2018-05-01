//consider removing BasemapToggle from require

require(
    [
        "esri/map", "esri/layers/WMSLayer", "esri/layers/WFSLayer", "esri/layers/WebTiledLayer",
        "esri/geometry/Extent", "esri/toolbars/draw", "esri/geometry/geometryEngine", "esri/geometry/geodesicUtils",
        "esri/geometry/webMercatorUtils", "esri/layers/GraphicsLayer", "esri/dijit/BasemapToggle",
        "esri/geometry/Polygon", "esri/SpatialReference",
        "esri/graphic",
        "esri/geometry/jsonUtils", "esri/graphicsUtils", "esri/config", "dojo/domReady!"
    ],
    function (Map, WMSLayer, WFSLayer, WebTiledLayer,
        Extent, Draw, GeometryEngine, GeodesicUtils,
        WebMercatorUtils, GraphicsLayer, BasemapToggle,
        Polygon, SpatialReference,
        Graphic,
        JsonUtils, graphicsUtils, esriConfig) {

        esriConfig.defaults.io.corsEnabledServers.push("localhost:51512");
        esriConfig.defaults.io.corsEnabledServers.push("localhost:8000");
        esriConfig.defaults.io.corsEnabledServers.push("v-gisserver2");
        esriConfig.defaults.io.corsEnabledServers.push("v-gisserver2:8080");
        esriConfig.defaults.io.corsEnabledServers.push("v-gisserver2:6080");
        esriConfig.defaults.io.corsEnabledServers.push("v-gisserver2:6443");
        esriConfig.defaults.io.corsEnabledServers.push("localhost");


        var iranMercatorExtent = new Extent({
            "xmin": 4800000,
            "ymin": 2800000,
            "xmax": 7080000,
            "ymax": 4900000,
            "spatialReference": { "wkid": 3857 }
        });

        mapPresenter.mapControl = new Map("map",
            {
                //center: [51, 35],
                zoom: 4,
                extent: iranMercatorExtent,
                logo: false,
                showAttribution: false
            });

        mapPresenter.mapControl.on("mouse-move",
            function (evt) {
                //the map is in web mercator but display coordinates in geographic (lat, long)
                var mp = WebMercatorUtils.webMercatorToGeographic(evt.mapPoint);

                var testMap = IRI.Common.CoordinateSystem.MapProjects.WebMercatorToGeodeticWgs84(evt.mapPoint);

                var resultText = "coordinate not available";

                switch (mapPresenter.selectedCoordinateDisplayMode) {
                    case mapPresenter.coordinateDisplayModes.GeodeticWgs84:
                        resultText = "Geodetic (WGS84)\nLongitude: " + mp.x.toFixed(3) + "   " + "Latitude: " + mp.y.toFixed(3);
                        break;

                    case mapPresenter.coordinateDisplayModes.GeodeticWgs84Dms:
                        var lat = IRI.Common.Units.AngleHelper.DegreeToDms(mp.y);
                        var long = IRI.Common.Units.AngleHelper.DegreeToDms(mp.x);
                        resultText = "Geodetic (WGS84) dms\nLongitude: " + long + "   " + "Latitude: " + lat;
                        break;

                    case mapPresenter.coordinateDisplayModes.GeodeticClarke:
                        var clarke1880 = IRI.Common.CoordinateSystem.Transformation.ChangeDatumSimple(mp, IRI.Common.CoordinateSystem.Ellipsoids.WGS84, IRI.Common.CoordinateSystem.Ellipsoids.Clarke1880Rgs);
                        resultText = "Geodetic (WGS84)\nLongitude: " + clarke1880.x.toFixed(3) + "   " + "Latitude: " + clarke1880.y.toFixed(3);
                        break;

                    case mapPresenter.coordinateDisplayModes.GeodeticClarkeDms:
                        var clarke1880 = IRI.Common.CoordinateSystem.Transformation.ChangeDatumSimple(mp, IRI.Common.CoordinateSystem.Ellipsoids.WGS84, IRI.Common.CoordinateSystem.Ellipsoids.Clarke1880Rgs);
                        var lat = IRI.Common.Units.AngleHelper.DegreeToDms(clarke1880.y);
                        var long = IRI.Common.Units.AngleHelper.DegreeToDms(clarke1880.x);
                        resultText = "Geodetic (WGS84) dms\nLongitude: " + long + "   " + "Latitude: " + lat;
                        break;

                    case mapPresenter.coordinateDisplayModes.UTM:
                        var zone = IRI.Common.CoordinateSystem.MapProjects.FindZone(mp.x);
                        var utm = IRI.Common.CoordinateSystem.MapProjects.GeodeticToUTM(mp);
                        resultText = "UTM (Zone: " + zone + ")\nX: " + utm.x.toFixed(2) + "   " + "Y: " + utm.y.toFixed(2);
                        break;

                    case mapPresenter.coordinateDisplayModes.LccNiocWgs84:
                        console.log("LccNiocWgs84");
                        break;

                    case mapPresenter.coordinateDisplayModes.LccNiocClarke:
                        console.log("LccNiocClarke");
                        break;

                    default:
                }

                $("#coordinatePanel").text(resultText);
            });

        //var toggle = new BasemapToggle({
        //    map: mapPresenter.mapControl,
        //    basemap: "satellite"
        //},
        //    "BasemapToggle");
        //toggle.startup();

        var wmsLayer = new WMSLayer(configPresenter.WmsUrl,
            {
                format: "png",
                visibleLayers: mapPresenter.visibleLayers,
                version: "1.3.0",
                //customLayerParameters: {
                //    cql_Filter: "Title='Ilam'"
                //}
            });

        wmsLayer.spatialReference = { wkid: 3857 };


        //    "http://localhost/BaseMap/Google/Terrain/${level}/${col}_${row}_${level}.jpg",

        googleTerrain = new WebTiledLayer(
            //configPresenter.BaseMapServer + "/BaseMap/Google/Terrain/${level}/${row}_${col}.png",
            configPresenter.GoogleTerrainUrl,
            {
                "copyright": "NIOC",
                "id": "Google Terrain Map",
            });

        googleRoadMap = new WebTiledLayer(
            //configPresenter.BaseMapServer + "/BaseMap/Google/RoadMap/${level}/${row}_${col}.png",
            configPresenter.GoogleRoadMapUrl,
            {
                "copyright": "NIOC",
                "id": "Google RoadMap Map",
            });

        googleSatellite = new WebTiledLayer(
            //configPresenter.BaseMapServer + "/BaseMap/Google/Satellite/${level}/${row}_${col}.png",
            configPresenter.GoogleSatelliteUrl,
            {
                "copyright": "NIOC",
                "id": "Google Satellite Map",
            });

        mapPresenter.mapControl.addLayer(googleTerrain);

        mapPresenter.mapControl.addLayer(wmsLayer);

        if (configPresenter.GeoMapServices) {
            for (var i = 0; i < configPresenter.GeoMapServices.length; i++) {
                //GeoMap commented 97.02.11
                //mapPresenter.mapControl.addLayer(
                //    new WMSLayer(configPresenter.GeoMapServices[i].wmsUrl, {
                //        format: "png",
                //        visibleLayers: configPresenter.GeoMapServices[i].visibleLayers,
                //        version: "1.3.0"
                //    }));
            }
        }


        //96.05.27 TEST WFS
        //var wfsLayer = new WFSLayer();

        //var opts = {
        //    "url": "http://localhost:8000/geoserver/SqlWs/ows",
        //    "version": "1.1.0",
        //    "name": "GIS.StructureView",
        //    "wkid": 4326,
        //    "maxFeatures": 100
        //};
        //wfsLayer.fromJson(opts);
        //mapPresenter.mapControl.addLayer(wfsLayer);
        //*****TEST WFS


        mapPresenter.goto = function (webMercatorPoint) {
            mapPresenter.mapControl.centerAndZoom(webMercatorPoint, 10);
            //mapPresenter.mapControl.centerAt(webMercatorPoint);
        };

        mapPresenter.refresh = function () {
            mapPresenter.mapControl.setExtent(mapPresenter.mapControl.extent);
        };

        mapPresenter.fullExtent = function () {
            mapPresenter.mapControl.setExtent(iranMercatorExtent);
        }

        var selectedLayer = new GraphicsLayer();
        var highlightLayer = new GraphicsLayer();
        var drawingLayer = new GraphicsLayer();

        mapPresenter.mapControl.addLayer(selectedLayer);
        mapPresenter.mapControl.addLayer(highlightLayer);
        mapPresenter.mapControl.addLayer(drawingLayer);


        mapPresenter.addDrawingGraphic = function (graphics) {
            drawingLayer.add(graphics);
        }

        mapPresenter.removeDrawingGraphic = function (graphics) {
            drawingLayer.remove(graphics);
        }

        mapPresenter.updateDrawingSymbol = function (item, newSymbol) {
            for (var i = 0; i < drawingLayer.graphics.length; i++) {
                if (drawingLayer.graphics[i] == item) {
                    drawingLayer.graphics[i].setSymbol(newSymbol);
                    //drawingLayer.redraw();
                    return;
                }
            }
        }

        //options:
        //{fillColor, strokeColor, lineStyle, fillStyle}
        mapPresenter.createSymbolForEsriJson = function (esriJsonGeometry, options) {
            var symbol;

            var stroke = options.strokeColor ? options.strokeColor : new dojo.Color([255, 0, 0]);

            var fill = options.fillColor ? options.fillColor : new dojo.Color([255, 255, 0, 0.25]);

            var lineStyle = options.lineStyle ? options.lineStyle : esri.symbol.SimpleLineSymbol.STYLE_SOLID;

            var fillStyle = options.fillStyle ? options.fillStyle : esri.symbol.SimpleFillSymbol.STYLE_SOLID;

            switch (esriJsonGeometry.type.toLowerCase()) {
                case "point":
                case "multipoint":
                    symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE,
                        10,
                        new esri.symbol.SimpleLineSymbol(lineStyle, stroke, 1),
                        fill);
                    break;
                case "polyline":
                    symbol = new esri.symbol.SimpleLineSymbol(lineStyle, stroke, 2);
                    break;
                case "polygon":
                case "extent":
                    symbol = new esri.symbol.SimpleFillSymbol(fillStyle,
                        new esri.symbol.SimpleLineSymbol(lineStyle, stroke, 2),
                        fill);
                    break;
                //symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                //            new esri.symbol.SimpleLineSymbol(style, stroke, 2),
                //            fill);
                //break;
                //case "multipoint":
                //    symbol = new esri.symbol.SimpleMarkerSymbol(
                //        esri.symbol.SimpleMarkerSymbol.STYLE_DIAMOND,
                //        20,
                //        new esri.symbol.SimpleLineSymbol(style, stroke, 1),
                //        fill);
                //    break;
            }

            return symbol;
        }

        mapPresenter.createSelectedSymbolForEsriJson = function (esriJsonGeometry) {
            return mapPresenter.createSymbolForEsriJson(esriJsonGeometry,
                {
                    fillColor: new dojo.Color([0, 255, 255, 0.25]),
                    strokeColor: new dojo.Color([0, 255, 255])
                });
        }

        mapPresenter.createHighlightSymbolForEsriJson = function (esriJsonGeometry) {
            return mapPresenter.createSymbolForEsriJson(esriJsonGeometry,
                {
                    fillColor: new dojo.Color([255, 255, 0, 0.50]),
                    strokeColor: new dojo.Color([255, 255, 0])
                });
        }

        mapPresenter.createDrawingSymbolForEsriJson = function (esriJsonGeometry) {
            return mapPresenter.createSymbolForEsriJson(esriJsonGeometry,
                {
                    fillColor: new dojo.Color([245, 162, 8, 0.25]),
                    strokeColor: esri.Color.fromHex("#F5A208")
                });
        }

        mapPresenter.createHighlightedDrawingSymbolForEsriJson = function (esriJsonGeometry) {
            return mapPresenter.createSymbolForEsriJson(esriJsonGeometry,
                {
                    fillColor: new dojo.Color([155, 155, 0, 0.25]),
                    strokeColor: esri.Color.fromHex("#FFEE62")
                });
        }

        mapPresenter.createDrawLineSymbol = function () {
            return new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_LONGDASH,
                esri.Color.fromHex("#F5A208"),
                3);
        }

        mapPresenter.createDrawPolygonSymbol = function () {
            return new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_LONGDASH, esri.Color.fromHex("#F5A208"), 3),
                new dojo.Color([245, 162, 8, 0.25]))

        }

        //options:
        //{fillColor, strokeColor}
        mapPresenter.esriJsonToGraphics = function (esriJsonGeometry, options) {

            var symbol = mapPresenter.createSymbolForEsriJson(esriJsonGeometry, options);

            var result = new esri.Graphic(esriJsonGeometry, symbol);

            return result;
        }

        mapPresenter.esriJsonToSelectedGraphic = function (esriJsonGeometry) {
            var symbol = mapPresenter.createSelectedSymbolForEsriJson(esriJsonGeometry);

            return new esri.Graphic(esriJsonGeometry, symbol);
        }

        mapPresenter.esriJsonToHighlightedGraphic = function (esriJsonGeometry) {
            var symbol = mapPresenter.createHighlightSymbolForEsriJson(esriJsonGeometry);

            return new esri.Graphic(esriJsonGeometry, symbol);
        }

        mapPresenter.esriJsonToDrawingGraphic = function (esriJsonGeometry) {
            var symbol = mapPresenter.createDrawingSymbolForEsriJson(esriJsonGeometry);

            return new esri.Graphic(esriJsonGeometry, symbol);
        }

        mapPresenter.updateSelectedResultLayerMap = function (result, srid) {
            highlightLayer.clear();
            selectedLayer.clear();

            if (result) {

                for (var i = 0; i < result.length; i++) {

                    var firstGeometry =
                        esri.geometry.fromJson(EsriJsonGeometryHelper.ParseGeoJson(result[i].geometry, srid));

                    if (!firstGeometry) {
                        continue;
                    }

                    selectedLayer.add(mapPresenter.esriJsonToSelectedGraphic(firstGeometry));
                }
            }
        };


        mapPresenter.selectByDrawing = function (dataItem) {

            //prevent multiple calls
            if (mapPresenter.draw) {
                return;
            }

            mapPresenter.draw = new Draw(mapPresenter.mapControl);

            mapPresenter.draw.setLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASH);

            mapPresenter.draw.on("draw-complete",
                function finish(evt) {
                    mapPresenter.draw.deactivate();

                    mapPresenter.mapControl.showZoomSlider();

                    //selectedLayer.clear();

                    mapPresenter.draw = null;

                    //var geographic = WebMercatorUtils.webMercatorToGeographic(evt.geometry);

                    if (applicationPresenter.isArcGISServerMode) {
                        WfsHelper.GetFeatureIntersectForArcGISServer(configPresenter.WfsUrl,
                            dataItem.Name,
                            //geographic.toJson(),
                            evt.geometry.toJson(),
                            function (resultString) {

                                var x2js = new X2JS();

                                var gmlResult = x2js.xml2json(resultString);

                                var result = Gml3Helper.GmlObjectToGeoJson(gmlResult, "Shape");

                                if (!result.features.length || result.features.length < 1) {
                                    return;
                                }

                                //var srid = ArrayHelper.Last(result.crs.properties.name.split(':'));
                                var srid = ArrayHelper.Last(gmlResult.FeatureCollection.boundedBy.Envelope._srsName.split(':'));

                                mapPresenter.updateSelectedResultLayerMap(result.features, srid);

                                if (result && result.features) {
                                    resultPanelPresenter.updateResultLayers([
                                        {
                                            id: dataItem.uid,
                                            layerId: dataItem.Name,
                                            layerName: dataItem.Title,
                                            count: result.features.length,
                                            features: result.features,
                                            //fields: result.features,
                                            isLoaded: true,
                                            srid: srid
                                        }]);
                                }

                            });
                    }
                    else {
                        WfsHelper.GetFeatureIntersect(configPresenter.WfsUrl,
                            dataItem.Name,
                            //geographic.toJson(),
                            evt.geometry.toJson(),
                            function (resultString) {

                                var result = JSON.parse(resultString);

                                if (!result.features.length || result.features.length < 1) {
                                    return;
                                }

                                var srid = ArrayHelper.Last(result.crs.properties.name.split(':'));

                                mapPresenter.updateSelectedResultLayerMap(result.features, srid);

                                if (result && result.features) {
                                    resultPanelPresenter.updateResultLayers([
                                        {
                                            id: dataItem.uid,
                                            layerId: dataItem.Name,
                                            layerName: dataItem.Title,
                                            count: result.features.length,
                                            features: result.features,
                                            //fields: result.features,
                                            isLoaded: true,
                                            srid: srid
                                        }]);
                                }

                            });
                    }

                });

            mapPresenter.draw.activate(esri.toolbars.Draw.RECTANGLE);

            mapPresenter.mapControl.hideZoomSlider();
        };

        mapPresenter.selectByAttribute = function (dataItem) {

            alert(dataItem.Name);

            WfsHelper.GetWfsDescribeFeatureType(configPresenter.WfsUrl,
                dataItem.Name,
                function (data) {
                    var temp = data;

                    alert(JSON.stringify(temp));
                });
        };

        mapPresenter.updateHighlightedFeatures = function (features) {
            highlightLayer.clear();

            //var config = {
            //    spatialReference: {
            //        wkid: 3857 // WGS84 unprojected
            //    }
            //};

            for (var i = 0; i < features.length; i++) {

                var firstGeometry =
                    esri.geometry.fromJson(EsriJsonGeometryHelper.ParseGeoJson(features[i], 3857));
                //var wkt = new Wkt.Wkt();
                //wkt.read(firstGeometry);

                //var obj = wkt.toObject(config);

                if (!firstGeometry) {
                    continue;
                }

                //var symbol;

                //switch (firstGeometry.type) {
                //    case "point":
                //        symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE,
                //            10,
                //            new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                //                new dojo.Color([0, 255, 255]),
                //                1),
                //            new dojo.Color([0, 255, 0, 0.25]));
                //        break;
                //    case "polyline":
                //        symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                //            new dojo.Color([0, 255, 255]),
                //            2);
                //        break;
                //    case "polygon":
                //        symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                //            new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                //                new dojo.Color([0, 255, 255]),
                //                2),
                //            new dojo.Color([255, 255, 0, 0.25]));
                //        break;
                //    case "extent":
                //        symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID,
                //            new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                //                new dojo.Color([0, 255, 255]),
                //                2),
                //            new dojo.Color([255, 255, 0, 0.25]));
                //        break;
                //    case "multipoint":
                //        symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_DIAMOND,
                //            20,
                //            new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID,
                //                new dojo.Color([0, 255, 255]),
                //                1),
                //            new dojo.Color([255, 255, 0, 0.5]));
                //        break;
                //}

                //var graphic = new esri.Graphic(firstGeometry, symbol);


                //highlightLayer.add(graphic);

                highlightLayer.add(mapPresenter.esriJsonToHighlightedGraphic(firstGeometry));
            }

            //mapPresenter.mapControl.reorderLayer(highlightLayer, 1);

        };



        mapPresenter.getMergedExtent = function (featureSet) {

            var graphics = [];

            for (var i = 0; i < featureSet.features.length; i++) {

                var geometry = esri.geometry.fromJson(EsriJsonGeometryHelper.ParseGeoJson(featureSet.features[i].geometry, featureSet.srid));

                var graphic = new esri.Graphic(geometry, null);

                graphics.push(graphic);
            }

            var extent = graphicsUtils.graphicsExtent(graphics);

            return extent.expand(1.2);
        }


        mapPresenter.zoomToFeatures = function (featureSet) {

            _setBusy(true);

            if (featureSet.isLoaded) {

                var extent = mapPresenter.getMergedExtent(featureSet);

                mapPresenter.mapControl.setExtent(extent);

                _setBusy(false);
            }
            else {
                $.ajax({
                    type: "POST",
                    url: configPresenter.RootUrl + '/api/Ffsdb/SearchLayer',
                    headers: { 'Content-Type': 'application/json; charset=utf-8' },
                    data: JSON.stringify({ LayerId: featureSet.layerId, OriginObjectIds: featureSet.originObjectIds }),
                    success: function (collection) {

                        var srid;

                        _setBusy(false);

                        if (collection) {
                            featureSet.features = collection.features;
                            featureSet.isLoaded = true;
                            srid = ArrayHelper.Last(collection.crs.properties.name.split(':'));
                            featureSet.srid = srid;

                            var extent = mapPresenter.getMergedExtent(featureSet);

                            if (extent) {
                                mapPresenter.mapControl.setExtent(extent);
                            }

                        }
                        else {
                            featureSet.isLoaded = false;
                            srid = 0;
                        }

                    },
                    error: function (jqXHR, textStatus, error) {
                        _setBusy(false);
                    }
                });
            }


        };

        mapPresenter.selectByLocation = function (featureSet) {

            if (featureSet.isLoaded) {
                selectByLocationPresenter.filterFeatures = featureSet;
            }
            else {
                $.ajax({
                    type: "POST",
                    url: configPresenter.RootUrl + '/api/Ffsdb/SearchLayer',
                    headers: { 'Content-Type': 'application/json; charset=utf-8' },
                    data: JSON.stringify({ LayerId: featureSet.layerId, OriginObjectIds: featureSet.originObjectIds }),
                    success: function (collection) {
                        var srid;

                        _setBusy(false);

                        if (collection) {
                            featureSet.features = collection.features;
                            featureSet.isLoaded = true;
                            srid = ArrayHelper.Last(collection.crs.properties.name.split(':'));
                            featureSet.srid = srid;

                            selectByLocationPresenter.filterFeatures = featureSet;
                        }
                        else {
                            selectByLocationPresenter.filterFeatures = [];
                            featureSet.isLoaded = false;
                            srid = 0;
                        }
                    },
                    error: function (jqXHR, textStatus, error) {
                        selectByLocationPresenter.filterFeatures = [];
                        _setBusy(false);
                    }
                });
            }

        }

        mapPresenter.unionFeatures = function (featureSet) {

            var geometries = [];

            for (var i = 0; i < featureSet.features.length; i++) {

                var geometry = esri.geometry.fromJson(EsriJsonGeometryHelper.ParseGeoJson(featureSet.features[i].geometry, featureSet.srid));

                geometries.push(geometry);
            }

            return GeometryEngine.union(geometries);

        }

        mapPresenter.MeasureDistance = function () {

            //prevent multiple calls
            if (mapPresenter.draw) {
                return;
            }

            mapPresenter.draw = new Draw(mapPresenter.mapControl);

            mapPresenter.draw.lineSymbol = mapPresenter.createDrawLineSymbol();

            mapPresenter.draw.on("draw-complete",
                function finish(evt) {
                    mapPresenter.draw.deactivate();

                    mapPresenter.mapControl.showZoomSlider();

                    mapPresenter.draw = null;

                    var geographic = WebMercatorUtils.webMercatorToGeographic(evt.geometry);

                    var length = GeodesicUtils.geodesicLengths([geographic], esri.Units.KILOMETERS);

                    alert('length' + length);
                });

            mapPresenter.draw.activate(esri.toolbars.Draw.POLYLINE);

            mapPresenter.mapControl.hideZoomSlider();
        };

        mapPresenter.MeasureArea = function () {
            //prevent multiple calls
            if (mapPresenter.draw) {
                return;
            }

            mapPresenter.draw = new Draw(mapPresenter.mapControl);

            mapPresenter.draw.fillSymbol = mapPresenter.createDrawPolygonSymbol();

            mapPresenter.draw.on("draw-complete",
                function finish(evt) {
                    mapPresenter.draw.deactivate();

                    mapPresenter.mapControl.showZoomSlider();

                    mapPresenter.draw = null;

                    var geographic = WebMercatorUtils.webMercatorToGeographic(evt.geometry);

                    var polygon = new Polygon(geographic.rings);
                    polygon.spatialReference = new SpatialReference({ wkid: 4326 });

                    var area = GeodesicUtils.geodesicAreas([polygon], esri.Units.SQUARE_KILOMETERS);

                    alert('area:' + area);

                });

            mapPresenter.draw.activate(esri.toolbars.Draw.POLYGON);

            mapPresenter.mapControl.hideZoomSlider();
        };

        mapPresenter.drawPoint = function () {
            //prevent multiple calls
            if (mapPresenter.draw) {
                return;
            }

            mapPresenter.draw = new Draw(mapPresenter.mapControl);

            mapPresenter.draw.on("draw-complete",
                function finish(evt) {
                    mapPresenter.draw.deactivate();

                    mapPresenter.mapControl.showZoomSlider();

                    mapPresenter.draw = null;

                    //var geographic = WebMercatorUtils.webMercatorToGeographic(evt.geometry);
                    //var length = GeodesicUtils.geodesicLengths([geographic], esri.Units.KILOMETERS);
                    drawingPresenter.addDrawing(evt.geometry);
                });

            mapPresenter.draw.activate(esri.toolbars.Draw.POINT);

            mapPresenter.mapControl.hideZoomSlider();
        }

        mapPresenter.drawPolyline = function () {
            //prevent multiple calls
            if (mapPresenter.draw) {
                return;
            }

            mapPresenter.draw = new Draw(mapPresenter.mapControl);

            mapPresenter.draw.lineSymbol = mapPresenter.createDrawLineSymbol();

            mapPresenter.draw.on("draw-complete",
                function finish(evt) {
                    mapPresenter.draw.deactivate();

                    mapPresenter.mapControl.showZoomSlider();

                    mapPresenter.draw = null;

                    //var geographic = WebMercatorUtils.webMercatorToGeographic(evt.geometry);
                    //var length = GeodesicUtils.geodesicLengths([geographic], esri.Units.KILOMETERS);

                    drawingPresenter.addDrawing(evt.geometry);
                });

            mapPresenter.draw.activate(esri.toolbars.Draw.POLYLINE);

            mapPresenter.mapControl.hideZoomSlider();
        }

        mapPresenter.drawPolygon = function () {
            //prevent multiple calls
            if (mapPresenter.draw) {
                return;
            }

            mapPresenter.draw = new Draw(mapPresenter.mapControl);

            mapPresenter.draw.fillSymbol = mapPresenter.createDrawPolygonSymbol();

            mapPresenter.draw.on("draw-complete",
                function finish(evt) {
                    mapPresenter.draw.deactivate();

                    mapPresenter.mapControl.showZoomSlider();

                    mapPresenter.draw = null;

                    //var geographic = WebMercatorUtils.webMercatorToGeographic(evt.geometry);

                    //var length = GeodesicUtils.geodesicLengths([geographic], esri.Units.KILOMETERS);

                    drawingPresenter.addDrawing(evt.geometry);
                });

            mapPresenter.draw.activate(esri.toolbars.Draw.POLYGON);

            mapPresenter.mapControl.hideZoomSlider();
        }


        //mapPresenter.addGraphic = function (graphic) {
        //    //deactivate the toolbar and clear existing graphics 


        //    var graphic = mapPresenter.EsriJsonToDrawingGraphic(graphic);

        //    mapPresenter.mapControl.graphics.add(new Graphic(graphic, symbol));
        //}

    });