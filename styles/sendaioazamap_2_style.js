var size = 0;
var placement = 'point';

var style_sendaioazamap_2 = function(feature, resolution){
    var context = {
        feature: feature,
        variables: {}
    };
    
    var labelText = ""; 
    var value = feature.get("");
    var labelFont = "19.5px \'游明朝 Demibold\', sans-serif";
    var labelFill = "#0000ff";
    var bufferColor = "";
    var bufferWidth = 0;
    var textAlign = 'left';
    var offsetX = 8;
    var offsetY = 3;
    var overflow = false;
    var repeat = 0;
    var placement = 'point';
    if (feature.get("大字") !== null) {
        labelText = String(feature.get("大字"));
    }
    var style = [ new ol.style.Style({
        stroke: new ol.style.Stroke({color: 'rgba(0,0,255,1.0)', lineDash: null, lineCap: 'square', lineJoin: 'bevel', width: 1.9}),
        text: createTextStyle(feature, resolution, labelText, labelFont,
                              labelFill, placement, bufferColor,
                              bufferWidth, textAlign, offsetX, offsetY, overflow, repeat)
    })];

    return style;
};
