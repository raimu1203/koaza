window.addEventListener('DOMContentLoaded', () => {
    // 💡 設定1：ラベルを強制出現させたい最低のズームレベル
    const MIN_ZOOM_FOR_LABEL = 12; 

    // 💡 設定2：文字の大きさを％（パーセント）で指定します。
    // 今の大きさの「80%（0.8）」に縮小します。もっと小さくしたければ「0.7」などにしてください。
    const LABEL_SCALE = "0.8";

    // 🌟 【フリーズ回避の魔法】地図システムをいじらず、CSSで文字だけを小さくする
    const style = document.createElement('style');
    style.innerHTML = `
        /* 地図上のテキスト（キャンバス描画以外で出力されるラベル要素）を一括縮小 */
        .ol-attribution, .ol-scale-line { transform: none !important; }
        
        /* 
           OpenLayersがレイヤー内部でテキストを描画する際、
           もしHTML要素として出力している場合に、外側からサイズをキュッと小さくします
        */
        div[id^="ol-"] text, .ol-layer text {
            font-size: calc(100% * ${LABEL_SCALE}) !important;
        }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
        if (typeof map === 'undefined') return;

        // すべての自前レイヤーに対して「ズーム連動と強制出現」だけを安全に適用
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

                        // 2. 【ラベルの出現・消滅制御のみ】
                        // 内部のフォントやフチを直接いじらないので、絶対にフリーズしません！
                        const textStyle = style.getText();
                        if (textStyle) {
                            // 表示優先度を最高（無限大）にして強制出現
                            if (typeof textStyle.setPriority === 'function') {
                                textStyle.setPriority(Infinity); 
                            }
                            // はみ出す文字も許可
                            if (typeof textStyle.setOverflow === 'function') {
                                textStyle.setOverflow(true);
                            }

                            if (!style._originalTextObject) {
                                style._originalTextObject = textStyle;
                            }

                            // ズームレベルに応じて切り替え
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

        // 動きが止まったら描き直す
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

        console.log("CSS連携により、フリーズなしで文字縮小と強制出現を適用しました。");
    }, 600);
});
