app.controller("tocController", function ($scope, $http) {

    function setTerrain(e) {
        mapPresenter.mapControl.removeLayer(googleTerrain);
        mapPresenter.mapControl.removeLayer(googleRoadMap);
        mapPresenter.mapControl.removeLayer(googleSatellite);
        mapPresenter.mapControl.addLayer(googleTerrain, 0);
    }

    function setRoad(e) {
        mapPresenter.mapControl.removeLayer(googleTerrain);
        mapPresenter.mapControl.removeLayer(googleRoadMap);
        mapPresenter.mapControl.removeLayer(googleSatellite);
        mapPresenter.mapControl.addLayer(googleRoadMap, 0);
    }

    function setSatellite(e) {
        mapPresenter.mapControl.removeLayer(googleTerrain);
        mapPresenter.mapControl.removeLayer(googleRoadMap);
        mapPresenter.mapControl.removeLayer(googleSatellite);
        mapPresenter.mapControl.addLayer(googleSatellite, 0);
    }

    var roadmapButton = $("#roadmapButton").kendoButton({
        enable: true,
        imageUrl: configPresenter.RootUrl + '/images/BaseMaps/roadmap.jpg',
        togglable: true,
        selected: false,
        click: function () {
            $("#roadmapButton").addClass('toggleButtonChecked');
            $("#terrainButton").removeClass('toggleButtonChecked');
            $("#satelliteButton").removeClass('toggleButtonChecked');
            setRoad(true);
        }
    });

    var satelliteButton = $("#satelliteButton").kendoButton({
        enable: true,
        imageUrl: configPresenter.RootUrl + '/images/BaseMaps/satellite.jpg',
        togglable: true,
        selected: false,
        click: function () {
            $("#roadmapButton").removeClass('toggleButtonChecked');
            $("#terrainButton").removeClass('toggleButtonChecked');
            $("#satelliteButton").addClass('toggleButtonChecked');
            setSatellite(true);
        }
    });

    var terrainButton = $("#terrainButton").kendoButton({
        enable: true,
        imageUrl: configPresenter.RootUrl + '/images/BaseMaps/terrain.jpg',
        togglable: true,
        selected: true,
        click: function () {
            $("#roadmapButton").removeClass('toggleButtonChecked');
            $("#terrainButton").addClass('toggleButtonChecked');
            $("#satelliteButton").removeClass('toggleButtonChecked');
            setTerrain(true);
        }
    });


    $scope.currentNode = "";

    $scope.checkNode = function (node) {
        return node === $scope.currentNode && node.Name;
    }

    $scope.checkSubTitle = function (node) {
        for (var i = 0; i < applicationPresenter.resultLayers.length; i++) {
            if (applicationPresenter.resultLayers[i].layerId === node.Name) {
                return true;
            }
        }

        return false;
    }

    $scope.getSubTitle = function (node) {
        //return "(" + node.subTitle + " Selected)";

        for (var i = 0; i < applicationPresenter.resultLayers.length; i++) {
            if (applicationPresenter.resultLayers[i].layerId === node.Name) {
                return '(' + applicationPresenter.resultLayers[i].count + ' Selected)';
            }
        }

        return "";
    }

    $scope.isSubLayer = function (node) {
        return node.Name; //when using arcgis server's wms, Name is undefined for group layers
    };

    $scope.getTitle = function (node) { return node.Title; }

    $scope.template = $("#tocTemplate").html();

    $scope.visibleLayersChanged = function (dataItem) {

        //if (!ArrayHelper.Exists(tocPresenter.tocLayers, dataItem)) {
        //    tocPresenter.tocLayers.push(dataItem);
        //}

        if (dataItem.isChecked) {
            if (!ArrayHelper.Exists(mapPresenter.visibleLayers, dataItem.Name)) {
                ArrayHelper.Add(mapPresenter.visibleLayers, dataItem.Name);

                //mapPresenter.visibleLayers = mapPresenter.visibleLayers;
            }
        }
        else {
            ArrayHelper.Remove(mapPresenter.visibleLayers, dataItem.Name);

            //mapPresenter.visibleLayers = mapPresenter.visibleLayers;
        }

        mapPresenter.refresh();
    };

    $scope.options = {
        dataTextField: "Title",
        //checkboxes: true,
    };

    $scope.selectedLayerChanged = function (dataItem) {
        var treeView = $('#treeview').data('kendoTreeView');

        var node = treeView.findByUid(dataItem.uid);

        var item = treeView.dataItem(node);

        $scope.currentNode = item;

        //item.loaded(false);
        //item.load();
    };

    $scope.selectByDrawing = function (dataItem) { return mapPresenter.selectByDrawing(dataItem) };

    $scope.selectByAttribute = function (dataItem) { return mapPresenter.selectByAttribute(dataItem) };

    function httpGetAsync(theUrl, callback) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
                callback(xmlHttp.responseText);
        }
        xmlHttp.open("GET", theUrl, true); // true for asynchronous
        xmlHttp.send(null);
    }

    $scope.clearResultLayer = function (dataItem) {
        tocPresenter.clearResultLayer(dataItem);
    };

    tocPresenter.clearResultLayer = function (dataItem) {
        for (var i = 0; i < applicationPresenter.resultLayers.length; i++) {
            if (dataItem.Name === applicationPresenter.resultLayers[i].layerId) {
                ArrayHelper.RemoveAt(applicationPresenter.resultLayers, i);
                resultPanelPresenter.updateResultLayers(applicationPresenter.resultLayers);
                return;
            }
        }
    }

    //function clearResultLayer(dataItem) {
    //    for (var i = 0; i < applicationPresenter.resultLayers.length; i++) {
    //        if (dataItem.Name === applicationPresenter.resultLayers[i].layerId) {
    //            ArrayHelper.RemoveAt(applicationPresenter.resultLayers, i);
    //            resultPanelPresenter.updateResultLayers(applicationPresenter.resultLayers);
    //            return;
    //        }
    //    }
    //}

    $scope.zoomToFeatures = function (dataItem) {
        for (var i = 0; i < applicationPresenter.resultLayers.length; i++) {
            if (dataItem.Name === applicationPresenter.resultLayers[i].layerId) {
                mapPresenter.zoomToFeatures(applicationPresenter.resultLayers[i]);
                return;
            }
        }
    };

    $scope.showRelatedDocuments = function (dataItem) {
        for (var i = 0; i < applicationPresenter.resultLayers.length; i++) {
            if (dataItem.Name === applicationPresenter.resultLayers[i].layerId) {
                relatedDocumentPresenter.showRelatedDocuments(applicationPresenter.resultLayers[i]);
                return;
            }
        }
    };

    $scope.selectByLocation = function (dataItem) {
        for (var i = 0; i < applicationPresenter.resultLayers.length; i++) {
            if (dataItem.Name === applicationPresenter.resultLayers[i].layerId) {
                mapPresenter.selectByLocation(applicationPresenter.resultLayers[i]);

                applicationPresenter.openSelectByLocationDialog();

                return;



            }
        }
    }

    //var tocLayerHierarchy;
    //$.ajax({
    //    type: "GET",
    //    crossDomain: true,
    //    dataType: 'jsonp', 
    //    url: 'http://localhost:8000/geoserver/SqlWs/wms?service=wms&request=getcapabilities&version=1.3.0&type=application/json',

    //    success: function (data) {

    //    },
    //    error: function (jqXHR, textStatus, error) {

    //}
    //    });




    var wmsUrl = configPresenter.WmsUrl + '?service=wms&request=getcapabilities&version=1.3.0&type=text/xml';

    $.ajax({
        type: "POST",
        //url: http://localhost:8000/geoserver/SqlWs/wms?service=wms&request=getcapabilities&version=1.3.0&type=text/xml',
        //url: configPresenter.WmsUrl + '?service=wms&request=getcapabilities&version=1.3.0&type=text/xml',
        url: configPresenter.RootUrl + '/api/Passway/CallHttpGetForXml',
        data: JSON.stringify(wmsUrl),
        //headers: { 'Content-Type': 'text/xml; charset=utf-8' },
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        success: function (data) {

            //When using json:
            //var layers = JSON.parse(data).Capability.Layer.Layers;

            //When using xml:
            var x2js = new X2JS({
                arrayAccessFormPaths: [
                    "WMS_Capabilities.Capability.Layer.Layer",
                    "WMS_Capabilities.Capability.Layer.Layer.CRS",
                    "WMS_Capabilities.Capability.Layer.Layer.Layer",
                    "WMS_Capabilities.Capability.Layer.Layer.Layer.BoundingBox",
                    "WMS_Capabilities.Capability.Layer.Layer.Layer.Style",
                    "WMS_Capabilities.Capability.Layer.Layer.Layer.Layer",
                    "WMS_Capabilities.Capability.Layer.Layer.Layer.CRS",
                    "WMS_Capabilities.Capability.Layer.Layer.Layer.Layer.Layer",
                ]
            });

            //if using httpGetAsync
            //tocPresenter.tocLayerHierarchy = x2js.xml_str2json(data).WMS_Capabilities.Capability.Layer.Layer;
            tocPresenter.tocLayerHierarchy = x2js.xml2json(data).WMS_Capabilities.Capability.Layer.Layer;

            //add isCheck property for each layer

            function prepare(inputLayer) {
                inputLayer.isChecked = false;

                if (inputLayer.Layer && inputLayer.Layer.length) {
                    for (var i = 0; i < inputLayer.Layer.length; i++) {
                        prepare(inputLayer.Layer[i]);
                    }
                }
                //if (inputLayer.Layer) {
                //    prepare(inputLayer.Layer);
                //}
            };

            for (var i = 0; i < tocPresenter.tocLayerHierarchy.length; i++) {
                prepare(tocPresenter.tocLayerHierarchy[i]);
            }

            var subItems = {
                schema: {
                    data: "Layer",
                    model: {
                        children: subItems
                    }
                }
            };

            $scope.$apply(function () {
                $scope.treeData = new kendo.data.HierarchicalDataSource({
                    data: tocPresenter.tocLayerHierarchy,
                    schema: {
                        model: {
                            children: subItems
                        }
                    }
                });
            });

            function bindCheckboxToId() {
                var treeView = $('#treeview').data('kendoTreeView');
                var myNodes = treeView.dataSource.view();
                for (var i = 0; i < myNodes.length; i++) {

                    checkTreeViewNode(myNodes[i], tocPresenter.tocLayerHierarchy[i]);
                }
            }

            function checkTreeViewNode(node, model) {

                model.uid = node.uid;

                if (model.Name) {
                    tocPresenter.tocLayers.push({ layerName: model.Name, layerUid: model.uid });
                }



                node.load();
                if (node.children.view) {
                    var children = node.children.view();
                    if (children) {
                        for (var j = 0; j < children.length; j++) {
                            checkTreeViewNode(children[j], model.Layer[j]);
                        }
                    }
                }
            }

            tocPresenter.tocLayers = [];

            bindCheckboxToId();

            if (selectByLocationPresenter.updateLayerList) {
                selectByLocationPresenter.updateLayerList();
            }

        },
        error: function (jqXHR, textStatus, error) {
            _setBusy(false);
        }
    });






    //$.ajax({
    //    type: "GET",
    //    //url: http://localhost:8000/geoserver/SqlWs/wms?service=wms&request=getcapabilities&version=1.3.0&type=text/xml',
    //    url: configPresenter.WmsUrl + '?service=wms&request=getcapabilities&version=1.3.0&type=text/xml',
    //    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
    //    success: function (data) {

    //        //When using json:
    //        //var layers = JSON.parse(data).Capability.Layer.Layers;

    //        //When using xml:
    //        var x2js = new X2JS({
    //            arrayAccessFormPaths: [
    //                "WMS_Capabilities.Capability.Layer.Layer",
    //                "WMS_Capabilities.Capability.Layer.Layer.CRS",
    //                "WMS_Capabilities.Capability.Layer.Layer.Layer",
    //                "WMS_Capabilities.Capability.Layer.Layer.Layer.BoundingBox",
    //                "WMS_Capabilities.Capability.Layer.Layer.Layer.Style",
    //                "WMS_Capabilities.Capability.Layer.Layer.Layer.Layer",
    //                "WMS_Capabilities.Capability.Layer.Layer.Layer.CRS",
    //                "WMS_Capabilities.Capability.Layer.Layer.Layer.Layer.Layer",
    //            ]
    //        });

    //        //if using httpGetAsync
    //        //tocPresenter.tocLayerHierarchy = x2js.xml_str2json(data).WMS_Capabilities.Capability.Layer.Layer;
    //        tocPresenter.tocLayerHierarchy = x2js.xml2json(data).WMS_Capabilities.Capability.Layer.Layer;

    //        //add isCheck property for each layer

    //        function prepare(inputLayer) {
    //            inputLayer.isChecked = false;

    //            if (inputLayer.Layer && inputLayer.Layer.length) {
    //                for (var i = 0; i < inputLayer.Layer.length; i++) {
    //                    prepare(inputLayer.Layer[i]);
    //                }
    //            }
    //            //if (inputLayer.Layer) {
    //            //    prepare(inputLayer.Layer);
    //            //}
    //        };

    //        for (var i = 0; i < tocPresenter.tocLayerHierarchy.length; i++) {
    //            prepare(tocPresenter.tocLayerHierarchy[i]);
    //        }

    //        var subItems = {
    //            schema: {
    //                data: "Layer",
    //                model: {
    //                    children: subItems
    //                }
    //            }
    //        };

    //        $scope.$apply(function () {
    //            $scope.treeData = new kendo.data.HierarchicalDataSource({
    //                data: tocPresenter.tocLayerHierarchy,
    //                schema: {
    //                    model: {
    //                        children: subItems
    //                    }
    //                }
    //            });
    //        });

    //        function bindCheckboxToId() {
    //            var treeView = $('#treeview').data('kendoTreeView');
    //            var myNodes = treeView.dataSource.view();
    //            for (var i = 0; i < myNodes.length; i++) {

    //                checkTreeViewNode(myNodes[i], tocPresenter.tocLayerHierarchy[i]);
    //            }
    //        }

    //        function checkTreeViewNode(node, model) {

    //            model.uid = node.uid;

    //            if (model.Name) {
    //                tocPresenter.tocLayers.push({ layerName: model.Name, layerUid: model.uid });
    //            }



    //            node.load();
    //            if (node.children.view) {
    //                var children = node.children.view();
    //                if (children) {
    //                    for (var j = 0; j < children.length; j++) {
    //                        checkTreeViewNode(children[j], model.Layer[j]);
    //                    }
    //                }
    //            }
    //        }

    //        tocPresenter.tocLayers = [];

    //        bindCheckboxToId();

    //        if (selectByLocationPresenter.updateLayerList) {
    //            selectByLocationPresenter.updateLayerList();
    //        }

    //    },
    //    error: function (jqXHR, textStatus, error) {
    //        _setBusy(false);
    //    }
    //});





























    //httpGetAsync("http://localhost:51512/zavarNegar/wms/myWms?service=wms&request=getcapabilities&version=1.3.0&type=text/json", function (data) {
    //httpGetAsync("http://localhost:51512/zavarNegar/wms/myWms?service=wms&request=getcapabilities&version=1.3.0&type=text/xml", function (data) {
    //httpGetAsync("http://localhost/ZavarNegar/zavarNegar/wms/myWms?service=wms&request=getcapabilities&version=1.3.0&type=text/json", function (data) {
    //httpGetAsync("http://localhost/ZavarNegar/zavarNegar/wms/myWms?service=wms&request=getcapabilities&version=1.3.0&type=text/xml", function (data) {
    ////httpGetAsync("http://localhost:8000/geoserver/SqlWs/wms?service=wms&request=getcapabilities&version=1.3.0&type=text/xml", function (data) {

    //    //When using json:
    //    //var layers = JSON.parse(data).Capability.Layer.Layers;

    //    //When using xml:
    //    var x2js = new X2JS({
    //        arrayAccessFormPaths: [
    //            "WMS_Capabilities.Capability.Layer.Layer",
    //            "WMS_Capabilities.Capability.Layer.Layer.CRS",
    //            "WMS_Capabilities.Capability.Layer.Layer.Layer",
    //            "WMS_Capabilities.Capability.Layer.Layer.Layer.BoundingBox",
    //            "WMS_Capabilities.Capability.Layer.Layer.Layer.Style",
    //            "WMS_Capabilities.Capability.Layer.Layer.Layer.Layer",
    //            "WMS_Capabilities.Capability.Layer.Layer.Layer.CRS",
    //            "WMS_Capabilities.Capability.Layer.Layer.Layer.Layer.Layer",
    //        ]
    //    });

    //    tocPresenter.tocLayerHierarchy = x2js.xml_str2json(data).WMS_Capabilities.Capability.Layer.Layer;

    //    //add isCheck property for each layer
    //    function prepare(inputLayer) {
    //        inputLayer.isChecked = false;

    //        if (inputLayer.Layer && inputLayer.Layer.length) {
    //            for (var i = 0; i < inputLayer.Layer.length; i++) {
    //                prepare(inputLayer.Layer[i]);
    //            }
    //        }
    //        //if (inputLayer.Layer) {
    //        //    prepare(inputLayer.Layer);
    //        //}
    //    };

    //    for (var i = 0; i < tocPresenter.tocLayerHierarchy.length; i++) {
    //        prepare(tocPresenter.tocLayerHierarchy[i]);
    //    }

    //    var subItems = {
    //        schema: {
    //            data: "Layer",
    //            model: {
    //                children: subItems
    //            }
    //        }
    //    };

    //    $scope.$apply(function () {
    //        $scope.treeData = new kendo.data.HierarchicalDataSource({
    //            data: tocPresenter.tocLayerHierarchy,
    //            schema: {
    //                model: {
    //                    children: subItems
    //                }
    //            }
    //        });
    //    });

    //    function bindCheckboxToId() {
    //        var treeView = $('#treeview').data('kendoTreeView');
    //        var myNodes = treeView.dataSource.view();
    //        for (var i = 0; i < myNodes.length; i++) {

    //            checkTreeViewNode(myNodes[i], tocPresenter.tocLayerHierarchy[i]);
    //        }
    //    }

    //    function checkTreeViewNode(node, model) {

    //        model.uid = node.uid;

    //        if (model.Name) {
    //            tocPresenter.tocLayers.push({ layerName: model.Name, layerUid: model.uid });
    //        }



    //        node.load();
    //        if (node.children.view) {
    //            var children = node.children.view();
    //            if (children) {
    //                for (var j = 0; j < children.length; j++) {
    //                    checkTreeViewNode(children[j], model.Layer[j]);
    //                }
    //            }
    //        }
    //    }

    //    tocPresenter.tocLayers = [];

    //    bindCheckboxToId();

    //    if (selectByLocationPresenter.updateLayerList) {
    //        selectByLocationPresenter.updateLayerList();
    //    }

    //});
});