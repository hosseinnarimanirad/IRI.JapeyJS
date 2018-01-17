function ArrayHelper() {

};

ArrayHelper.Exists = function (array, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == value) {
            return true;
        }
    }
    return false;
};

ArrayHelper.Remove = function (array, value) {
    for (var i = array.length - 1; i >= 0; i--) {
        if (array[i] == value) {
            array.splice(i, 1);
        }
    }
};

ArrayHelper.RemoveAt = function (array, index) {
    if (array && index > -1 && index < array.length) {
        array.splice(index, 1);
    }
}

ArrayHelper.Add = function (array, value) {
    array.push(value);
}


ArrayHelper.Last = function (array) {
    return array[array.length - 1];
}

ArrayHelper.Distinct = function (array) {
    return array.filter(function (item, position) { return array.indexOf(item) == position; });
}


