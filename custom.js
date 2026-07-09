window.addEventListener('DOMContentLoaded', () => {
    // 💡 設定：ラベルを強制出現させたい最低のズームレベル（これより拡大するとすべて表示）
    const MIN_ZOOM_FOR_LABEL = 13; 

    setTimeout(() => {
        if (typeof map === 'undefined') return;

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

                        // 2. 【ラベル強制出現】
                        const textStyle = style.getText();
                        if (textStyle) {
                            // 💡 決定打：OpenLayersの自動間引き機能を完全に無効化する
                            // これを true にすることで、重なりを無視して100%強制表示します
                            if (typeof textStyle.setOverflow === 'function') {
                                textStyle.setOverflow(true);
                            }

                            // 初回読み込み時に、元のテキスト設定を安全に記憶（バックアップ）
                            if (!style._originalTextObject) {
                                style._originalTextObject = textStyle;
                            }

                            // ズームレベルに応じて「出現」か「消滅」かをパチッと切り替える
                            if (currentZoom >= MIN_ZOOM_FOR_LABEL) {
                                // 指定ズーム以上なら、100%強制出現
                                style.setText(style._originalTextObject);
                            } else {
                                // 指定ズーム未満なら、完全に非表示
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

        // 初回起動時にも強制描画
        map.getLayers().forEach((layer) => {
            if (!(layer instanceof ol.layer.Tile) && typeof layer.changed === 'function') {
                layer.changed();
            }
        });

        console.log("ラベルの重なり自動消去を無効化し、強制出現モードを適用しました。");
    }, 600);
});
