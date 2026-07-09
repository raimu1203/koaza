window.addEventListener('DOMContentLoaded', () => {
    // 💡 設定：ラベルを表示させたい最低のズームレベル（これより拡大すると表示）
    // QGISの地図の細かさに合わせて 「14」や「16」などに自由に調整してください
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
                    
                    // 💡 現在の地図のズームレベルを取得する
                    const currentZoom = map.getView().getZoom();

                    styleArray.forEach((style) => {
                        // 【既存の機能】塗りつぶし（Fill）だけを50%透明にする
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

                        // 💡 【新しい機能】ズームレベルに応じてラベル（Text）を制御する
                        const textStyle = style.getText();
                        if (textStyle) {
                            if (currentZoom >= MIN_ZOOM_FOR_LABEL) {
                                // 設定したズームレベル以上（拡大）なら、文字色を「元の色」に戻して表示
                                // （元の色が取得できない場合は安全のため黒 [#000000] にします）
                                if (textStyle._originalFillColor) {
                                    textStyle.getFill().setColor(textStyle._originalFillColor);
                                }
                                if (textStyle._originalStrokeColor && textStyle.getStroke()) {
                                    textStyle.getStroke().setColor(textStyle._originalStrokeColor);
                                }
                            } else {
                                // 設定したズームレベル未満（縮小）なら、文字と輪郭の色を「完全に透明」にして隠す
                                // 隠す前に、元の色を記憶しておく（バックアップ）
                                if (textStyle.getFill() && !textStyle._originalFillColor) {
                                    textStyle._originalFillColor = textStyle.getFill().getColor();
                                }
                                if (textStyle.getStroke() && !textStyle._originalStrokeColor) {
                                    textStyle._originalStrokeColor = textStyle.getStroke().getColor();
                                }

                                // 完全に透明（RGBAの最後を0）にする
                                if (textStyle.getFill()) textStyle.getFill().setColor([0, 0, 0, 0]);
                                if (textStyle.getStroke()) textStyle.getStroke().setColor([0, 0, 0, 0]);
                            }
                        }
                    });

                    return styles;
                });
            }
        });

        // 💡 画面を拡大縮小（ズーム変更）した時にも、リアルタイムに表示を切り替える設定
        map.getView().on('change:resolution', () => {
            // 地図を描き直させることで、上のsetStyleの中身を再実行させる
            map.getLayers().forEach((layer) => {
                if (!(layer instanceof ol.layer.Tile) && typeof layer.changed === 'function') {
                    layer.changed();
                }
            });
        });

        console.log("塗りつぶし透明化と、ズーム連動ラベル制御を適応しました。");
    }, 600);
});
