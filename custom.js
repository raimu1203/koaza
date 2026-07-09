window.addEventListener('DOMContentLoaded', () => {
    // 💡 設定：ラベルを表示させたい最低のズームレベル（これより拡大すると表示）
    // 好みに応じて 14 や 16 などに書き換えてください
    const MIN_ZOOM_FOR_LABEL = 15; 

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
                        // 1. 【既存の機能】塗りつぶし（Fill）だけを50%透明にする
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

                        // 2. 【改善版】ズームレベルに応じてラベルの「オブジェクト自体」を切り替える
                        // 初回実行時に、元のテキストデザインを安全な場所に隠して記憶（バックアップ）する
                        if (style.getText() && !style._originalTextObject) {
                            style._originalTextObject = style.getText();
                        }

                        // バックアップがある場合のみ処理
                        if (style._originalTextObject) {
                            if (currentZoom >= MIN_ZOOM_FOR_LABEL) {
                                // 指定ズーム以上なら、記憶しておいた文字デザインをセットして「表示」
                                style.setText(style._originalTextObject);
                            } else {
                                // 指定ズーム未満なら、テキストを空っぽ（null）にして完全に「非表示」
                                style.setText(null);
                            }
                        }
                    });

                    return styles;
                });
            }
        });

        // ズームが変わったときに地図を再描画させて上記の設定をリアルタイムに反映する
        map.getView().on('change:resolution', () => {
            map.getLayers().forEach((layer) => {
                if (!(layer instanceof ol.layer.Tile) && typeof layer.changed === 'function') {
                    layer.changed();
                }
            });
        });

        console.log("安全な方法でズーム連動ラベル制御を適応しました。");
    }, 600);
});
