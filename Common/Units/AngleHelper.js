IRI.Common.Units.AngleHelper = function () {

}

IRI.Common.Units.AngleHelper.ToMinus180to180Range = function (angleInDegree) {
    while (angleInDegree > 180) {
        angleInDegree = 360 - angleInDegree;
    }

    return angleInDegree;
}

IRI.Common.Units.AngleHelper.ToMinusPItoPIRange = function (angleInRadian){
    while (angleInRadian > Math.PI) {
        angleInRadian = 2 * Math.PI - angleInRadian;
    }

    return angleInRadian;
}

IRI.Common.Units.AngleHelper.DegreeToDms = function (angleInDegree) {
    var d = Math.floor(angleInDegree);
    var minfloat = (angleInDegree - d) * 60;
    var m = Math.floor(minfloat);
    var secfloat = (minfloat - m) * 60;
    //var s = Math.round(secfloat);
    // After rounding, the seconds might become 60. These two
    // if-tests are not necessary if no rounding is done.
    //if (s == 60) {
    //    m++;
    //    s = 0;
    //}
    //if (m == 60) {
    //    d++;
    //    m = 0;
    //}
    return ("" + d + "\xB0 " + m + "' " + secfloat.toFixed(1) +"\" ");
}