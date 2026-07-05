var originalStyle = lyr_map_1.getStyle();

lyr_map_1.setStyle(function(feature, resolution) {
    var style = originalStyle(feature, resolution);

    // 配列で返ってくる場合があるので対応
    if (Array.isArray(style)) {
        style.forEach(function(s) {
            if (s.getFill()) {
                s.getFill().setColor('rgba(255,0,0,0.3)');
            }
        });
    } else {
        if (style.getFill()) {
            style.getFill().setColor('rgba(255,0,0,0.3)');
        }
    }

    return style;
});
