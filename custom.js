window.addEventListener('DOMContentLoaded', () => {
    // 💡 設定：ラベルを表示させたい最低のズームレベル（これより拡大すると表示）
    // 地図の初期表示に合わせて 14 や 16 などに調整してください
    const MIN_ZOOM_FOR_LABEL = 15; 

    setTimeout(() => {
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
                    
                    // 💡 現在の正確なズームレベルを取得
                    const currentZoom = map.getView().getZoom();

                    styleArray.forEach((style) => {
                        // 1. 【透明度】塗りつぶし（Fill）だけを50%透明にする
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

                        // 2. 【ラベル制御】初回の読み込み時に、元のテキスト設定を安全に記憶（バックアップ）
                        if (style.getText() && !style._originalTextObject) {
                            style._originalTextObject = style.getText();
                        }

                        // バックアップがある場合のみ、ズームに応じてテキスト自体を切り替える
                        if (style._originalTextObject) {
                            if (currentZoom >= MIN_ZOOM_FOR_LABEL) {
                                // 指定したズーム以上（拡大）ならラベルを表示
                                style.setText(style._originalTextObject);
                            } else {
                                // 指定したズーム未満（縮小）ならラベルを完全に消去
                                style.setText(null);
                            }
                        }
                    });

                    return styles;
                });
            }
        });

        // 💡 【重要】無限ループを完全に防ぎつつ、ラベルを切り替えるイベント
        // 拡大縮小の「最中」ではなく、「終わった瞬間（moveend）」にだけ、
        // 1回だけパチッと地図を描き直させてラベルの表示・非表示を確定させます。
        map.getView().on('moveend', () => {
            map.getLayers().forEach((layer) => {
                if (!(layer instanceof ol.layer.Tile) && typeof layer.changed === 'function') {
                    layer.changed(); // これで上のsetStyleが1回だけ再実行されます
                }
            });
        });

        // 初回読み込み時にも一度だけ描き直してラベルの状態を正しくする
        map.getLayers().forEach((layer) => {
            if (!(layer instanceof ol.layer.Tile) && typeof layer.changed === 'function') {
                layer.changed();
            }
        });

        console.log("無限ループを回避し、ズーム連動ラベル制御を完全に適用しました。");
    }, 600);
});
