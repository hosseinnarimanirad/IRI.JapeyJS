function ArcGISServerHelper() {

}

ArcGISServerHelper.ParseArcGISServerLayersForToc = function (layers) {
    var source = Enumerable.From(layers);

    var subLayers = source.SelectMany(function (x) { return x.subLayers }).Select(function (x) { return x.id }).ToArray();

    for (var i = 0; i < layers.length; i++) {

        var tempArray = new Array(layers[i].subLayers.length);

        for (var s = 0; s < layers[i].subLayers.length; s++) {
            tempArray[s] = source.Single(function (x) { return x.id == layers[i].subLayers[s].id });
        }

        layers[i].SubItems = tempArray;
    }

    var result = new Array();

    for (var i = 0; i < layers.length; i++) {

        var isSublayer = false;

        for (var s = 0; s < subLayers.length; s++) {
            if (subLayers[s] == layers[i].id) {
                isSublayer = true;
            }
        }

        if (!isSublayer) {
            result.push(layers[i]);
        }
    }

    return result;
}
