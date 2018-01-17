app.controller("gridController", function ($rootScope, $scope, $http, scopeService) {

    onChange = function (arg) {

        var grid = $("#grid").data("kendoGrid");
        var selectedRows = grid.select();

        var selectedDataItems = [];

        for (var i = 0; i < selectedRows.length; i++) {
            selectedDataItems.push(grid.dataItem(selectedRows[i])._shape);
        }

        mapPresenter.updateHighlightedFeatures(selectedDataItems);

        //console.log(arg);

        //var selectedRows = this.select();

        //var selectedDataItems = [];

        //for (var i = 0; i < selectedRows.length; i++) {
        //    selectedDataItems.push(this.dataItem(selectedRows[i])._shape);
        //}

        //mapPresenter.updateHighlightedFeatures(selectedDataItems);

        //console.log(arg);
    };

    //$scope.template = $("#gridTemplate").html();

    $scope.showResultPanel = false;

    $scope.gridOptions = {
        dataSource: {
            type: "json",
            data: { results: [] },
            schema: {
                data: "results"
            }
        },
        selectable: "multiple",
        change: onChange,
        resizable: true,
        sortable: {
            showIndexes: true,
            mode: "multiple",
            allowUnsort: true,
        },
        groupable: true,
        //dataBound: function (e) {
        //    for (var i = 0; i < this.columns.length; i++) {
        //        //this.autoFitColumn(i);
        //        this.columns[i].width = 80;
        //    }
        //},
        scrollable: true,
        pageable: {
            //alwaysVisible: true,
            //pageSizes: [10, 20],
            //numeric: true,
            //previousNext: true,
            refresh: true
        }
    };

    var onListViewChanged = function (e) {
        var selectedIndex = this.select().index();

        applicationPresenter.selectedResultLayerId = selectedIndex;

        resultPanelPresenter.updateSelectedResultLayerGrid(selectedIndex);
    };

    resultPanelPresenter.updateSelectedResultLayerGrid = function (index) {

        var tempItem = applicationPresenter.resultLayers[index];

        if (!tempItem) {
            var dSource = new kendo.data.DataSource({
                //type: "json",
                data: [],
                pageSize: 15
            });

            //var grid = $("#grid").data("kendoGrid");
            //grid.columns = [];
            //grid.thead.remove();
            //grid.setDataSource(dSource);
            ////grid.resizable = true;
            //grid.hideColumn("_shape");
            //grid.hideColumn("Geo");
            prepareGrid(dSource);

            mapPresenter.updateSelectedResultLayerMap(null);

            return;
        }

        _setBusy(true);

        if (tempItem.isLoaded) {
            var tempGeo = tempItem.features;

            var dSource = new kendo.data.DataSource({
                //type: "json",
                data: tempGeo,
                pageSize: 15,
                schema: {
                    parse: function (response) {
                        var result = [];
                        for (var i = 0; i < response.length; i++) {
                            var itemValue = response[i].properties;
                            itemValue._shape = response[i].geometry;
                            result.push(itemValue);
                        }
                        return result;
                    }
                }
            });

            //var grid = $("#grid").data("kendoGrid");
            //grid.columns = [];
            //grid.thead.remove();
            //grid.setDataSource(dSource);
            ////grid.resizable = true;
            //grid.hideColumn("_shape");
            //grid.hideColumn("Geo");
            prepareGrid(dSource);

            mapPresenter.updateSelectedResultLayerMap(tempGeo, tempItem.srid);

            _setBusy(false);
        }
        else {
            $.ajax({
                type: "POST",
                //url: "api/Ffsdb/SearchFFSDB",
                //url: '@Url.Action("SearchLayer", "Ffsdb")',
                url: configPresenter.RootUrl + '/api/Ffsdb/SearchLayer',
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                //data: JSON.stringify(tempItem),
                data: JSON.stringify({ LayerId: tempItem.layerId, OriginObjectIds: tempItem.originObjectIds }),
                success: function (collection) {

                    var tempGeo;
                    var srid;

                    if (collection) {
                        //tempGeo = tempItem.data;
                        tempGeo = collection.features;
                        tempItem.features = collection.features;
                        //tempItem.fields = collection.Fields;
                        tempItem.isLoaded = true;
                        var srid = ArrayHelper.Last(collection.crs.properties.name.split(':'));
                        tempItem.srid = srid;
                    }
                    else {
                        tempGeo = [];
                        tempItem.isLoaded = false;
                        srid = 0;
                    }

                    var dSource = new kendo.data.DataSource({
                        //type: "json",
                        data: tempGeo,
                        pageSize: 15,
                        schema: {
                            parse: function (response) {
                                var result = [];
                                for (var i = 0; i < response.length; i++) {
                                    var itemValue = response[i].properties;
                                    itemValue._shape = response[i].geometry;
                                    result.push(itemValue);
                                }
                                return result;
                            }
                        }
                    });

                    ////var grid = new kendo.kendoGrid();
                    //var grid = $("#grid").data("kendoGrid");
                    //grid.columns = [];
                    //grid.thead.remove();
                    //grid.setDataSource(dSource);
                    //grid.hideColumn("_shape");
                    //grid.hideColumn("Geo");
                    prepareGrid(dSource);

                    mapPresenter.updateSelectedResultLayerMap(tempGeo, tempItem.srid);

                    _setBusy(false);
                },
                error: function (jqXHR, textStatus, error) {
                    _setBusy(false);
                }
            });
        }
    }

    function prepareGrid(dataSource) {

        var grid = $("#grid").data("kendoGrid");
        grid.columns = [];
        grid.thead.remove();
        grid.setDataSource(dataSource);
        //grid.resizable = true;

        for (var i = 0; i < grid.columns.length; i++) {
            grid.columns[i].width = "150px";
            grid.columns[i].minResizableWidth = "150px";
        }

        grid.hideColumn("_shape");
        grid.hideColumn("Geo");
    }

    $scope.listViewOptions = {
        selectable: true,
        template: kendo.template($("#listViewTemplate").html()),
        change: onListViewChanged
    };

    resultPanelPresenter.showResultPanel = function (isVisible) {
        $scope.$apply(function () {
            $scope.showResultPanel = isVisible;
        });

        if (applicationPresenter.resultLayers) {
            resultPanelPresenter.updateResultLayers(applicationPresenter.resultLayers);
        }
    }

    resultPanelPresenter.updateResultLayers = function (selectedLayers) {

        applicationPresenter.resultLayers = selectedLayers;


        scopeService.safeApply($rootScope, function () {

            //$scope.$apply(function () {
            $scope.showResultPanel = true;
            //});

        });


        var listView = $("#listView").data("kendoListView");

        var listViewDataSource = new kendo.data.DataSource({
            type: "json",
            pageSize: 15,
            data: { layers: selectedLayers },
            schema: {
                data: "layers"
            }
        });

        listView.setDataSource(listViewDataSource);

        if (selectedLayers && selectedLayers.length) {
            resultPanelPresenter.updateSelectedResultLayerGrid(0);
        }
        else {
            resultPanelPresenter.updateSelectedResultLayerGrid(-1);
        }

    }

});