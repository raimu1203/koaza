lyr_map_1.setStyle(function(feature, resolution) {
    return new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255,0,0,0.3)'
        }),
        stroke: new ol.style.Stroke({
            color: 'rgba(255,0,0,1.0)',
            width: 1
        })
    });
});
