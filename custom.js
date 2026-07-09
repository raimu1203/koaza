window.addEventListener('DOMContentLoaded', () => {
    // 💡 設定：ラベルを強制出現させたい最低のズームレベル（これより拡大するとすべて表示）
    const MIN_ZOOM_FOR_LABEL = 14; 

    setTimeout(() => {
        if (typeof map === 'undefined') return;

        map.getLayers().forEach((layer) => {
            if (layer instanceof ol.layer.Tile) return;

            if (typeof layer.getStyle === 'function') {
                const originalStyle = layer.getStyle();
                if (!originalStyle) return;

                // 💡 地図を描画する関数を安全にラップ
                layer.setStyle(function(feature, resolution) {
                    let styles = (typeof originalStyle === 'function') 
                        ? originalStyle(feature, resolution) 
                        : originalStyle;

                    if (!styles) return styles;

                    const styleArray = Array.isArray(styles) ? styles : [styles];
                    const currentZoom = map.getView().getZoom();

                    // 💡 【超重要】元の設定を汚さないよう、すべて「コピー（clone）」して処理する
                    const newStyles = styleArray.map((style) => {
                        if (!style) return style;
                        
                        // スタイル全体を安全にコピー
                        const clonedStyle = style.clone();

                        // 1. 【透明度】塗りつぶし（Fill）の50%透明化処理
                        const fill = clonedStyle.getFill();
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

                        // 2. 【ラベル強制出現＆ズーム制御】
                        const textStyle = clonedStyle.getText();
                        if (textStyle) {
                            // 文字の設定も安全にコピー
                            const clonedText = textStyle.clone();

                            // 表示優先度を最高（無限大）にし、はみ出しを許可して強制出現させる
                            if (typeof clonedText.setPriority === 'function') {
                                clonedText.setPriority(Infinity);
                            }
                            if (typeof clonedText.setOverflow === 'function') {
                                clonedText.setOverflow(true);
                            }

                            // ズームレベルに応じて、コピーした文字をセットするか、空にするか切り替える
                            if (currentZoom >= MIN_ZOOM_FOR_LABEL) {
                                clonedStyle.setText(clonedText); // 強制出現
                            } else {
                                clonedStyle.setText(null); // 完全に非表示
                            }
                        }

                        return clonedStyle;
                    });

                    return newStyles; // 安全に作られたコピーの見た目を地図に返す
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

        // 初回起動時にも確実に適用
        map.getLayers().forEach((layer) => {
            if (!(layer instanceof ol.layer.Tile) && typeof layer.changed === 'function') {
                layer.changed();
            }
        });

        console.log("無限ループの原因を根本排除したクローンモードを適用しました。");
    }, 600);
});
