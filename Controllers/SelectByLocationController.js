selectByLocationModule.controller("selectByLocationController", function ($rootScope, $scope, $http, scopeService) {

    //$scope.layerList = tocPresenter.tocLayers;

    $scope.isPanelDataLoaded = false;

    $scope.selectByLocation = function () {

        var id = $("#selectByLocationCombo").data("kendoDropDownList").value();

        var name = $("#selectByLocationCombo").data("kendoDropDownList").text();

        if (selectByLocationPresenter.filterFeatures) {

            var filters = selectByLocationPresenter.filterFeatures;

            //arcgis server do not supports or in WFS request parameters, so we have to merge the geometries
            //union features
            var merged = mapPresenter.unionFeatures(filters);

            if (applicationPresenter.isArcGISServerMode) {
                WfsHelper.GetFeatureIntersectForArcGISServer(configPresenter.WfsUrl,
                    name,
                    merged.toJson(),
                    //Enumerable.From(filters.features).Select(function (f) { return f.geometry; }).ToArray(),
                    //filters.srid,
                    function (resultString) {

                        var x2js = new X2JS();

                        var gmlResult = x2js.xml2json(resultString);

                        var result = Gml3Helper.GmlObjectToGeoJson(gmlResult, "Shape");

                        if (!result.features || !result.features.length || result.features.length < 1) {
                            alert('No feature found!');
                            return;
                        }

                        //var srid = ArrayHelper.Last(result.crs.properties.name.split(':'));
                        var srid = ArrayHelper.Last(gmlResult.FeatureCollection.boundedBy.Envelope._srsName.split(':'));

                        mapPresenter.updateSelectedResultLayerMap(result.features, srid);

                        if (result && result.features) {

                            var newItem = {
                                id: id,
                                layerId: name,
                                layerName: name,
                                count: result.features.length,
                                features: result.features,
                                //fields: result.features,
                                isLoaded: true,
                                srid: srid
                            };


                            if (!applicationPresenter.resultLayers) {
                                applicationPresenter.resultLayers = [];
                            }

                            ArrayHelper.RemoveWhen(applicationPresenter.resultLayers, function (p) { return p.id == id; });

                            applicationPresenter.resultLayers.push(newItem);

                            var index = applicationPresenter.resultLayers.indexOf(newItem);

                            resultPanelPresenter.updateResultLayers(applicationPresenter.resultLayers);

                            resultPanelPresenter.updateSelectedResultLayerGrid(index);
                        }


                        applicationPresenter.closeSelectByLocationDialog();
                    });


            }
            else {

                //union features
                //var merged = mapPresenter.unionFeatures(filters);

                //request wfs
                //WfsHelper.GetFeatureIntersectWithMultipleGeometries("http://localhost:8000/geoserver/wfs",
                WfsHelper.GetFeatureIntersectWithMultipleGeometries(configPresenter.WfsUrl,
                    name,
                    //merged.toJson(),
                    Enumerable.From(filters.features).Select(function (f) { return f.geometry; }).ToArray(),
                    filters.srid,
                    function (result) {

                        if (!result.features || !result.features.length || result.features.length < 1) {
                            alert('No feature found!');
                            return;
                        }

                        var srid = ArrayHelper.Last(result.crs.properties.name.split(':'));

                        mapPresenter.updateSelectedResultLayerMap(result.features, srid);

                        if (result && result.features) {

                            var newItem = {
                                id: id,
                                layerId: name,
                                layerName: name,
                                count: result.features.length,
                                features: result.features,
                                //fields: result.features,
                                isLoaded: true,
                                srid: srid
                            };


                            if (!applicationPresenter.resultLayers) {
                                applicationPresenter.resultLayers = [];
                            }

                            ArrayHelper.RemoveWhen(applicationPresenter.resultLayers, function (p) { return p.id == id; });

                            applicationPresenter.resultLayers.push(newItem);

                            var index = applicationPresenter.resultLayers.indexOf(newItem);

                            resultPanelPresenter.updateResultLayers(applicationPresenter.resultLayers);

                            resultPanelPresenter.updateSelectedResultLayerGrid(index);
                        }


                        applicationPresenter.closeSelectByLocationDialog();
                    });
            }

        }
    }

    selectByLocationPresenter.changeVisibility = function (visibility) {
        scopeService.safeApply($rootScope, function () {
            $scope.isPanelDataLoaded = visibility;
        });
    }

    selectByLocationPresenter.updateLayerList = function () {

        scopeService.safeApply($rootScope, function () {

            $scope.layerList = tocPresenter.tocLayers;

            $scope.isPanelDataLoaded = true;
        });

    }
})