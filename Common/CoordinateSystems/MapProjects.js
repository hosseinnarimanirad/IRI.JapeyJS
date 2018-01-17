/*eslint no-constant-condition: ["error", { "checkLoops": false }]*/

IRI.Common.CoordinateSystem.MapProjects = function () {

}


IRI.Common.CoordinateSystem.MapProjects._MaxConvertableToIsometricLatitude = 90;

//phi = 90 => q=271
IRI.Common.CoordinateSystem.MapProjects._MaxAllowableIsometricLatitude = 271;


IRI.Common.CoordinateSystem.MapProjects.GeodeticLatitudeToIsometricLatitude = function (latitude, firstEccentricity) {
    //Limit the latitude value
    if (Math.abs(latitude) > IRI.Common.CoordinateSystem.MapProjects._MaxConvertableToIsometricLatitude) {
        latitude = IRI.Common.CoordinateSystem.MapProjects._MaxConvertableToIsometricLatitude * (latitude < 0 ? -1 : 1);
    }

    var angleInRadian = latitude * Math.PI / 180.0;

    var eSin = firstEccentricity * Math.sin(angleInRadian);

    return Math.log(Math.tan(Math.PI / 4 + angleInRadian / 2.0) * Math.pow(((1 - eSin) / (1 + eSin)), firstEccentricity / 2.0)) * 180.0 / Math.PI;
}

IRI.Common.CoordinateSystem.MapProjects.GeodeticLatitudeArrayToIsometricLatitude = function (latitudes, firstEccentricity) {
    //phi must be in degree (Geodetic Latitude)
    //e=sqrt((a*a-b*b)/(a*a))

    var result = [];

    for (var i = 0; i < latitudes.length; i++) {
        result.push(IRI.Common.CoordinateSystem.MapProjects.GeodeticLatitudeToIsometricLatitude(latitudes[i], firstEccentricity));
    }

    return result;
}

IRI.Common.CoordinateSystem.MapProjects.IsometricLatitudeToGeodeticLatitude = function (isometricLatitude, e) {
    if (Math.abs(isometricLatitude) > IRI.Common.CoordinateSystem.MapProjects._MaxAllowableIsometricLatitude) {
        isometricLatitude = IRI.Common.CoordinateSystem.MapProjects._MaxAllowableIsometricLatitude * (isometricLatitude < 0 ? -1 : 1);
    }

    if (!isometricLatitude) {
        return NaN;
    }

    //'q must be in degree (Isometric Latitude)
    //'e=sqrt((a*a-b*b)/(a*a)):First Eccentricity of the Ellipsoid


    var tempQ = isometricLatitude * Math.PI / 180.0;

    var phi0 = 2 * Math.atan(Math.exp(tempQ)) - Math.PI / 2;

    var counter = 0;

    do {
        var sinOfphi0 = Math.sin(phi0);

        var f0 = 1.0 / 2.0 * (Math.log(1 + sinOfphi0) - Math.log(1 - sinOfphi0) + e * Math.log(1 - e * sinOfphi0) - e * Math.log(1 + e * sinOfphi0)) - tempQ;

        var f1 = (1 - e * e) / ((1 - e * e * sinOfphi0 * sinOfphi0) * Math.cos(phi0));

        var phi1 = phi0 - f0 / f1;

        counter++;

        if (Math.abs(phi0 - phi1) < 0.1E-13) {
            return phi1 * 180.0 / Math.PI;
        }
        else if (counter === 10) {
            throw "NotImplementedException at IsometricLatitudeToGeodeticLatitude";
        }
        else {
            phi0 = phi1;
        }
    } while (true)
}

IRI.Common.CoordinateSystem.MapProjects.IsometricLatitudeArrayToGeodeticLatitude = function (isometricLatitude, e) {
    //'q must be in degree (Isometric Latitude)
    //'e=sqrt((a*a-b*b)/(a*a)):First Eccentricity of the Ellipsoid

    for (var i = 0; i < isometricLatitude.length; i++) {
        isometricLatitude.push(IRI.Common.CoordinateSystem.MapProjects.IsometricLatitudeToGeodeticLatitude(isometricLatitude[i], e));
    }

    return isometricLatitude;
}

IRI.Common.CoordinateSystem.MapProjects.GetPrimeVerticalPlaneCurvatureRadius = function (a, e, latitude) {
    //latitude must be in degree

    var temp = Math.sin(latitude * Math.PI / 180.0);

    return a / Math.sqrt(1.0 - e * e * temp * temp);
}

IRI.Common.CoordinateSystem.MapProjects.GetMeridianCurvatureRadius = function (a, e, latitude) {
    //latitude must be in degree

    var temp01 = Math.sin(latitude * Math.PI / 180.0);

    var temp02 = 1.0 - e * e * temp01 * temp01;

    return (a * (1 - e * e)) / (temp02 * Math.sqrt(temp02));
}

IRI.Common.CoordinateSystem.MapProjects.FindZone = function (lambda) {
    if (lambda >= 0 && lambda <= 180.0) {
        return (30 + Math.ceil(lambda / 6));
    }
    else if (lambda > 180.0 && lambda <= 360) {
        return (Math.ceil(lambda / 6) - 30);
    }
    else {
        throw "NotImplementedException at FindZone";
    }

}

IRI.Common.CoordinateSystem.MapProjects.CalculateCentralMeridian = function (zone) {
    if (zone > 0 && zone <= 30) {
        return 180.0 + zone * 6 - 3;
    }
    else if (zone > 30 && zone <= 60) {
        return (zone - 30) * 6 - 3;
    }
    else {
        throw "NotImplementedException at CalculateCentralMeridian";
    }
}

IRI.Common.CoordinateSystem.MapProjects.CheckLongitude = function (centralLongitude, longitude) {
    for (var i = 0; i < longitude.length; i++) {
        if (Math.abs(centralLongitude - longitude[i]) > 3) {
            return false;
        }
    }

    return true;
}

//latitude must be in radian
IRI.Common.CoordinateSystem.MapProjects.CalculateM = function (e, latitude) {
    var sin = Math.sin(latitude);

    return Math.cos(latitude) / Math.sqrt(1 - e * e * sin * sin);
}

//latitude must be in radian
IRI.Common.CoordinateSystem.MapProjects.CalculateQ = function (e, latitude) {
    var sin = Math.sin(latitude);

    var eSin = e * sin;

    return (1 - e * e) * (sin / (1 - eSin * eSin) - Math.log((1 - eSin) / (1 + eSin)) / (2 * e));
}


//**********************************************MERCATOR************************************************
IRI.Common.CoordinateSystem.MapProjects.GeodeticToMercator = function (geodeticPoint, ellipsoid) {
    if (!ellipsoid) {
        ellipsoid = IRI.Common.CoordinateSystem.Ellipsoids.WGS84;
    }

    var q = IRI.Common.CoordinateSystem.MapProjects.GeodeticLatitudeToIsometricLatitude(geodeticPoint.y, ellipsoid.FirstEccentricity);

    return {
        x: ellipsoid.SemiMajorAxis * geodeticPoint.x * Math.PI / 180.0,
        y: ellipsoid.SemiMajorAxis * q * Math.PI / 180.0
    };
}

IRI.Common.CoordinateSystem.MapProjects.GeodeticArrayToMercator = function (geodeticPoints, ellipsoid) {
    var result = [];

    for (var i = 0; i < geodeticPoints.length; i++) {
        result.push(IRI.Common.CoordinateSystem.MapProjects.GeodeticToMercator(geodeticPoints[i], ellipsoid));
    }

    return result;
}


IRI.Common.CoordinateSystem.MapProjects.MercatorToGeodetic = function (mercatorPoint, ellipsoid) {
    if (!ellipsoid) {
        ellipsoid = IRI.Common.CoordinateSystem.Ellipsoids.WGS84;
    }

    var longitude = mercatorPoint.x / ellipsoid.SemiMajorAxis * 180.0 / Math.PI;

    var q = mercatorPoint.y / ellipsoid.SemiMajorAxis * 180.0 / Math.PI;

    var latitude = IRI.Common.CoordinateSystem.MapProjects.IsometricLatitudeToGeodeticLatitude(q, ellipsoid.FirstEccentricity);

    return { x: longitude, y: latitude };
}

IRI.Common.CoordinateSystem.MapProjects.MercatorArrayToGeodetic = function (mercatorPoints, ellipsoid) {
    var result = [];

    for (var i = 0; i < mercatorPoints.length; i++) {
        result.push(IRI.Common.CoordinateSystem.MapProjects.MercatorToGeodetic(mercatorPoints[i], ellipsoid));
    }

    return result;
}



//**********************************************WEB MERCATOR************************************************
IRI.Common.CoordinateSystem.MapProjects.GeodeticWgs84ToWebMercator = function (geodetic) {
    var a = IRI.Common.CoordinateSystem.Ellipsoids.WGS84.SemiMajorAxis;
    //var a = earthRadius;

    var x = a * geodetic.x * Math.PI / 180.0;

    var y = a * Math.log(Math.tan(Math.PI / 4.0 + geodetic.y / 2.0 * Math.PI / 180.0));

    return { x: x, y: y };
}

IRI.Common.CoordinateSystem.MapProjects.WebMercatorToMercatorWgs84 = function (webMercator) {

    var earthRadius = IRI.Common.CoordinateSystem.Ellipsoids.WGS84.SemiMajorAxis;

    var a = IRI.Common.CoordinateSystem.Ellipsoids.WGS84.SemiMajorAxis;

    var e = IRI.Common.CoordinateSystem.Ellipsoids.WGS84.FirstEccentricity;

    var x = a / earthRadius * webMercator.x;

    var tempY = e * Math.tanh(webMercator.y / a);

    var y = a / earthRadius * webMercator.y - a * e * (1.0 / 2.0) * Math.log((1 + tempY) / (1 - tempY));

    return { x: x, y: y };
}

IRI.Common.CoordinateSystem.MapProjects.WebMercatorToGeodeticWgs84 = function (webMercator) {
    return IRI.Common.CoordinateSystem.MapProjects.MercatorToGeodetic(
        IRI.Common.CoordinateSystem.MapProjects.WebMercatorToMercatorWgs84(webMercator));
}



//**********************************************Transverse Mercator************************************************
IRI.Common.CoordinateSystem.MapProjects.TMYTOGeodeticLatitude = function (y, ellipsoid) {
    if (!ellipsoid) {
        ellipsoid = IRI.Common.CoordinateSystem.Ellipsoids.WGS84;
    }

    var e2 = ellipsoid.FirstEccentricity * ellipsoid.FirstEccentricity;

    var a = ellipsoid.SemiMajorAxis;

    var A0 = 1.0 - 1.0 / 4.0 * e2 - 3.0 / 64.0 * e2 * e2 - 5.0 / 256.0 * Math.pow(e2, 3) - 175.0 / 16384.0 * Math.pow(e2, 4);

    var A2 = 3.0 / 8.0 * (e2 + e2 * e2 / 4.0 + 15.0 / 128.0 * Math.pow(e2, 3) - 455.0 / 4096.0 * Math.pow(e2, 4));

    var A4 = 15.0 / 256.0 * (e2 * e2 + 3.0 / 4.0 * Math.pow(e2, 3) - 77.0 / 128.0 * Math.pow(e2, 4));

    var A6 = 35.0 / 3072.0 * (Math.pow(e2, 3) - 41.0 / 32.0 * Math.pow(e2, 4));

    var A8 = -315.0 / 131072.0 * Math.pow(e2, 4);

    var result;

    var phi0 = y / a;

    var counter = 0;

    while (true) {
        var f0 = a * (A0 * phi0 - A2 * Math.sin(2 * phi0) + A4 * Math.sin(4 * phi0) - A6 * Math.sin(6 * phi0) + A8 * Math.sin(8 * phi0)) - y;

        var f1 = a * (A0 - 2 * A2 * Math.cos(2 * phi0) + 4 * A4 * Math.cos(4 * phi0) - 6 * A6 * Math.cos(6 * phi0) + 8 * A8 * Math.cos(8 * phi0));

        var phi1 = phi0 - f0 / f1;

        counter++;

        if (Math.abs(phi0 - phi1) < 0.1E-14) {
            result = phi1;

            break;
        }
        else if (counter === 10) {
            //throw "Calculating Latitude in TMYTOGeodeticLatitude results in NaN";

            return NaN;
        }
        else {
            phi0 = phi1;
        }
    }

    return result;
}

IRI.Common.CoordinateSystem.MapProjects.GeodeticToTransverseMercator = function (geodeticPoint, ellipsoid) {
    if (!ellipsoid) {
        ellipsoid = IRI.Common.CoordinateSystem.Ellipsoids.WGS84;
    }

    //'Phi : Geodetic Latitude, in degree
    //'Lambda : Geodeti Longitude in degree

    var a = ellipsoid.SemiMajorAxis;

    var b = ellipsoid.SemiMinorAxis;

    var e2 = (a * a - b * b) / (a * a);

    var A0 = 1.0 - 1.0 / 4.0 * e2 - 3.0 / 64.0 * e2 * e2 - 5.0 / 256.0 * Math.pow(e2, 3) - 175.0 / 16384.0 * Math.pow(e2, 4);

    var A2 = 3.0 / 8.0 * (e2 + e2 * e2 / 4.0 + 15.0 / 128.0 * Math.pow(e2, 3) - 455.0 / 4096.0 * Math.pow(e2, 4));

    var A4 = 15.0 / 256.0 * (e2 * e2 + 3.0 / 4.0 * Math.pow(e2, 3) - 77.0 / 128.0 * Math.pow(e2, 4));

    var A6 = 35.0 / 3072.0 * (Math.pow(e2, 3) - 41.0 / 32.0 * Math.pow(e2, 4));

    var A8 = -315.0 / 131072.0 * Math.pow(e2, 4);


    var N = ellipsoid.CalculateN(geodeticPoint.y);

    var p = geodeticPoint.y * Math.PI / 180.0;

    var l = geodeticPoint.x * Math.PI / 180.0;

    var t = Math.tan(p);

    var noo2 = (a * a - b * b) / (b * b) * Math.pow(Math.cos(p), 2.0);

    var CosineP = Math.cos(p);

    var SineP = Math.sin(p);

    var x = l * Math.cos(p) + Math.pow(l * CosineP, 3) / 6.0 * (1 - t * t + noo2);

    x = x + Math.pow(l * CosineP, 5) / 120.0 * (5 - 18 * t * t + Math.pow(t, 4) + 14 * noo2 - 58 * t * t * noo2
        + 13 * Math.pow(noo2, 2) + 4 * Math.pow(noo2, 3) - 64 * Math.pow(noo2, 2) * t * t - 24 * Math.pow(noo2, 3) * t * t);

    x = x + Math.pow(l * CosineP, 7) / 5040.0 * (61 - 479 * t * t + 179 * Math.pow(t, 4) - Math.pow(t, 6));

    x = x * N;

    var y = a * (A0 * p - A2 * Math.sin(2 * p) + A4 * Math.sin(4 * p) - A6 * Math.sin(6 * p) + A8 * Math.sin(8 * p));

    y = y / N + (l * l) / 2 * SineP * CosineP;

    y = y + Math.pow(l, 4) / 24.0 * SineP * Math.pow(CosineP, 3) * (5 - t * t + 9 * noo2 + 4 * noo2 * noo2);

    y = y + Math.pow(l, 6) / 720.0 * SineP * Math.pow(CosineP, 5) * (61 - 58 * t * t + Math.pow(t, 4) + 270 * noo2 - 330 * t * t * noo2
        + 445 * noo2 * noo2 + 324 * Math.pow(noo2, 3) - 680 * Math.pow(noo2, 2) * t * t + 88 * Math.pow(noo2, 4) - 600 * Math.pow(noo2, 3) * t * t - 192 * Math.pow(noo2, 4) * t * t);

    y = y + Math.pow(l, 8) / 40320.0 * SineP * Math.pow(CosineP, 7) * (1385 - 311 * t * t + 543 * Math.pow(t, 4) - Math.pow(t, 6));

    y = y * N;

    return { x: x, y: y };
}

IRI.Common.CoordinateSystem.MapProjects.TransverseMercatorToGeodetic = function (tmPoint, ellipsoid) {

    if (!ellipsoid) {
        ellipsoid = IRI.Common.CoordinateSystem.Ellipsoids.WGS84;
    }

    var a = ellipsoid.SemiMajorAxis;

    var b = ellipsoid.SemiMinorAxis;

    var e2 = (a * a - b * b) / (a * a);

    var ePrime2 = (a * a - b * b) / (b * b);

    var phiExpansionPoint = IRI.Common.CoordinateSystem.MapProjects.TMYTOGeodeticLatitude(tmPoint.y, ellipsoid);

    if (isNaN(phiExpansionPoint)) {
        return { x: NaN, y: NaN };
    }

    var N = ellipsoid.CalculateN(phiExpansionPoint * 180.0 / Math.PI);

    var M = ellipsoid.CalculateM(phiExpansionPoint * 180.0 / Math.PI);

    var t = Math.tan(phiExpansionPoint);

    var noo2 = ePrime2 * Math.pow(Math.cos(phiExpansionPoint), 2);

    var longitude = tmPoint.x / N - 1 / 6.0 * Math.pow((tmPoint.x / N), 3) * (1 + 2 * t * t + noo2);

    longitude = longitude + 1 / 120.0 * Math.pow(tmPoint.x / N, 5) * (5 + 6 * noo2 + 28 * t * t - 3 * Math.pow(noo2, 2)
        + 8 * t * t * noo2 + 24 * Math.pow(t, 4) - 4 * Math.pow(noo2, 3) + 4 * t * t * Math.pow(noo2, 2) + 24 * t * t * Math.pow(noo2, 3));

    longitude = longitude - 1 / 5040.0 * Math.pow(tmPoint.x / N, 7) * (61 + 662 * t * t + 1320 * Math.pow(t, 4) + 720 * Math.pow(t, 6));

    longitude = (longitude / Math.cos(phiExpansionPoint)) * 180 / Math.PI;


    var latitude = phiExpansionPoint - t * tmPoint.x * tmPoint.x / (2 * M * N);

    latitude = latitude + t * Math.pow(tmPoint.x, 4) / (24.0 * M * Math.pow(N, 3)) * (5 + 3 * t * t + noo2 - 4 * Math.pow(noo2, 2) - 9 * t * t * noo2);

    latitude = latitude - t * Math.pow(tmPoint.x, 6) / (720.0 * M * Math.pow(N, 5)) * (61 - 90 * t * t + 46 * noo2
        + 45 * Math.pow(t, 4) - 252 * t * t * noo2 - 3 * Math.pow(noo2, 2) + 100 * Math.pow(noo2, 3) - 66 * t * t * Math.pow(noo2, 2)
        - 90 * Math.pow(t, 4) * noo2 + 88 * Math.pow(noo2, 4) + 225 * Math.pow(t, 4) * Math.pow(noo2, 2) + 84 * t * t * Math.pow(noo2, 3) - 192 * t * t * Math.pow(noo2, 4));

    latitude = latitude + t * Math.pow(tmPoint.x, 8) / (40320.0 * M * Math.pow(N, 7)) * (1385 + 3633 * t * t + 4095 * Math.pow(t, 4) + 1575 * Math.pow(t, 6));

    latitude = latitude * 180 / Math.PI;

    return { x: longitude, y: latitude };
}



//**********************************************UTM************************************************
IRI.Common.CoordinateSystem.MapProjects.GeodeticToUTM = function (geodeticPoint, isNorthHemisphere, ellipsoid) {

    if (!ellipsoid) {
        ellipsoid = IRI.Common.CoordinateSystem.Ellipsoids.WGS84;
    }
    if (!isNorthHemisphere) {
        isNorthHemisphere = true;
    }

    var zone = IRI.Common.CoordinateSystem.MapProjects.FindZone(geodeticPoint.x);

    var centralMeredian = IRI.Common.CoordinateSystem.MapProjects.CalculateCentralMeridian(zone);

    var tempLongitude = geodeticPoint.x - centralMeredian;

    var result = IRI.Common.CoordinateSystem.MapProjects.GeodeticToTransverseMercator({ x: tempLongitude, y: geodeticPoint.y }, ellipsoid);

    return { x: result.x * 0.9996 + 500000, y: isNorthHemisphere ? result.y * 0.9996 : result.y * 0.9996 + 10000000 };
}

IRI.Common.CoordinateSystem.MapProjects.UTMToGeodetic = function (utmPoint, zone, ellipsoid) {

    var centralLongitude = IRI.Common.CoordinateSystem.MapProjects.CalculateCentralMeridian(zone);

    var tempX = 0;
    var tempY = 0;

    tempX = (utmPoint.x - 500000) / 0.9996;

    tempY = (utmPoint.y) / 0.9996;

    var result = IRI.Common.CoordinateSystem.MapProjects.TransverseMercatorToGeodetic({ x: tempX, y: tempY }, ellipsoid);

    result.x = result.x + centralLongitude;

    return result;
}



//*******************************Cylindrical Equal-area************************************************
IRI.Common.CoordinateSystem.MapProjects.IterativelyComputeLatitude = function (qC, e) {
    var phiC = Math.asin(qC / 2.0);

    var temp;

    do {
        var eSin = e * Math.sin(phiC);

        temp = (1 - eSin * eSin) * (1 - eSin * eSin) / (2 * Math.cos(phiC)) *
            (qC / (1 - e * e) - Math.sin(phiC) / (1 - eSin * eSin) + 1.0 / (2.0 * e) * Math.log((1.0 - eSin) / (1.0 + eSin)));

        phiC = phiC + temp;

    } while (Math.abs(temp) > 10E-10);

    return phiC;
}

IRI.Common.CoordinateSystem.MapProjects.GeodeticToCylindricalEqualArea = function (geodeticPoint, ellipsoid, centralLongitude = 0, standardLatitude = 0) {
    //'Phi : Geodetic Latitude, in degree
    //'Lambda : Geodetic Longitude in degree
    //centralLongitude: must be in degree

    if (!ellipsoid) {
        ellipsoid = IRI.Common.CoordinateSystem.Ellipsoids.WGS84;
    }

    var e = ellipsoid.FirstEccentricity;

    var phi0 = standardLatitude * Math.PI / 180.0;

    var k0 = Math.cos(phi0) / Math.sqrt(1 - e * e * Math.sin(phi0) * Math.sin(phi0));

    var eSin = e * Math.sin(geodeticPoint.y * Math.PI / 180.0);

    var q = (1.0 - e * e) * (
        Math.sin(geodeticPoint.y * Math.PI / 180.0) / (1.0 - eSin * eSin) -
        Math.log((1.0 - eSin) / (1.0 + eSin)) / (2.0 * e));

    return {
        x: ellipsoid.SemiMajorAxis * k0 * (geodeticPoint.x - centralLongitude) * Math.PI / 180.0,
        y: ellipsoid.SemiMajorAxis * q / (2.0 * k0)
    };
}

IRI.Common.CoordinateSystem.MapProjects.CylindricalEqualAreaToGeodetic = function (ceaPoint, ellipsoid, centeralLongitude = 0, standardLatitude = 0) {

    if (!ellipsoid) {
        ellipsoid = IRI.Common.CoordinateSystem.Ellipsoids.WGS84;
    }

    var e = ellipsoid.FirstEccentricity;

    var phi0 = standardLatitude * Math.PI / 180.0;

    var k0 = Math.cos(phi0) / Math.sqrt(1 - e * e * Math.sin(phi0) * Math.sin(phi0));

    var qAtPole = (1.0 - e * e) * (
        1.0 / (1.0 - e * e) -
        (1.0 / (2.0 * e)) *
        Math.log((1.0 - e) / (1.0 + e)));

    var longitude = centeralLongitude + (ceaPoint.x / (ellipsoid.SemiMajorAxis * k0)) * 180 / Math.PI;

    var beta = Math.asin(2 * ceaPoint.y * k0 / (ellipsoid.SemiMajorAxis * qAtPole));

    var deltaLambda = (centeralLongitude - longitude) * Math.PI / 180.0;

    var qC = qAtPole * Math.sin(beta);

    var latitude = IRI.Common.CoordinateSystem.MapProjects.IterativelyComputeLatitude(qC, e) * 180.0 / Math.PI;

    return { x: longitude, y: latitude };

}



//*******************************Albers Equal Area Conic************************************************
IRI.Common.CoordinateSystem.MapProjects.GeodeticToAlbersEqualAreaConic = function (
    geodeticPoint, centralLongitude, standardLatitude, firstParallel, secondParallel, ellipsoid) {

    if (!ellipsoid) {
        ellipsoid = IRI.Common.CoordinateSystem.Ellipsoids.WGS84;
    }

    var e = ellipsoid.FirstEccentricity;
    var phi1 = firstParallel * Math.PI / 180.0;
    var phi2 = secondParallel * Math.PI / 180.0;
    var phi0 = standardLatitude * Math.PI / 180.0;
    //double phi1 = firstParallel * Math.PI / 180.0;
    //double phi1 = firstParallel * Math.PI / 180.0;
    var calculateM = IRI.Common.CoordinateSystem.MapProjects.CalculateM;
    var calculateQ = IRI.Common.CoordinateSystem.MapProjects.CalculateQ;

    var n =
        (Math.pow(calculateM(e, phi1), 2) - Math.pow(calculateM(e, phi2), 2)) /
        (calculateQ(e, phi2) - calculateQ(e, phi1));

    var c = Math.pow(calculateM(e, phi1), 2) + n * calculateQ(e, phi1);

    var a = ellipsoid.SemiMajorAxis;

    var rho0 = a * Math.sqrt(c - n * calculateQ(e, phi0)) / n;
     
    var rho = a * Math.sqrt(c - n * calculateQ(e, geodeticPoint.y * Math.PI / 180.0)) / n;

    var theta = n * (geodeticPoint.x - centralLongitude) * Math.PI / 180.0;

    return { x: rho * Math.sin(theta), y: rho0 - rho * Math.cos(theta) };
}

IRI.Common.CoordinateSystem.MapProjects.AlbersEqualAreaConicToGeodetic = function (
    aeacPoint, centralLongitude, standardLatitude, firstParallel, secondParallel, ellipsoid) {

    if (!ellipsoid) {
        ellipsoid = IRI.Common.CoordinateSystem.Ellipsoids.WGS84;
    }

    var e = ellipsoid.FirstEccentricity;
    var phi1 = firstParallel * Math.PI / 180.0;
    var phi2 = secondParallel * Math.PI / 180.0;
    var phi0 = standardLatitude * Math.PI / 180.0;
    //double phi1 = firstParallel * Math.PI / 180.0;
    //double phi1 = firstParallel * Math.PI / 180.0;

    var calculateM = IRI.Common.CoordinateSystem.MapProjects.CalculateM;
    var calculateQ = IRI.Common.CoordinateSystem.MapProjects.CalculateQ;

    var n =
        (Math.pow(calculateM(e, phi1), 2) - Math.pow(calculateM(e, phi2), 2)) /
        (calculateQ(e, phi2) - calculateQ(e, phi1));

    var c = Math.pow(calculateM(e, phi1), 2) + n * calculateQ(e, phi1);

    var a = ellipsoid.SemiMajorAxis;

    var rho0 = a * Math.sqrt(c - n * calculateQ(e, phi0)) / n;
     
    var theta = Math.atan(aeacPoint.x / (rho0 - aeacPoint.y));

    var rho = Math.sqrt(aeacPoint.x * aeacPoint.x + (rho0 - aeacPoint.y) * (rho0 - aeacPoint.y));

    var q = (c - rho * rho * n * n / (a * a)) / n;

    var longitude = centralLongitude + (theta / n) * 180.0 / Math.PI;
    var latitude = IRI.Common.CoordinateSystem.MapProjects.IterativelyComputeLatitude(q, e) * 180.0 / Math.PI;

    return { x: longitude, y: latitude };
}


