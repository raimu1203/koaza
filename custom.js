window.addEventListener('DOMContentLoaded', () => {
    // 💡 設定：ラベルを表示させたい最低のズームレベル
    const MIN_ZOOM_FOR_LABEL = 12; 

    setTimeout(() => {
        if (typeof map === 'undefined') return;

        // 【機能1】塗りつぶし（Fill）だけを50%透明にする（一回だけ実行）
        map.getLayers().forEach((layer) => {
            if (layer instanceof ol.layer.Tile) return;

            if (typeof layer.getStyle === 'function') {
                const originalStyle = layer.getStyle();
                if (!originalStyle) return;

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
        });

        // 💡 【機能2】ラベルの表示・非表示を切り替える安全な関数
        function updateLabelVisibility() {
            const currentZoom = map.getView().getZoom();
            
            map.getLayers().forEach((layer) => {
                if (layer instanceof ol.layer.Tile) return;

                // レイヤー自体の「最大・最小の表示解像度（Min/Max Resolution）」をハックする
                // これにより、OpenLayersの標準機能として安全に表示・非表示を切り替えます
                if (typeof layer.setMinResolution === 'function') {
                    if (currentZoom >= MIN_ZOOM_FOR_LABEL) {
                        // 拡大時は制限なし（ラベルを表示）
                        layer.setMinResolution(0);
                    } else {
                        // 縮小時は、このレイヤー自体の描画を一時的に見えなくする
                        // （※もしポリゴン自体も消えてしまう場合は、別の対策をします）
                        layer.setMinResolution(0.0001); 
                    }
                }
            });
        }

        // 地図の拡大縮小の「アニメーションが終わった瞬間」にだけ実行する（無限ループが起きない）
        map.getView().on('moveend', updateLabelVisibility);
        
        // 初回読み込み時にも一度実行
        updateLabelVisibility();

        console.log("無限ループを回避した安全なズーム制御を適用しました。");
    }, 600);
});
