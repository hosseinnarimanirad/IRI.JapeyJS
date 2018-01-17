IRI.Common.CoordinateSystem.UnitTest = (function () {


    function areNotEqual(p1, p2, precision = 7) {
        return (p1.x.toFixed(precision) !== p2.x.toFixed(precision)) || (p1.y.toFixed(precision) !== p2.y.toFixed(precision));
    }

    //**********************************************Ellipsoid Test************************************************
    var EllipsoidTest = (function () {
        if (IRI.Common.CoordinateSystem.Ellipsoids.WGS84.CalculateN(20).toFixed(7) !== 6380635.8071448.toFixed(7)) {
            throw "CoordinateSystemsUnitTest.js; ellipsoid test not passed; CalculateN ";
        }
        if (IRI.Common.CoordinateSystem.Ellipsoids.WGS84.CalculateM(20).toFixed(7) !== 6342888.482479.toFixed(7)) {
            throw "CoordinateSystemsUnitTest.js; ellipsoid test not passed; CalculateM ";
        }
    })()  ;

    //**********************************************MapProjects Test************************************************
    var MapProjectsTest = (function () {

        var report = [];

        var tempPoint = { x: 35.5, y: 41.4 };

        //Test Mercator ******************************************************************
        var mercatorPoint = IRI.Common.CoordinateSystem.MapProjects.GeodeticToMercator(tempPoint);

        if (areNotEqual(mercatorPoint, { x: 3951841.9231612119, y: 5043257.7295854408 })) {
            report.push("GeodeticToMercator Failed");
        }

        var geoPoint1 = IRI.Common.CoordinateSystem.MapProjects.MercatorToGeodetic(mercatorPoint);

        if (areNotEqual(tempPoint, geoPoint1)) {
            report.push("MercatorToGeodetic Failed");
        }

        //Test Web Mercator ******************************************************************
        var webMercator1 = IRI.Common.CoordinateSystem.MapProjects.GeodeticWgs84ToWebMercator(tempPoint);

        if (areNotEqual(webMercator1, { x: 3951841.9231612119, y: 5071521.8114256095 })) {
            report.push("GeodeticWgs84ToWebMercator Failed");
        }

        var geoPoint2 = IRI.Common.CoordinateSystem.MapProjects.WebMercatorToGeodeticWgs84(webMercator1);

        if (areNotEqual(tempPoint, geoPoint2)) {
            report.push("WebMercatorToGeodeticWgs84 Failed");
        }

        //Test Transverse Mercator
        var tmPoint = IRI.Common.CoordinateSystem.MapProjects.GeodeticToTransverseMercator(tempPoint);

        if (areNotEqual(tmPoint, { x: 2981854.9426911497, y: 5241550.3236432774 })) {
            report.push("GeodeticToTransverseMercator Failed");
        }

        var geoPoint3 = IRI.Common.CoordinateSystem.MapProjects.TransverseMercatorToGeodetic({ x: 4784423.44413792, y: 5380998.3709007753 });

        if (areNotEqual({ x: 46.434009140919741, y: 40.11077376413968 }, geoPoint3)) {
            report.push("TransverseMercatorToGeodetic Failed");
        }

        //Test UTM
        var tempUTMPoint = { x: 52.34, y: 35.0 };
        var utmPoint = IRI.Common.CoordinateSystem.MapProjects.GeodeticToUTM(tempUTMPoint);

        if (areNotEqual(utmPoint, { x: 622281.06269524235, y: 3873863.3207539795 })) {
            report.push("GeodeticToUTM Failed");
        }

        var geoPoint4 = IRI.Common.CoordinateSystem.MapProjects.UTMToGeodetic(utmPoint, 39);

        if (areNotEqual(tempUTMPoint, geoPoint4)) {
            report.push("UTMToGeodetic Failed");
        }

        //Test Cylindrical Equal-area
        var tempCEA = IRI.Common.CoordinateSystem.MapProjects.GeodeticToCylindricalEqualArea(tempPoint);

        var geoPoint5 = IRI.Common.CoordinateSystem.MapProjects.CylindricalEqualAreaToGeodetic(tempCEA);

        if (areNotEqual(tempPoint, geoPoint5)) {
            report.push("Cylindrical Equal-area Failed");
        }

        //Test Albers Equal Area Conic
        var phi1 = 29.5;     //Degree
        var phi2 = 45.5;     //Degree
        var phi0 = 23;       //Degree    
        var lambda0 = -96;   //Degree
        var phi = 35;        //Degree
        var lambda = -75;    //Degree
        var expectedResultForX = 1885472.7258135695;     //Meter
        var expectedResultForY = 1535925.0049833711;     //Meter

        var tempAEAC = IRI.Common.CoordinateSystem.MapProjects.GeodeticToAlbersEqualAreaConic({ x: lambda, y: phi }, lambda0, phi0, phi1, phi2, IRI.Common.CoordinateSystem.Ellipsoids.Clarke1866);

        if (areNotEqual(tempAEAC, { x: expectedResultForX, y: expectedResultForY })) {
            report.push("GeodeticToAlbersEqualAreaConic Failed");
        }

        var geoPoint6 = IRI.Common.CoordinateSystem.MapProjects.AlbersEqualAreaConicToGeodetic(tempAEAC, lambda0, phi0, phi1, phi2, IRI.Common.CoordinateSystem.Ellipsoids.Clarke1866);

        if (areNotEqual({ x: lambda, y: phi }, geoPoint6)) {
            report.push("Albers Equal Area Conic Failed");
        }

        if (report.length > 0) {
            throw report;
        }
    })();

    //**********************************************LCC Test********************************************************
    var LccTest = (function () {

        var report = [];

        var result = new IRI.Common.CoordinateSystem.LCC(IRI.Common.CoordinateSystem.Ellipsoids.Clarke1866, 33.0, 45.0, -96.0, 23.0).FromGeodetic({ x: -75.0, y: 35.0 });

        if (areNotEqual(result, { x: 1894410.9, y: 1564649.5 }, 1)) {
            report.push("LCC FromGeodetic 1 Failed");
        }

        //*******************************************************************************************************
        //********************************************* FromGeodetic ********************************************
        //Iran FromGeodetic
        result = new IRI.Common.CoordinateSystem.LCC(IRI.Common.CoordinateSystem.Ellipsoids.GRS80, 35, 65.0, 10.0, 52.0).FromGeodetic({ x: 53.0, y: 33.0 });

        if (areNotEqual({ x: result.x + 4000000, y: result.y + 2800000 }, { x: 7830046.77, y: 1879902.99 }, 1)) {
            report.push("LCC FromGeodetic 2 Failed");
        }

        //Canada FromGeodetic
        result = new IRI.Common.CoordinateSystem.LCC(IRI.Common.CoordinateSystem.Ellipsoids.GRS80, 35, 65.0, 10.0, 52.0).FromGeodetic({ x: -105, y: 54.0 });

        if (areNotEqual({ x: result.x + 4000000, y: result.y + 2800000 }, { x: -685838.46, y: 7633442.68 }, 1)) {
            report.push("LCC FromGeodetic 3 Failed");
        }

        //Brazil FromGeodetic
        result = new IRI.Common.CoordinateSystem.LCC(IRI.Common.CoordinateSystem.Ellipsoids.GRS80, 35, 65.0, 10.0, 52.0).FromGeodetic({ x: -53, y: -12.0 });

        if (areNotEqual({ x: result.x + 4000000, y: result.y + 2800000 }, { x: -5883916.57, y: -936363.79 }, 1)) {
            report.push("LCC FromGeodetic 4 Failed");
        }

        //Autralia FromGeodetic
        result = new IRI.Common.CoordinateSystem.LCC(IRI.Common.CoordinateSystem.Ellipsoids.GRS80, 35, 65.0, 10.0, 52.0).FromGeodetic({ x: 134, y: -23.0 });

        if (areNotEqual({ x: result.x + 4000000, y: result.y + 2800000 }, { x: 19245528.93, y: 9343431.52 }, 1)) {
            report.push("LCC FromGeodetic 5 Failed");
        }


        //*******************************************************************************************************
        //********************************************* ToGeodetic ********************************************
        result = new IRI.Common.CoordinateSystem.LCC(IRI.Common.CoordinateSystem.Ellipsoids.Clarke1866, 33, 45.0, -96.0, 23.0).ToGeodetic({ x: 1894410.9, y: 1564649.5 });

        if (areNotEqual(result, { x: -75.0, y: 35.0 }, 6)) {
            report.push("LCC ToGeodetic 1 Failed");
        }

        //China
        result = new IRI.Common.CoordinateSystem.LCC(IRI.Common.CoordinateSystem.Ellipsoids.GRS80, 35, 65.0, 10.0, 52.0).ToGeodetic({ x: 10000000 - 4000000, y: 4000000 - 2800000 });

        if (areNotEqual({ x: result.x, y: result.y }, { x: 85.22674468408002, y: 32.27382257394294 }, 7)) {
            report.push("LCC ToGeodetic 2 Failed");
        }

        //***************************************************************************************************************
        //********************************************* ToGeodetic Iterative ********************************************         
        result = new IRI.Common.CoordinateSystem.LCC(IRI.Common.CoordinateSystem.Ellipsoids.Clarke1866, 33, 45.0, -96.0, 23.0).ToGeodetic({ x: 1894410.9, y: 1564649.5 });

        if (areNotEqual(result, { x: -75.0, y: 35.0 }, 6)) {
            report.push("LCC ToGeodetic Iterative Failed");
        }

        if (report.length > 0) {
            throw report;
        }
    })();

    //**********************************************MapProjects Test************************************************
    var MapProjectsTest = (function () {

        var report = [];
        //***************************************************************************************************************
        var result = IRI.Common.CoordinateSystem.MapProjections.LccNiocWithClarcke1880Rgs.FromWgs84Geodetic({ x: 50.689721, y: 30.072906 });

        if (areNotEqual(result, { x: 2047473.33479, y: 912594.777238 }, 1)) {
            report.push("LCC NIOC  FromWgs84Geodetic Failed");
        }

        result = IRI.Common.CoordinateSystem.MapProjections.LccNiocWithClarcke1880Rgs.ToWgs84Geodetic({ x: 2047473.33479, y: 912594.777238 });

        if (areNotEqual(result, { x: 50.689721, y: 30.072906 }, 6)) {
            report.push("LCC NIOC ToWgs84Geodetic Failed");
        }

        if (report.length > 0) {
            throw report;
        }
    })();

    //**********************************************Transformation Test*********************************************
    var TransformationTest = (function () {

        var report = [];

        var wgsGeodeticPoint = { x: 51 + 22.0 / 60.0 + 12.72 / 3600.0, y: 29 + 14.0 / 60.0 + 14.68 / 3600.0 };
        var nahrawanGeodeticPoint = { x: 51 + 22.0 / 60.0 + 09.42 / 3600.0, y: 29 + 14.0 / 60.0 + 08.65 / 3600.0 };

        var result = IRI.Common.CoordinateSystem.Transformation.ChangeDatumSimple(wgsGeodeticPoint, IRI.Common.CoordinateSystem.Ellipsoids.WGS84, IRI.Common.CoordinateSystem.Ellipsoids.FD58);

        if (areNotEqual(nahrawanGeodeticPoint, result, 4)) {
            report.push("ChangeDatumSimple Failed");
        }

        if (report.length > 0) {
            throw report;
        }

    })();


})();