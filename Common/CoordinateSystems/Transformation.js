IRI.Common.CoordinateSystem.Transformation = function () {

}

IRI.Common.CoordinateSystem.Transformation.allowedDifference = 0.00001;

IRI.Common.CoordinateSystem.Transformation.ToCartesian = function (geodeticPoint, ellipsoid) {

    var scale = Math.PI / 180.0;

    var phi = geodeticPoint.y * scale;

    var lambda = geodeticPoint.x * scale;

    var cosPhi = Math.cos(phi);

    var sinPhi = Math.sin(phi);

    var cosLambda = Math.cos(lambda);

    var sinLambda = Math.sin(lambda);

    var N = ellipsoid.CalculateN(geodeticPoint.y);

    var x = ellipsoid.DatumTranslation.x + N * cosPhi * cosLambda;

    var y = ellipsoid.DatumTranslation.y + N * cosPhi * sinLambda;

    var z = ellipsoid.DatumTranslation.z + N * ellipsoid.SemiMinorAxis * ellipsoid.SemiMinorAxis / (ellipsoid.SemiMajorAxis * ellipsoid.SemiMajorAxis) * sinPhi;

    return { x: x, y: y, z: z };
}

IRI.Common.CoordinateSystem.Transformation.ToGeodetic = function (cartesianPoint, ellipsoid) {

    var tempSemiMajor = ellipsoid.SemiMajorAxis;

    var tempSemiMinor = ellipsoid.SemiMinorAxis;

    var e2TempValue = ellipsoid.FirstEccentricity * ellipsoid.FirstEccentricity;

    var tempX = cartesianPoint.x - ellipsoid.DatumTranslation.x;

    var tempY = cartesianPoint.y - ellipsoid.DatumTranslation.y;

    var tempZ = cartesianPoint.z - ellipsoid.DatumTranslation.z;

    var pTempValue = Math.sqrt(tempX * tempX + tempY * tempY);

    var nTempValue = ellipsoid.SemiMajorAxis;

    var hTempValue1 = Math.sqrt(tempX * tempX + tempY * tempY + tempZ * tempZ)
        -
        Math.sqrt(tempSemiMajor * tempSemiMinor);

    var latitudeTempValue1 = Math.atan(tempZ / pTempValue *
        1.0 / (1 - (e2TempValue * nTempValue) / (nTempValue + hTempValue1)));

    if (isNaN(latitudeTempValue1)) {

        return { x: 0, y: 0 };
    }

    var hTempValue2 = 0, latitudeTempValue2 = 0;

    var conditionValue = true;

    do {

        nTempValue = ellipsoid.CalculateN(latitudeTempValue1 * 180.0 / Math.PI);

        hTempValue2 = pTempValue / Math.cos(latitudeTempValue1) - nTempValue;

        latitudeTempValue2 = Math.atan(tempZ / pTempValue *
            1.0 / (1 - (e2TempValue * nTempValue) / (nTempValue + hTempValue2)));

        if (Math.abs(hTempValue2 - hTempValue1) + Math.abs(latitudeTempValue2 - latitudeTempValue1) < IRI.Common.CoordinateSystem.Transformation.allowedDifference) {
            //if (true) {
            conditionValue = false;
        }
        else {
            hTempValue1 = hTempValue2;

            latitudeTempValue1 = latitudeTempValue2;
        }

    } while (conditionValue);

    return { x: Math.atan2(tempY, tempX) * 180.0 / Math.PI, y: latitudeTempValue2 * 180.0 / Math.PI };
}

IRI.Common.CoordinateSystem.Transformation.ChangeDatumSimple = function (geodeticPoint, sourceDatum, destinationDatum) {

    var cartesian = IRI.Common.CoordinateSystem.Transformation.ToCartesian(geodeticPoint, sourceDatum);

    return IRI.Common.CoordinateSystem.Transformation.ToGeodetic(cartesian, destinationDatum);
}

 