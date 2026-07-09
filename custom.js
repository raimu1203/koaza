window.addEventListener('DOMContentLoaded', () => {
    // 💡 設定：ラベルを表示させたい最低のズームレベル（これより拡大すると出現）
    const MIN_ZOOM_FOR_LABEL = 12; 

    setTimeout(() => {
        if (typeof map === 'undefined') return;

        // ズームレベルをOpenLayersの「解像度（Resolution）」に変換する関数
        // （OpenLayersは内部的にズームではなく解像度で表示制限をかけるため）
        function zoomToResolution(zoom) {
            const view = map.getView();
            // 現在の地図の最大解像度から逆算して、指定ズームの解像度を割り出す
            const maxResolution = view.getProjection().getExtent() ? 
                (ol.extent.getWidth(view.getProjection().getExtent()) / 256) : 156543.03392804097;
            return maxResolution / Math.pow(2, zoom);
        }

        // ラベルを隠す境界線となる解像度を計算
        const labelThresholdResolution = zoomToResolution(MIN_ZOOM_FOR_LABEL);

        map.getLayers().forEach((layer) => {
            // 背景地図（Tileレイヤー）は無視
            if (layer instanceof ol.layer.Tile) return;

            // 1. 【既存の機能】塗りつぶし（Fill）だけを50%透明にする処理
            if (typeof layer.getStyle === 'function') {
                const originalStyle = layer.getStyle();
                if (originalStyle) {
                    layer.setStyle(function(feature, resolution) {
                        let styles = (typeof originalStyle === 'function') ? originalStyle(feature, resolution) : originalStyle;
                        if (!styles) return styles;

                        const styleArray = Array.isArray(styles) ? styles : [styles];
                        styleArray.forEach((style) => {
                            const fill = style.getFill();
                            if (fill) {
                                let color = fill.getColor();
                                if (color && typeof color === 'string') {
                                    if (typeof ol !== 'undefined' && ol.color && ol.color.asArray) {
                                        let rgba = ol.color.asArray(color).slice();
                                        rgba[3] = 0.5;
                                        fill.setColor(rgba);
                                    }
                                } else if (Array.isArray(color)) {
                                    let newColor = [...color];
                                    newColor[3] = 0.5;
                                    fill.setColor(newColor);
                                }
                            }
                        });
                        return styles;
                    });
                }
            }

            // 2. 【ラベル制御の修正】
            // qgis2webが生成したレイヤーのソースコードやプロパティを確認し、
            // ラベル表示用の設定を持っているレイヤー（またはスタイル関数内を解析）を特定します
            let hasLabel = false;
            
            // レイヤーのプロパティ（QGISが出力した設定）に「label」という文字が含まれるかチェック
            const props = layer.getProperties ? layer.getProperties() : {};
            for (let key in props) {
                if (key.toLowerCase().includes('label')) {
                    hasLabel = true;
                    break;
                }
            }

            // あるいは、スタイル関数内にテキスト設定が存在するか直接チェック
            if (typeof layer.getStyle === 'function' && layer.getStyle()) {
                const testStyle = typeof layer.getStyle() === 'function' ? layer.getStyle()(null, 1) : layer.getStyle();
                const testArray = Array.isArray(testStyle) ? testStyle : [testStyle];
                if (testArray.some(s => s && s.getText && s.getText())) {
                    hasLabel = true;
                }
            }

            // 💡 ラベルを持っている（または関連する）レイヤーだった場合、
            // OpenLayers公式の「解像度制限機能」を使って、一定以上縮小されたら非表示にする
            if (hasLabel && typeof layer.setMaxResolution === 'function') {
                // 設定したズームレベル未満（＝解像度が閾値より大きい）になったら、
                // レイヤーごと非表示にする命令をセット
                layer.setMaxResolution(labelThresholdResolution);
            }
        });

        // 地図を一度強制的にリフレッシュして設定を反映
        map.render();
        
        console.log("レイヤー単位での安全なズーム連動ラベル制御を適用しました。");
    }, 600);
});
