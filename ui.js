$("#lengthslider").slider({
    range: "min",
    value: 1,
    step: 1,
    min: 0,
    max: 1000,
    slide: function(event, ui) {
        $("input").val("$" + ui.value);
    }
});

$("input").change(function() {
    var value = this.value.substring(1);
    $("#lengthslider").slider("value", parseInt(value));
});

$("#widthslider").slider({
    range: "min",
    value: 1,
    step: 1,
    min: 0,
    max: 1000,
    slide: function(event, ui) {
        $("widthinput").val("$" + ui.value);
    }
});

$("widthinput").change(function() {
    var value = this.value.substring(1);
    $("#widthslider").slider("value", parseInt(value));
});

$("#heightslider").slider({
    range: "min",
    value: 1,
    step: 1,
    min: 0,
    max: 1000,
    slide: function(event, ui) {
        $("heightinput").val("$" + ui.value);
    }
});

$("heightinput").change(function() {
    var value = this.value.substring(1);
    $("#heightslider").slider("value", parseInt(value));
});