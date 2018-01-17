
var WktHelper = {
    Parse: function (input) {
        if (input.trim().startsWith("POINT")) {
            var startIndex = input.indexOf("(") + 1;
            var endIndex = input.indexOf(")");
            return input.substring(startIndex, endIndex);
        }
        else {
            return "asdf;";
        }
    }
};
console.clear();
console.log(WktHelper.Parse("POINT (5413724.0966 3685839.2764)"));
