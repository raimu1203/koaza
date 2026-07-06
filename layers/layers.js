var wms_layers = [];


        var lyr__0 = new ol.layer.Tile({
            'title': '国土地理院淡色地図',
            'opacity': 1.000000,
            
            
            source: new ol.source.XYZ({
            attributions: ' ',
                url: 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'
            })
        });
var format_Sendai_Koaza_Map_1 = new ol.format.GeoJSON();
var features_Sendai_Koaza_Map_1 = format_Sendai_Koaza_Map_1.readFeatures(json_Sendai_Koaza_Map_1, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Sendai_Koaza_Map_1 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Sendai_Koaza_Map_1.addFeatures(features_Sendai_Koaza_Map_1);
var lyr_Sendai_Koaza_Map_1 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_Sendai_Koaza_Map_1, 
                style: style_Sendai_Koaza_Map_1,
                popuplayertitle: 'Sendai_Koaza_Map',
                interactive: true,
    title: 'Sendai_Koaza_Map<br />\
    <img src="styles/legend/Sendai_Koaza_Map_1_0.png" /> 仙台<br />\
    <img src="styles/legend/Sendai_Koaza_Map_1_1.png" /> 南小泉<br />\
    <img src="styles/legend/Sendai_Koaza_Map_1_2.png" /> <br />' });
var format_Sendai_Oaza_Map_2 = new ol.format.GeoJSON();
var features_Sendai_Oaza_Map_2 = format_Sendai_Oaza_Map_2.readFeatures(json_Sendai_Oaza_Map_2, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Sendai_Oaza_Map_2 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Sendai_Oaza_Map_2.addFeatures(features_Sendai_Oaza_Map_2);
var lyr_Sendai_Oaza_Map_2 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_Sendai_Oaza_Map_2, 
                style: style_Sendai_Oaza_Map_2,
                popuplayertitle: 'Sendai_Oaza_Map',
                interactive: false,
                title: '<img src="styles/legend/Sendai_Oaza_Map_2.png" /> Sendai_Oaza_Map'
            });

lyr__0.setVisible(true);lyr_Sendai_Koaza_Map_1.setVisible(true);lyr_Sendai_Oaza_Map_2.setVisible(true);
var layersList = [lyr__0,lyr_Sendai_Koaza_Map_1,lyr_Sendai_Oaza_Map_2];
lyr_Sendai_Koaza_Map_1.set('fieldAliases', {'大字': '大字', '小字': '小字', });
lyr_Sendai_Oaza_Map_2.set('fieldAliases', {'大字': '大字', });
lyr_Sendai_Koaza_Map_1.set('fieldImages', {'大字': 'TextEdit', '小字': 'TextEdit', });
lyr_Sendai_Oaza_Map_2.set('fieldImages', {'大字': 'TextEdit', });
lyr_Sendai_Koaza_Map_1.set('fieldLabels', {'大字': 'inline label - visible with data', '小字': 'inline label - always visible', });
lyr_Sendai_Oaza_Map_2.set('fieldLabels', {'大字': 'no label', });
lyr_Sendai_Oaza_Map_2.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});