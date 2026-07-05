var originalStyle = lyr_map_1.getStyle();

lyr_map_1.setStyle(function(feature, resolution) {
    var style = originalStyle(feature, resolution);

    // 塗りだけ変更
    style.getFill().setColor('rgba(255,0,0,0.3)');

    return style;
});
