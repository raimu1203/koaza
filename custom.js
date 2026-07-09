window.addEventListener('DOMContentLoaded', () => {
    // 💡 設定1：ラベルを強制出現させたい最低のズームレベル
    const MIN_ZOOM_FOR_LABEL = 12; 

    // 💡 設定2：ラベルの文字の大きさ（少し小さめの10px）
    const LABEL_FONT_SIZE = "10px sans-serif";

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
                        // 1. 【透明度】塗りつぶし（Fill）の50%透明化処理（維持）
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
                            // 💡 文字の大きさを強制指定
                            if (typeof textStyle.setFont === 'function') {
                                textStyle.setFont(LABEL_FONT_SIZE);
                            }

                            // 💡 【ここを追加】文字の周りの「フチ取り（ハロー）」も一緒に細くする
                            // 文字を小さくしても、フチが太いままだと文字が潰れて大きさが変わって見えません
                            const stroke = textStyle.getStroke();
                            if (stroke && typeof stroke.setWidth === 'function') {
                                // 1ピクセル〜1.5ピクセル程度の細さに強制的に絞ります
                                stroke.setWidth(1.2); 
                            }

                            // 表示優先度を最高（無限大）にして強制出現
                            if (typeof textStyle.setPriority === 'function') {
                                textStyle.setPriority(Infinity); 
                            }
                            // はみ出す文字も許可
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

        map.getView().on('moveend', () => {
            map.getLayers().forEach((layer) => {
                if (!(layer instanceof ol.layer.Tile) && typeof layer.changed === 'function') {
                    layer.changed();
                }
            });
        });

        map.getLayers().forEach((layer) => {
            if (!(layer instanceof ol.layer.Tile) && typeof layer.changed === 'function') {
                layer.changed();
            }
        });

        console.log("文字サイズとフチ取りの太さを連動して縮小しました。");
    }, 600);
});
