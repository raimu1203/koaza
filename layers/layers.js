var wms_layers = [];


        var lyr__0 = new ol.layer.Tile({
            'title': '国土地理院淡色地図',
            'opacity': 1.000000,
            
            
            source: new ol.source.XYZ({
            attributions: ' ',
                url: 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'
            })
        });
var format_sendaikoazamap_1 = new ol.format.GeoJSON();
var features_sendaikoazamap_1 = format_sendaikoazamap_1.readFeatures(json_sendaikoazamap_1, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_sendaikoazamap_1 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_sendaikoazamap_1.addFeatures(features_sendaikoazamap_1);
var lyr_sendaikoazamap_1 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_sendaikoazamap_1, 
                style: style_sendaikoazamap_1,
                popuplayertitle: 'sendai-koaza-map',
                interactive: true,
    title: 'sendai-koaza-map<br />\
    <img src="styles/legend/sendaikoazamap_1_0.png" /> 仙台<br />\
    <img src="styles/legend/sendaikoazamap_1_1.png" /> 南小泉<br />\
    <img src="styles/legend/sendaikoazamap_1_2.png" /> <br />' });
var format_sendaioazamap_2 = new ol.format.GeoJSON();
var features_sendaioazamap_2 = format_sendaioazamap_2.readFeatures(json_sendaioazamap_2, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_sendaioazamap_2 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_sendaioazamap_2.addFeatures(features_sendaioazamap_2);
var lyr_sendaioazamap_2 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_sendaioazamap_2, 
                style: style_sendaioazamap_2,
                popuplayertitle: 'sendai-oaza-map',
                interactive: false,
                title: '<img src="styles/legend/sendaioazamap_2.png" /> sendai-oaza-map'
            });

lyr__0.setVisible(true);lyr_sendaikoazamap_1.setVisible(true);lyr_sendaioazamap_2.setVisible(true);
var layersList = [lyr__0,lyr_sendaikoazamap_1,lyr_sendaioazamap_2];
lyr_sendaikoazamap_1.set('fieldAliases', {'大字': '大字', '小字': '小字', });
lyr_sendaioazamap_2.set('fieldAliases', {'大字': '大字', });
lyr_sendaikoazamap_1.set('fieldImages', {'大字': 'TextEdit', '小字': 'TextEdit', });
lyr_sendaioazamap_2.set('fieldImages', {'大字': 'TextEdit', });
lyr_sendaikoazamap_1.set('fieldLabels', {'大字': 'inline label - visible with data', '小字': 'inline label - always visible', });
lyr_sendaioazamap_2.set('fieldLabels', {'大字': 'no label', });
lyr_sendaioazamap_2.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});