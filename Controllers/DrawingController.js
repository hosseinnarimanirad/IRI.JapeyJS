app.controller("drawingController", function ($scope, $http) {

    drawingPresenter.drawingItems = [];

    //drawingPresenter.drawingItems.push({
    //    id: 1,
    //    geo: null,
    //    isChecked: true,
    //    title: "title 1"
    //});

    //drawingPresenter.drawingItems.push({
    //    id: 2,
    //    geo: null,
    //    isChecked: false,
    //    title: "title 2"
    //});

    var dataSource = new kendo.data.DataSource({
        data: drawingPresenter.drawingItems
    });


    $scope.currentNode = "";

    var onListViewChanged = function (e) {

        var listView = $('#drawingListbox').data('kendoListView');

        var index = listView.select().index();
        var dataItem = listView.dataSource.view()[index];
        var uid = dataItem.uid;

        drawingPresenter.drawingItems[index].uid = uid;

        if ($scope.currentNode) {
            var item = findDrawingItemById($scope.currentNode.uid);

            //what if prev selected item was removed.
            if (item) {
                mapPresenter.updateDrawingSymbol(item.graphic, mapPresenter.createDrawingSymbolForEsriJson(item.geo));
            }

        }

        //var item = listView.dataItem(node);
        $scope.$apply(function () {
            $scope.currentNode = dataItem;
        });

        mapPresenter.updateDrawingSymbol(findDrawingItemById(dataItem.uid).graphic, mapPresenter.createHighlightedDrawingSymbolForEsriJson(dataItem.geo));
    };

    function findDrawingItemById(uid) {
        for (var i = 0; i < drawingPresenter.drawingItems.length; i++) {
            if (drawingPresenter.drawingItems[i].uid == uid) {
                return drawingPresenter.drawingItems[i];
            }
        }
    }

    $scope.options = {
        selectable: true,
        //dataTextField: "Title",
        //template: '<div style="padding:4px">#:title#</div>',
        template: kendo.template($("#drawingTemplate").html()),
        dataSource: dataSource,
        change: onListViewChanged

    };

    $scope.checkNode = function (node) {
        return node === $scope.currentNode && node.uid;
    }

    $scope.getTitle = function (dataItem) {
        return dataItem.title;
    };

    $scope.visibleLayersChanged = function (dataItem) {

        for (var i = 0; i < drawingPresenter.drawingItems.length; i++) {
            if (drawingPresenter.drawingItems[i].uid == dataItem.uid) {
                if (dataItem.isChecked) {
                    mapPresenter.addDrawingGraphic(drawingPresenter.drawingItems[i].graphic);
                }
                else {
                    mapPresenter.removeDrawingGraphic(drawingPresenter.drawingItems[i].graphic);
                }

            }
        }

    };

    $scope.delete = function (dataItem) {

        for (var i = 0; i < drawingPresenter.drawingItems.length; i++) {
            if (drawingPresenter.drawingItems[i].uid == dataItem.uid) {
                mapPresenter.removeDrawingGraphic(drawingPresenter.drawingItems[i].graphic);
                ArrayHelper.RemoveAt(drawingPresenter.drawingItems, i);
                ArrayHelper.RemoveAt(dataSource.data(), i);
                $scope.currentNode = null;
            }
        }

    };

    $scope.selectByLocation = function (dataItem) {

        var featureSet = {
            isLoaded: true,
            srid: 3857,
            features: [{
                geometry: EsriJsonGeometryHelper.ToGeoJson(dataItem.geo, 3857) }]
        };

        mapPresenter.selectByLocation(featureSet);

        applicationPresenter.openSelectByLocationDialog();

        return;
    }

    $scope.zoom = function (dataItem) {
        if (!dataItem) {
            return;
        }

        if (dataItem.geo.type == "point") {
            var maxZoom = mapPresenter.mapControl.getMaxZoom();
            mapPresenter.mapControl.centerAndZoom(dataItem.geo, maxZoom - 1);
        }
        else {
            mapPresenter.mapControl.setExtent(dataItem.geo.getExtent());
        }

    }

    drawingPresenter.addDrawing = function (geographicFeature) {

        var newItem = {
            geo: geographicFeature,
            isChecked: true,
            title: "title " + (drawingPresenter.drawingItems.length + 1),
            graphic: mapPresenter.esriJsonToDrawingGraphic(geographicFeature)
        };

        drawingPresenter.drawingItems.push(newItem);

        dataSource.data().push(newItem);

        mapPresenter.addDrawingGraphic(newItem.graphic);
    };


});