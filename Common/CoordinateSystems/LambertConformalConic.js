IRI.Common.CoordinateSystem.LCC = function (ellipsoid, standardParallel1, standardParallel2, centralMeridian, latitudeOfOrigin, falseEasting = 0, falseNorthing = 0, scaleFactor = 1.0) {
    this._ellipsoid = ellipsoid;

    this._latitudeOfOrigin = latitudeOfOrigin;

    this._standardParallel1 = standardParallel1;

    this._standardParallel2 = standardParallel2;

    this._centralMeridian = centralMeridian;

    this._falseEasting = falseEasting;

    this._falseNorthing = falseNorthing;

    this._scaleFactor = scaleFactor;

    //private method
    function GeodeticLatitudeToT(latitude, firstEccentricity) {
        //Limit the latitude value
        if (Math.abs(latitude) > IRI.Common.CoordinateSystem.MapProjects._MaxConvertableToIsometricLatitude) {
            latitude = IRI.Common.CoordinateSystem.MapProjects._MaxConvertableToIsometricLatitude * (latitude < 0 ? -1 : 1);
        }

        var angleInRadian = latitude * Math.PI / 180;

        var eSin = firstEccentricity * Math.sin(angleInRadian);

        return Math.tan(Math.PI / 4.0 - angleInRadian / 2.0) / Math.pow(((1 - eSin) / (1 + eSin)), firstEccentricity / 2.0);
    }


    //this.scaleFactor = 1;
    var m1 = IRI.Common.CoordinateSystem.MapProjects.CalculateM(ellipsoid.FirstEccentricity, standardParallel1 * Math.PI / 180.0);
    var m2 = IRI.Common.CoordinateSystem.MapProjects.CalculateM(ellipsoid.FirstEccentricity, standardParallel2 * Math.PI / 180.0);

    var t0 = GeodeticLatitudeToT(latitudeOfOrigin, ellipsoid.FirstEccentricity);
    var t1 = GeodeticLatitudeToT(standardParallel1, ellipsoid.FirstEccentricity);
    var t2 = GeodeticLatitudeToT(standardParallel2, ellipsoid.FirstEccentricity);

    this.n = (Math.log(m1) - Math.log(m2)) / (Math.log(t1) - Math.log(t2));

    this.F = m1 / (this.n * Math.pow(t1, this.n));

    this.rho0 = this._scaleFactor * ellipsoid.SemiMajorAxis * this.F * Math.pow(t0, this.n);


    //public method
    this.LCCToGeodeticIterative = function (lccPoint) {
        var x = lccPoint.x - this._falseEasting;
        var y = lccPoint.y - this._falseNorthing;
        var a = this._ellipsoid.SemiMajorAxis;
        var e = this._ellipsoid.FirstEccentricity;

        var rho = Math.sqrt(x * x + (this.rho0 - y) * (this.rho0 - y));

        var t = Math.pow(rho / (this._scaleFactor * a * this.F), 1.0 / this.n) * ((this.n > 0) ? 1 : -1);

        var zeta = Math.PI / 2.0 - 2.0 * Math.atan(t);

        var teta = Math.atan(x / (this.rho0 - y));

        var lambda = (teta / this.n) * 180.0 / Math.PI + this._centralMeridian;

        var tempPhi = Math.PI / 2.0 - 2 * Math.atan(t);

        var phi;

        var counter = 0;

        do {
            phi = tempPhi;

            var eSin = e * Math.sin(phi);

            tempPhi = Math.PI / 2.0 - 2 * Math.atan(t * Math.pow((1 - eSin) / (1 + eSin), e / 2.0));

            counter++;

            if (counter > 10) {
                throw new NotImplementedException();
            }

        } while ((tempPhi - phi) > 1E-10);

        phi = phi * 180.0 / Math.PI;

        return new { x: lambda, y: phi };
    }


    //public method
    this.ToGeodetic = function (lccPoint) {
        var x = lccPoint.x - this._falseEasting;
        var y = lccPoint.y - this._falseNorthing;
        var a = this._ellipsoid.SemiMajorAxis;
        var e = this._ellipsoid.FirstEccentricity;

        var rho = Math.sqrt(x * x + (this.rho0 - y) * (this.rho0 - y)) * ((this.n > 0) ? 1 : -1);

        var t = Math.pow(rho / (this._scaleFactor * a * this.F), 1.0 / this.n);

        var zeta = Math.PI / 2.0 - 2.0 * Math.atan(t);

        //Here x is deltaY and (this.rho0 - y) is deltaX
        var teta = Math.atan2(x, (this.rho0 - y));

        var lambda = (teta / this.n) * 180.0 / Math.PI + this._centralMeridian;

        var e2 = e * e;
        var e4 = e2 * e2;
        var e6 = e4 * e2;
        var e8 = e4 * e4;

        var phi = zeta +
            (e * e / 2.0 + 5 * e4 / 24.0 + e6 / 12.0 + 13 * e8 / 360.0) * Math.sin(2 * zeta) +
            (7.0 * e4 / 48.0 + 29.0 * e6 / 240.0 + 811.0 * e8 / 11520.0) * Math.sin(4 * zeta) +
            (7.0 * e6 / 120.0 + 81.0 * e8 / 1120) * Math.sin(6 * zeta) +
            (4279 * e8 / 161280.0) * Math.sin(8 * zeta);

        return { x: lambda, y: phi * 180.0 / Math.PI };
    }

    //public method
    this.FromGeodetic = function (geodeticPoint) {
        var a = this._ellipsoid.SemiMajorAxis;

        var e = this._ellipsoid.FirstEccentricity;

        var rho = this._scaleFactor * a * this.F * Math.pow(GeodeticLatitudeToT(geodeticPoint.y, e), this.n);

        var theta = this.n * (geodeticPoint.x - this._centralMeridian) * Math.PI / 180.0;

        var x = rho * Math.sin(theta) + this._falseEasting;

        var y = this.rho0 - rho * Math.cos(theta) + this._falseNorthing;

        return { x: x, y: y };
    }

    this.FromSourceEllipsoid = function (point, sourceEllipsoid) {
        if (sourceEllipsoid !== this._ellipsoid ||
            sourceEllipsoid.SemiMajorAxis !== this._ellipsoid.SemiMajorAxis ||
            sourceEllipsoid.InverseFlattening() !== this._ellipsoid.InverseFlattening()) {
            return IRI.Common.CoordinateSystem.Transformation.ChangeDatumSimple(point, sourceEllipsoid, this._ellipsoid);
        }
        else {
            return point;
        }
    }

    this.ToTargetEllipsoid = function (point, sourceEllipsoid) {
        if (sourceEllipsoid !== this._ellipsoid ||
            sourceEllipsoid.SemiMajorAxis !== this._ellipsoid.SemiMajorAxis ||
            sourceEllipsoid.InverseFlattening() !== this._ellipsoid.InverseFlattening()) {
            return IRI.Common.CoordinateSystem.Transformation.ChangeDatumSimple(point, this._ellipsoid, sourceEllipsoid);
        }
        else {
            return point;
        }
    }

    this.FromWgs84Geodetic = function (point) {
        var temp = this.FromSourceEllipsoid(point, IRI.Common.CoordinateSystem.Ellipsoids.WGS84);

        return this.FromGeodetic(temp);
    }

    this.ToWgs84Geodetic = function (point, targetEllipsoid) {
        var temp = this.ToGeodetic(point);

        return this.ToTargetEllipsoid(temp, IRI.Common.CoordinateSystem.Ellipsoids.WGS84);
    }

}

 
