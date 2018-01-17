gotoModule.controller("gotoController", function ($rootScope, $scope, $http, scopeService) {

    $scope.coordinateList = [{ 'id': 1, 'title': "Geodetic (WGS84)" }, { 'id': 2, 'title': "Geodetic (Clarke 1880)" }, { 'id': 3, 'title': "UTM" }, { 'id': 4, 'title': "LCC NIOC" }];

    $scope.xValue = 0;

    $scope.yValue = 0;

    $scope.utmZone = 39;

    $scope.isUtmMode = false;

    $scope.goto = function () {

        var id = $("#gotoCombo").data("kendoDropDownList").value();

        var name = $("#gotoCombo").data("kendoDropDownList").text();

        var inputPoint = { x: parseFloat($scope.xValue), y: parseFloat($scope.yValue) };

        $scope.geodeticWgs84 = { x: 0, y: 0 };

        switch (id) {
            case "1":
                //Geodetic (WGS84)
                $scope.geodeticWgs84 = inputPoint;
                break;
            case "2":
                //Geodetic (Clarke 1880)
                $scope.geodeticWgs84 = IRI.Common.CoordinateSystem.Transformation.ChangeDatumSimple(inputPoint, IRI.Common.CoordinateSystem.Ellipsoids.Clarke1880Rgs, IRI.Common.CoordinateSystem.Ellipsoids.WGS84);
                break;

            case "3":
                //Geodetic (UTM)
                $scope.geodeticWgs84 = IRI.Common.CoordinateSystem.MapProjects.UTMToGeodetic(inputPoint, $scope.utmZone);
                break;
            case "4":
                //Geodetic (LCC NIOC)
                $scope.geodeticWgs84 = IRI.Common.CoordinateSystem.MapProjections.LccNiocWithClarcke1880Rgs.ToWgs84Geodetic(inputPoint);
                break;
            default:
                throw "exceptoin";
        }

        var webMercator = IRI.Common.CoordinateSystem.MapProjects.GeodeticWgs84ToWebMercator($scope.geodeticWgs84);

        mapPresenter.goto(webMercator);
        //$scope.geodeticClarke = IRI.Common.CoordinateSystem.Transformation.ChangeDatumSimple($scope.geodeticWgs84, IRI.Common.CoordinateSystem.Ellipsoids.WGS84, IRI.Common.CoordinateSystem.Ellipsoids.Clarke1880Rgs);

        //$scope.utm = IRI.Common.CoordinateSystem.MapProjects.GeodeticToUTM($scope.geodeticWgs84);

        //$scope.lccNioc = IRI.Common.CoordinateSystem.MapProjections.LccNiocWithClarcke1880Rgs.FromWgs84Geodetic($scope.geodeticWgs84);

    };

    $scope.options = {
        dataSource: $scope.coordinateList,
        dataTextField: "title",
        dataValueField: "id",

        change: function () {
            var id = $("#gotoCombo").data("kendoDropDownList").value();

            scopeService.safeApply($rootScope, function () {
                $scope.isUtmMode = (id == "3");
            });
        },
        filter: "contains",


    };

    $scope.zoneOptions = {
        dataSource: Array.apply(null, Array(60)).map(function (_, i) { return i; }),
        index: 39,
        change: function () {
            var id = $("#gotoZoneCombo").data("kendoDropDownList").value();

            scopeService.safeApply($rootScope, function () {
                $scope.utmZone = id;
            });
        },

    };
});