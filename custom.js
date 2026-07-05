lyr_map_1.setStyle(function(feature, resolution) {

    console.log(feature.getProperties());
    
    return new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255,0,0,0.3)'
        }),
        stroke: new ol.style.Stroke({
            color: 'rgba(255,0,0,1.0)',
            width: 1
        }),
        text: new ol.style.Text({
            text: feature.get('小字'),  // ←ここに表示したい属性名
            font: '12px sans-serif',
            fill: new ol.style.Fill({
                color: '#000'
            }),
            stroke: new ol.style.Stroke({
                color: '#fff',
                width: 3
            })
        })
    });
});
