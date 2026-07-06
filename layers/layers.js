var wms_layers = [];


        var lyr__0 = new ol.layer.Tile({
            'title': '国土地理院淡色地図',
            'opacity': 1.000000,
            
            
            source: new ol.source.XYZ({
            attributions: ' ',
                url: 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'
            })
        });
var format__1 = new ol.format.GeoJSON();
var features__1 = format__1.readFeatures(json__1, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource__1 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource__1.addFeatures(features__1);
var lyr__1 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource__1, 
                style: style__1,
                popuplayertitle: '仙台市小字地図',
                interactive: true,
    title: '仙台市小字地図<br />\
    <img src="styles/legend/_1_0.png" /> 仙台<br />\
    <img src="styles/legend/_1_1.png" /> 南小泉<br />\
    <img src="styles/legend/_1_2.png" /> <br />' });
var format__2 = new ol.format.GeoJSON();
var features__2 = format__2.readFeatures(json__2, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource__2 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource__2.addFeatures(features__2);
var lyr__2 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource__2, 
                style: style__2,
                popuplayertitle: '仙台市大字地図',
                interactive: false,
                title: '<img src="styles/legend/_2.png" /> 仙台市大字地図'
            });

lyr__0.setVisible(true);lyr__1.setVisible(true);lyr__2.setVisible(true);
var layersList = [lyr__0,lyr__1,lyr__2];
lyr__1.set('fieldAliases', {'大字': '大字', '小字': '小字', });
lyr__2.set('fieldAliases', {'大字': '大字', });
lyr__1.set('fieldImages', {'大字': 'TextEdit', '小字': 'TextEdit', });
lyr__2.set('fieldImages', {'大字': 'TextEdit', });
lyr__1.set('fieldLabels', {'大字': 'inline label - visible with data', '小字': 'inline label - always visible', });
lyr__2.set('fieldLabels', {'大字': 'no label', });
lyr__2.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});