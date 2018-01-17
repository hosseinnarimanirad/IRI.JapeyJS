relatedDocModule.controller("relatedDocumentController", function ($rootScope, $scope, $http, scopeService) {

    $scope.objTemplate = $("#objTreeTemplate").html();

    $scope.docTemplate = $("#docTreeTemplate").html();

    $scope.subjectFilter = '';

    $scope.captionFilter = '';

    $scope.$watch("subjectFilter", function (newValue, oldValue) {
        updateSecondTreeView(selectedLayerName, selectedObjName);
    });

    $scope.$watch("captionFilter", function (newValue, oldValue) {
        updateSecondTreeView(selectedLayerName, selectedObjName);
    });

    var rawData;

    var originalData;

    var selectedLayerName = null;
    var selectedObjName = null;

    $scope.objOptions = {
        //dataTextField: ["layerName", "objName"]
        select: function (e) {
            var data = e.sender.dataItem(e.node);

            if (data.layerName) {
                selectedLayerName = data.layerName;
            }

            if (data.layerName && data.objName) {
                selectedLayerName = data.layerName;

                selectedObjName = data.objName;

                updateSecondTreeView(data.layerName, data.objName);
            }
            else if (data.layerName) {
                selectedLayerName = data.layerName;
            }
            else {
                selectedLayerName = null;

                selectedObjName = null;
            }

        }
    };

    $scope.docOptions = {};



    relatedDocumentPresenter.update = function (data) {
        scopeService.safeApply($rootScope, function () {

            originalData = data;

            if (data && data.length) {
                $scope.DocumentCount = data.length;
            }


            var linqArray = Enumerable.From(data);

            var layerGroups = linqArray.GroupBy(function (x) { return x.objType }).Select(function (x) { return { layerName: x.Key(), objItems: Enumerable.From(x.source) } });

            layerGroups = layerGroups.Select(function (x) {
                return {
                    layerName: x.layerName,
                    count: x.objItems.Count(),
                    objItems: x.objItems.GroupBy(function (y) { return y.objName }).ToArray(),
                    title: x.layerName,
                    isLayerLevel: true
                }
            }).ToArray();

            for (var i = 0; i < layerGroups.length; i++) {
                for (var j = 0; j < layerGroups[i].objItems.length; j++) {
                    var currentItem = layerGroups[i].objItems[j];

                    layerGroups[i].objItems[j] = {
                        layerName: layerGroups[i].layerName,
                        objName: currentItem.Key(),
                        count: currentItem.source.length,
                        titleItems: Enumerable.From(currentItem.source).GroupBy(function (x) { return x.titleName }).ToArray(),
                        title: currentItem.Key(),
                        isObjectLevel: true
                    };

                    for (var k = 0; k < layerGroups[i].objItems[j].titleItems.length; k++) {
                        var currentTitle = layerGroups[i].objItems[j].titleItems[k];

                        layerGroups[i].objItems[j].titleItems[k] = {
                            titleName: currentTitle.Key(),
                            count: currentTitle.source.length,
                            subjectItems: Enumerable.From(currentTitle.source).GroupBy(function (x) { return x.subjectType }).ToArray(),
                            title: currentTitle.Key(),
                            isTitleLevel: true
                        };
                    }
                }
            }

            rawData = layerGroups;

            $scope.listData = new kendo.data.HierarchicalDataSource({
                data: layerGroups,
                schema: {
                    model: {
                        children: {
                            schema: {
                                data: "objItems",
                                //model: {
                                //    children: {
                                //        schema: {
                                //            data: "titleItems"
                                //        }
                                //    }
                                //}
                            }
                        }
                    }
                }
            });

        });
    }

    function updateSecondTreeView(layerName, objName) {

        if (!(layerName && objName)) {
            return;
        }

        var source = null;

        for (var i = 0; i < rawData.length; i++) {
            if (rawData[i].layerName === layerName) {

                for (var j = 0; j < rawData[i].objItems.length; j++) {
                    if (rawData[i].objItems[j].objName === objName) {

                        source = [];

                        for (var t = 0; t < rawData[i].objItems[j].titleItems.length; t++) {

                            source.push({
                                titleName: rawData[i].objItems[j].titleItems[t].titleName,
                                count: rawData[i].objItems[j].titleItems[t].count,
                                //subjectItems: rawData[i].objItems[j].titleItems[t].subjectItems,
                                title: rawData[i].objItems[j].titleItems[t].titleName,
                                isTitleLevel: true
                            });

                            source[t].subjectItems = [];

                            for (var s = 0; s < rawData[i].objItems[j].titleItems[t].subjectItems.length; s++) {
                                var subject = rawData[i].objItems[j].titleItems[t].subjectItems[s].Key().toLowerCase();

                                if ($scope.subjectFilter && $scope.subjectFilter.length > 0 && subject.indexOf($scope.subjectFilter.toLowerCase()) === -1) {
                                    continue;
                                }

                                var newSubject = {
                                    subjectName: rawData[i].objItems[j].titleItems[t].subjectItems[s].Key(),
                                    count: rawData[i].objItems[j].titleItems[t].subjectItems[s].source.length,
                                    //captoinItems: rawData[i].objItems[j].titleItems[t].subjectItems[s].source,
                                    captoinItems: [],
                                    title: rawData[i].objItems[j].titleItems[t].subjectItems[s].Key(),
                                    isSubjectLevel: true,
                                };

                                var newCaptions = rawData[i].objItems[j].titleItems[t].subjectItems[s].source;

                                for (var c = 0; c < newCaptions.length; c++) {

                                    var caption = newCaptions[c].caption.toLowerCase();

                                    if ($scope.captionFilter && $scope.captionFilter.length > 0 && caption.indexOf($scope.captionFilter.toLowerCase()) === -1) {
                                        continue;
                                    }

                                    newCaptions[c].title = newCaptions[c].caption;

                                    newCaptions[c].isCaptionLevel = true;

                                    newSubject.captoinItems.push(newCaptions[c]);
                                }

                                if (newSubject.captoinItems.length > 0) {
                                    source[t].subjectItems.push(newSubject);
                                }

                            }
                        }


                    }
                }
            }
        }

        scopeService.safeApply($rootScope, function () {
            $scope.detailsData = new kendo.data.HierarchicalDataSource({
                data: source,
                schema: {
                    model: {
                        children: {
                            schema: {
                                data: "subjectItems",
                                model: {
                                    children: {
                                        schema: {
                                            data: "captoinItems"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        });

    }

    function exportToExcel(data) {

        var rows = [];

        rows.push({
            cells: [
                { value: "id" }, { value: "objCode" }, { value: "objName" }, { value: "titleName" }, { value: "subjectType" },
                { value: "caption" }, { value: "pathDoc" }, { value: "extDoc" }, { value: "fromPage" }, { value: "toPage" },
                { value: "storedType" }, { value: "code" }, { value: "titleCode" }, { value: "subjectCode" }, { value: "serial" },
                { value: "objTypeCode" }, { value: "objType" }
            ]
        });

        for (var i = 0; i < data.length; i++) {
            rows.push({
                cells: [
                    { value: data[i].id }, { value: data[i].objCode }, { value: data[i].objName }, { value: data[i].titleName }, { value: data[i].subjectType },
                    { value: data[i].caption }, { value: data[i].pathDoc }, { value: data[i].extDoc }, { value: data[i].fromPage }, { value: data[i].toPage },
                    { value: data[i].storedType }, { value: data[i].code }, { value: data[i].titleCode }, { value: data[i].subjectCode }, { value: data[i].serial },
                    { value: data[i].objTypeCode }, { value: data[i].objType }
                ]
            });
        }

        var workbook = new kendo.ooxml.Workbook({
            sheets: [
                {
                    columns: [
                        // Column settings (width)
                        { autoWidth: true }, { autoWidth: true }, { autoWidth: true }, { autoWidth: true }, { autoWidth: true },
                        { autoWidth: true }, { autoWidth: true }, { autoWidth: true }, { autoWidth: true }, { autoWidth: true },
                        { autoWidth: true }, { autoWidth: true }, { autoWidth: true }, { autoWidth: true }, { autoWidth: true },
                        { autoWidth: true }, { autoWidth: true }
                    ],
                    // Title of the sheet
                    title: "Orders",
                    // Rows of the sheet
                    rows: rows
                }
            ]
        });
        //save the file as Excel file with extension xlsx
        kendo.saveAs({ dataURI: workbook.toDataURL(), fileName: "Test.xlsx" });
    }

    $scope.exportAllToExcel = function () {
        exportToExcel(getDocuments());
    }

    $scope.exportToExcel = function () {
        exportToExcel(getDocuments(selectedLayerName));
    }

    function getDocuments(layerName) {
        var result = [];

        for (var i = 0; i < originalData.length; i++) {
            if (layerName && originalData[i].objType === layerName) {
                if ($scope.subjectFilter && originalData[i].subjectType.toLowerCase().indexOf($scope.subjectFilter.toLowerCase()) === -1) {
                    continue;
                }

                if ($scope.captionFilter && originalData[i].caption.toLowerCase().indexOf($scope.captionFilter.toLowerCase()) == -1) {
                    continue;
                }


                result.push(originalData[i]);
            }
        }

        return result;
    }

    $scope.launchDoc = function (relatedDocumentInfo) {
        relatedDocumentPresenter.launchApplication(relatedDocumentInfo);
    }

    relatedDocumentPresenter.launchApplication = function (relatedDocumentInfo) {
        try {

            var url = "exp:explorationdbs|pisdb||" +
                relatedDocumentInfo.pathDoc +
                "." +
                relatedDocumentInfo.extDoc.replace('0', '').trim() +
                "|-1|-1|first|0|0|Guest;" +
                relatedDocumentInfo.caption;

            window.open(url);

        } catch (e) {

            alert(e);
        }
    };

    //
    relatedDocumentPresenter.showRelatedDocuments = function (featureSet) {

        if (!featureSet || !featureSet.features || featureSet.features.length < 1) {
            return;
        }

        if (featureSet.features.properties) {

        }

        var tempObjectCode = "";

        for (var i = 0; i < featureSet.features.length; i++) {

            var objCode = featureSet.features[i].properties["ObjectCode"];

            if (objCode) {
                tempObjectCode = tempObjectCode + ";" + objCode;
            }
        }

        var objCodeArray = tempObjectCode.split(';');

        $.ajax({
            type: "POST",
            url: configPresenter.RelatedDocumentUrl,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            //data: JSON.stringify(['12345', '67890']),
            data: JSON.stringify(objCodeArray),
            success: function (collection) {
                var temp = collection ? collection.length : 34;

                relatedDocumentPresenter.update(collection);

                applicationPresenter.openRelatedDocumentDialog();
            }
        });

        // check if featureSet has objectCode field
        //
        // get objectCode from features and concatenate with ; (some features may already has multiple object codes concatenated with ;)
        //
        // check if length of concatenation result string is not empty
        //
        // split concatenation result string with ;
        //
        // send distinict array of objectCodes to the method to show related docs

    };
});