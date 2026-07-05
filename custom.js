lyr_map_1.setStyle(function(feature, resolution) {
    var color = feature.get('color'); // 属性に色がある場合

    return new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255,0,0,0.3)'  // ←ここを動的にしてもOK
        }),
        stroke: new ol.style.Stroke({
            color: 'rgba(255,0,0,1.0)',
            width: 1
        })
    });
});
