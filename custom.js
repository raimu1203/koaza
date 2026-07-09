window.addEventListener('DOMContentLoaded', () => {
    // 地図が完全に出来上がるのを少し待つ（0.6秒）
    setTimeout(() => {
        if (typeof map === 'undefined') return;

        // 地図上のすべてのレイヤーをループ処理
        map.getLayers().forEach((layer) => {
            // 背景地図（Tileレイヤー）は処理をスキップ
            if (layer instanceof ol.layer.Tile) return;

            // ベクターレイヤー（自前データ）の場合のみ処理
            if (typeof layer.getStyle === 'function') {
                const originalStyle = layer.getStyle();
                if (!originalStyle) return;

                // スタイルを再定義する関数（スタイル関数）を設定
                layer.setStyle(function(feature, resolution) {
                    // QGIS側が設定した元のスタイルを呼び出す
                    // 元のスタイルが関数の場合と配列の場合の両方に対応
                    let styles = (typeof originalStyle === 'function') 
                        ? originalStyle(feature, resolution) 
                        : originalStyle;

                    if (!styles) return styles;

                    // 処理しやすいように配列に統一する
                    const styleArray = Array.isArray(styles) ? styles : [styles];

                    styleArray.forEach((style) => {
                        // 1. 塗りつぶし（Fill）だけを狙い撃ちして50%透明にする
                        const fill = style.getFill();
                        if (fill) {
                            let color = fill.getColor();
                            if (color && typeof color === 'string') {
                                // もし '#ff0000' のようなカラーコードなら、ol.color.asArray を使って安全にRGBAに変換
                                if (typeof ol !== 'undefined' && ol.color && ol.color.asArray) {
                                    let rgba = ol.color.asArray(color).slice();
                                    rgba[3] = 0.5; // 透明度を0.5にする
                                    fill.setColor(rgba);
                                }
                            } else if (Array.isArray(color)) {
                                // すでに配列 [R, G, B, A] の場合は、4番目のA（透明度）を0.5にする
                                let newColor = [...color];
                                newColor[3] = 0.5;
                                fill.setColor(newColor);
                            }
                        }

                        // 💡 ここがポイント：
                        // style.getStroke() や style.getText() には一切触れないため、
                        // 境界線の太さ・色、ラベルの文字は100%（元の濃さ）のまま完全に維持されます。
                    });

                    return styles;
                });
            }
        });

        console.log("境界線とラベルを維持し、塗りつぶしのみを半透明にしました。");
    }, 600);
});
