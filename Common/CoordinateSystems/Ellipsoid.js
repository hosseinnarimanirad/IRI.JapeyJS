IRI.Common.CoordinateSystem.Ellipsoid = function (name, semiMajorAxis, inverseFlattening, datumTranslation) {
    this.Name = name;

    this.SemiMajorAxis = semiMajorAxis;

    if (inverseFlattening === 0) {
        this.SemiMinorAxis = semiMajorAxis;
    }
    else {
        this.SemiMinorAxis = semiMajorAxis - semiMajorAxis / inverseFlattening;
    }

    this.FirstEccentricity = Math.sqrt((semiMajorAxis * semiMajorAxis - this.SemiMinorAxis * this.SemiMinorAxis)
        /
        (semiMajorAxis * semiMajorAxis));

    this.SecondEccentricity = Math.sqrt((semiMajorAxis * semiMajorAxis - this.SemiMinorAxis * this.SemiMinorAxis)
        /
        (this.SemiMinorAxis * this.SemiMinorAxis));

    if (!datumTranslation) {
        this.DatumTranslation = { x: 0, y: 0, z: 0 };
    } else {
        this.DatumTranslation = datumTranslation;
    }


    this.EsriName = "";
}

IRI.Common.CoordinateSystem.Ellipsoid.prototype = {
    SemiMajorAxis: undefined,
    SemiMinorAxis: undefined,
    Name: undefined,
    FirstEccentricity: undefined,
    SecondEccentricity: undefined,
    Flattening: function () { return ((this.SemiMajorAxis - this.SemiMinorAxis) / this.SemiMajorAxis); },
    InverseFlattening: function () { return (this.SemiMajorAxis / (this.SemiMajorAxis - this.SemiMinorAxis)); },
};

IRI.Common.CoordinateSystem.Ellipsoid.prototype.CalculateN = function (Latitude) {

    Latitude = IRI.Common.Units.AngleHelper.ToMinus180to180Range(Latitude);

    var sin = Math.sin(Latitude * Math.PI / 180);

    return (this.SemiMajorAxis
        /
        Math.sqrt(1 - this.FirstEccentricity * this.FirstEccentricity * sin * sin));
}

IRI.Common.CoordinateSystem.Ellipsoid.prototype.CalculateM = function (Latitude) {
    var sin = Math.sin(Latitude * Math.PI / 180);

    var result = (this.SemiMajorAxis * (1 - this.FirstEccentricity * this.FirstEccentricity)
        /
        Math.pow((1 - this.FirstEccentricity * this.FirstEccentricity * sin * sin), 3.0 / 2.0));

    return result;
}

IRI.Common.CoordinateSystem.Ellipsoid.prototype.AreTheSame = function (other) {
    return this.SemiMajorAxis === other.SemiMajorAxis && this.FirstEccentricity === other.FirstEccentricity;
}

IRI.Common.CoordinateSystem.Ellipsoid.prototype.Equals = function (obj) {
    return obj === this;
}



IRI.Common.CoordinateSystem.Ellipsoids = {

    Airy1830: new IRI.Common.CoordinateSystem.Ellipsoid("Airy 1830", 6377563.396, 299.3249646),

    ModifiedAiry: new IRI.Common.CoordinateSystem.Ellipsoid("Modified Airy", 6377340.189, 299.3249646),

    AustralianNational: new IRI.Common.CoordinateSystem.Ellipsoid("Australian National", 6378160.0, 298.25),

    Bessel1841Namibia: new IRI.Common.CoordinateSystem.Ellipsoid("Bessel 1841 (Namibia)", 6377483.865280418, 299.1528128),

    Bessel1841: new IRI.Common.CoordinateSystem.Ellipsoid("Bessel 1841", 6377397.155, 299.1528128),

    Clarke1866: new IRI.Common.CoordinateSystem.Ellipsoid("Clarke 1866", 6378206.4, 294.9786982),

    Clarke1880: new IRI.Common.CoordinateSystem.Ellipsoid("Clarke 1880", 6378249.144808011, 293.4663076556253),

    Clarke1880Rgs: new IRI.Common.CoordinateSystem.Ellipsoid("Clarke 1880 RGS", 6378249.145, 293.465),

    EverestSabahSarawak1967: new IRI.Common.CoordinateSystem.Ellipsoid("Everest (Sabah Sarawak) 1967", 6377298.556, 300.8017),

    EverestIndia1956: new IRI.Common.CoordinateSystem.Ellipsoid("Everest (India 1956)", 6377301.243, 300.8017),

    EverestMalaysia1969: new IRI.Common.CoordinateSystem.Ellipsoid("Everest (Malaysia 1969)", 6377295.664, 300.8017),

    EverestMalaySing1830: new IRI.Common.CoordinateSystem.Ellipsoid("Everest (Malay. & Sing)", 6377304.063, 300.8017),

    EverestPakistan: new IRI.Common.CoordinateSystem.Ellipsoid("Everest (Pakistan)", 6377309.613, 300.8017),

    ModifiedFischer1960: new IRI.Common.CoordinateSystem.Ellipsoid("Modified Fischer 1960", 6378155.0, 298.3),

    Helmert1906: new IRI.Common.CoordinateSystem.Ellipsoid("Helmert 1906", 6378200.0, 298.3),

    Hough1960: new IRI.Common.CoordinateSystem.Ellipsoid("Hough 1960", 6378270.0, 297.0),

    Indonesian1974: new IRI.Common.CoordinateSystem.Ellipsoid("Indonesian 1974", 6378160.0, 298.247),

    International1924: new IRI.Common.CoordinateSystem.Ellipsoid("International 1924", 6378388.0, 297),

    Krassovsky1940: new IRI.Common.CoordinateSystem.Ellipsoid("Krassovsky 1940", 6378245.0, 298.3),

    GRS80: new IRI.Common.CoordinateSystem.Ellipsoid("GRS 80", 6378137.0, 298.257222101),

    SouthAmerican1969: new IRI.Common.CoordinateSystem.Ellipsoid("South American 1969", 6378160.0, 298.25),

    WGS72: new IRI.Common.CoordinateSystem.Ellipsoid("WGS 72", 6378135.0, 298.26),

    WGS84: new IRI.Common.CoordinateSystem.Ellipsoid("WGS 84", 6378137.0, 298.257223563),

    FD58: new IRI.Common.CoordinateSystem.Ellipsoid("FD58", 6378249.145, 293.465, { x: -241.54, y: -163.64, z: 396.06 })
};

