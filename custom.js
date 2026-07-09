// 💡 設定1：ラベルを強制出現させたい最低のズームレベル（12）
const MIN_ZOOM_FOR_LABEL = 12; 

// 💡 設定2：文字の大きさの倍率（0.5）
const LABEL_SCALE_RATIO = 2.0;

// 地図が完全に出来上がってから1回だけ安全に実行するためのフラグ
let isCustomStyleApplied = false;

function applyCustomMapSettings() {
    if (isCustomStyleApplied) return;
    if (typeof map === 'undefined') return;

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
                    // 1. 【透明度】塗りつぶし（Fill）だけを50%透明にする処理
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
                        // 文字の大きさ（倍率）を0.5に指定
                        if (typeof textStyle.setScale === 'function') {
                            textStyle.setScale(LABEL_SCALE_RATIO);
                        }

                        // 文字の配置を「中央揃え」にする
                        if (typeof textStyle.setTextAlign === 'function') {
                            textStyle.setTextAlign('center');
                        }

                        // 💡 【ここを追加】右寄りの原因である「ズレ（オフセット）」を完全に0にする
                        // X方向（横）もY方向（縦）もズレをゼロにすることで、文字のど真ん中がポリゴンの中心に重なります
                        if (typeof textStyle.setOffsetX === 'function') {
                            textStyle.setOffsetX(0);
                        }
                        if (typeof textStyle.setOffsetY === 'function') {
                            textStyle.setOffsetY(0);
                        }
                        
                        // 💡 【念のため追加】縦方向の基準位置も「真ん中（middle）」に揃える
                        if (typeof textStyle.setTextBaseline === 'function') {
                            textStyle.setTextBaseline('middle');
                        }

                        // 表示優先度を最高（無限大）にする
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

    // 拡大縮小の手が止まった瞬間に描き直す
    map.getView().on('moveend', () => {
        map.getLayers().forEach((layer) => {
            if (!(layer instanceof ol.layer.Tile) && typeof layer.changed === 'function') {
                layer.changed();
            }
        });
    });

    // 初回起動時にも描き直す
    map.getLayers().forEach((layer) => {
        if (!(layer instanceof ol.layer.Tile) && typeof layer.changed === 'function') {
            layer.changed();
        }
    });

    isCustomStyleApplied = true;
    console.log("配置のズレ（オフセット）をリセットし、完全中央揃えを適用しました。");
}

// 地図が「最初の描画」を終えた瞬間に実行
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof map !== 'undefined' && typeof map.on === 'function') {
            map.on('rendercomplete', applyCustomMapSettings);
        } else {
            setTimeout(applyCustomMapSettings, 1000);
        }
    }, 100);
});
