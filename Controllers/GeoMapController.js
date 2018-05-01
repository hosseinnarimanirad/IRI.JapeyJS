app.controller("geoMapsController", function ($scope, $http) {


    //[{ sheetName: 'SALEHE', layerId: 0, serviceName: 'NIOC Geology Index 50k' },
    // { sheetName: 'MAZRAEH', layerId: 0, serviceName: 'NIOC Geology Index 50k' },
    // { sheetName: 'BOSTAN', layerId: 1, serviceName: 'NIOC Geology Index 100k' },
    // { sheetName: 'AHVAZ', layerId: 1, serviceName: 'NIOC Geology Index 100k' },
    // { sheetName: 'BOSTAN', layerId: 2, serviceName: 'GSI Geology Index 100k' },
    // { sheetName: 'AHVAZ', layerId: 2, serviceName: 'GSI Geology Index 100k' },
    // { sheetName: 'Sheet No 4 South-West Iran', layerId: 3, serviceName: 'NIOC Geology Index 1000k' }]

    function find(listOfIndexeFeatures) {

        listOfIndexeFeatures =
            [{ sheetName: 'SALEHE', isClipped: true, layerId: 0, serviceName: 'NIOC Geology Index 50k' },
            { sheetName: 'MAZRAEH', isClipped: true, layerId: 0, serviceName: 'NIOC Geology Index 50k' },
            { sheetName: 'BOSTAN', isClipped: true, layerId: 1, serviceName: 'NIOC Geology Index 100k' },
            { sheetName: 'AHVAZ', isClipped: false, layerId: 1, serviceName: 'NIOC Geology Index 100k' },
            { sheetName: 'BOSTAN', isClipped: false, layerId: 2, serviceName: 'GSI Geology Index 100k' },
            { sheetName: 'AHVAZ', isClipped: false, layerId: 2, serviceName: 'GSI Geology Index 100k' },
            { sheetName: 'Sheet No 4 South-West Iran', isClipped: true, layerId: 3, serviceName: 'NIOC Geology Index 1000k' }];


        update(listOfIndexeFeatures);
        //clear GeoMaps
        //foreach item as indexedFeature

        //      var sheetName = sheetname attribute of the item
        //      find geo maps based on sheet name and layername

        //foreach feature in geomaps
        //...
    };

    ////$scope.$apply(function () {
    //$scope.treeData = new kendo.data.HierarchicalDataSource({
    //    data: tocPresenter.tocLayerHierarchy,
    //    schema: {
    //        model: {
    //            children: subItems
    //        }
    //    }
    //});
    ////});

    $scope.options = {
        ////dataSource: {
        ////    type: "json",
        ////    data: { results: [{ isChecked: false, sheetName: 'SALEHE', layerId: 0, serviceName: 'NIOC Geology Index 50k' }] },
        ////    schema: {
        ////        data: "results"
        ////    }
        ////},
        //selectable: "multiple",
        ////change: onChange,
        //resizable: true,
        //sortable: {
        //    showIndexes: true,
        //    mode: "multiple",
        //    allowUnsort: true,
        //},
        //groupable: true,
        //scrollable: true,

        dataTextField: "title",
        template: kendo.template($("#geoMapTemplate").html()),
    };


    function prepareGrid(dataSource) {

        var grid = $("#geoMapsGrid").data("kendoGrid");
        grid.columns = [];
        grid.thead.remove();
        grid.setDataSource(dataSource);
        //grid.resizable = true;

        for (var i = 0; i < grid.columns.length; i++) {
            grid.columns[i].width = "150px";
            grid.columns[i].minResizableWidth = "150px";
        }

        //grid.hideColumn("_shape");
        //grid.hideColumn("Geo");
    }

    $scope.visibleLayersChanged = function (dataItem) {

        //find related wms layer
        var wmsLayer;

        if (dataItem.isChecked) {
            if (!ArrayHelper.Exists(configPresenter.GeoMapServices, dataItem.Name)) {
                ArrayHelper.Add(mapPresenter.visibleLayers, dataItem.Name);
            }
        }
        else {
            ArrayHelper.Remove(mapPresenter.visibleLayers, dataItem.Name);
        }

        mapPresenter.refresh();
    };

    $scope.getTitle = function (node) { return node.sheetName; }

    $scope.treeData = [];


    $scope.isSubLayer = function (node) {
        return !(node.subItems); //when using arcgis server's wms, Name is undefined for group layers
    };


    find(null);

    function update(geoMaps) {

        geoMapsPresenter.geoMaps = geoMaps;

        var hierarchy = makeHierarchy(geoMaps);

        var subItems = {
            schema: {
                data: "subItems",
                model: {
                    children: subItems
                }
            }
        };

        //$scope.$apply(function () {
            $scope.treeData = new kendo.data.HierarchicalDataSource({
                data: hierarchy,
                schema: {
                    model: {
                        children: subItems
                    }
                }
            });
        //});

    }

    function makeHierarchy(geoMaps) {

        for (var i = 0; i < geoMaps.length; i++) {
            geoMaps[i].isChecked = false;
            geoMaps[i].title = geoMaps[i].sheetName;
        }

        var allGeoMaps = Enumerable.From(geoMaps);

        var clipped = allGeoMaps.Where(function (g) { return g.isClipped; });

        var withLegend = allGeoMaps.Where(function (g) { return !g.isClipped; });


        var clippedGroups = clipped.GroupBy("$.serviceName", null, "{ title: $, subItems: $$.ToArray()}").ToArray();

        var withLegendGroups = withLegend.GroupBy("$.serviceName", null, "{ title: $, subItems: $$.ToArray()}").ToArray();

        var result = [
            { title: 'Clipped', subItems: clippedGroups },
            { title: 'With Legend', subItems: withLegendGroups },
        ];
      

        return result;
    }
});