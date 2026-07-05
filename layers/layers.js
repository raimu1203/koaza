var wms_layers = [];


        var lyr__0 = new ol.layer.Tile({
            'title': '国土地理院淡色地図',
            'opacity': 1.000000,
            
            
            source: new ol.source.XYZ({
            attributions: ' ',
                url: 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'
            })
        });
var format_map_1 = new ol.format.GeoJSON();
var features_map_1 = format_map_1.readFeatures(json_map_1, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_map_1 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_map_1.addFeatures(features_map_1);
var lyr_map_1 = new ol.layer.Vector({
                declutter: false,
                source:jsonSource_map_1, 
                style: style_map_1,
                popuplayertitle: '旧仙台市町丁map',
                interactive: true,
    title: '旧仙台市町丁map<br />\
    <img src="styles/legend/map_1_0.png" /> 仙台<br />\
    <img src="styles/legend/map_1_1.png" /> 南小泉<br />\
    <img src="styles/legend/map_1_2.png" /> <br />' });

lyr__0.setVisible(true);lyr_map_1.setVisible(true);
var layersList = [lyr__0,lyr_map_1];
lyr_map_1.set('fieldAliases', {'大字': '大字', '小字': '小字', });
lyr_map_1.set('fieldImages', {'大字': 'TextEdit', '小字': 'TextEdit', });
lyr_map_1.set('fieldLabels', {'大字': 'inline label - visible with data', '小字': 'inline label - always visible', });
lyr_map_1.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});