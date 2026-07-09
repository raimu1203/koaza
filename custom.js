window.addEventListener('DOMContentLoaded', () => {
    // 💡 設定：ラベルを表示させたい最低のズームレベル（これより拡大するとすべて表示）
    const MIN_ZOOM_FOR_LABEL = 13; 

    setTimeout(() => {
        if (typeof map === 'undefined') return;

        // 💡 【超重要】custom.js から地図全体の「自動間引き機能（declutter）」を強制的に OFF にする
        // これにより、QGIS側の制限を無視して、重なる文字もすべて表示する準備が整います
        if (map.declutter_) {
            map.declutter_ = null; 
        }

        // すべての自前レイヤーに対してスタイルを設定
        map.getLayers().forEach((layer) => {
            if (layer instanceof ol.layer.Tile) return;

            if (typeof layer.getStyle === 'function') {
                const originalStyle = layer.getStyle();
                if (!originalStyle) return;

                layer.setStyle(function(feature, resolution) {
                    let styles = (typeof originalStyle === 'function') 
                        ? originalStyle(feature, resolution) 
                        : originalStyle;

                    if (!styles) return styles;

                    const styleArray = Array.isArray(styles) ? styles : [styles];
                    const currentZoom = map.getView().getZoom();

                    styleArray.forEach((style) => {
                        // 1. 【透明度】塗りつぶし（Fill）だけを50%透明にする処理（維持）
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

                        // 2. 【ラベル制御】
                        const textStyle = style.getText();
                        if (textStyle) {
                            // はみ出している文字も強制表示させる設定
                            if (typeof textStyle.setOverflow === 'function') {
                                textStyle.setOverflow(true);
                            }

                            // 元のテキスト設定を安全に記憶（バックアップ）
                            if (!style._originalTextObject) {
                                style._originalTextObject = textStyle;
                            }

                            // ズームレベルに応じて「出現」か「消滅」かを切り替える
                            if (currentZoom >= MIN_ZOOM_FOR_LABEL) {
                                style.setText(style._originalTextObject);
                            } else {
                                style.setText(null);
                            }
                        }
                    });

                    return styles;
                });
            }
        });

        // 拡大縮小の手が止まった瞬間に、地図を1回だけ描き直してラベルの状態を確定させる
        map.getView().on('moveend', () => {
            map.getLayers().forEach((layer) => {
                if (!(layer instanceof ol.layer.Tile) && typeof layer.changed === 'function') {
                    layer.changed();
                }
            });
        });

        // 初回起動時にも一度だけ描き直してラベルの状態を正しくする
        map.getLayers().forEach((layer) => {
            if (!(layer instanceof ol.layer.Tile) && typeof layer.changed === 'function') {
                layer.changed();
            }
        });

        console.log("custom.js のみで自動間引きを解除し、強制出現モードを適用しました。");
    }, 600);
});
