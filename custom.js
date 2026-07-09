window.addEventListener('DOMContentLoaded', () => {
    // qgis2webの地図オブジェクトが完成するのを少し待つ
    setTimeout(() => {
        if (typeof map !== 'undefined') {
            const layers = map.getLayers().getArray();

            layers.forEach((layer) => {
                // 背景地図はスキップ
                if (layer instanceof ol.layer.Tile) return;

                // ベクターレイヤー（自前データ）を対象にする
                if (layer instanceof ol.layer.Vector || (layer.getSource && layer.getSource())) {
                    
                    // レイヤーの元のスタイル関数を取得
                    const originalStyleFunc = layer.getStyleFunction();
                    if (!originalStyleFunc) return;

                    // 新しいスタイル関数を上書き定義する
                    layer.setStyle((feature, resolution) => {
                        // 元のスタイル（配列または単一オブジェクト）を取得
                        const styles = originalStyleFunc(feature, resolution);
                        if (!styles) return styles;

                        // ループ処理のために配列化する
                        const styleArray = Array.isArray(styles) ? styles : [styles];

                        styleArray.forEach((style) => {
                            // 💡 塗りつぶし（Fill）の設定がある場合のみ処理
                            const fill = style.getFill();
                            if (fill) {
                                let color = fill.getColor();
                                if (color) {
                                    // OpenLayersの色形式を判定して、透明度（アルファ値）を0.5に書き換える
                                    if (typeof color === 'string') {
                                        // もし文字列の色の場合はrgba形式に変換
                                        if (color.startsWith('#')) {
                                            // 簡易的なHexからRGBAへの変換
                                            const r = parseInt(color.slice(1, 3), 16);
                                            const g = parseInt(color.slice(3, 5), 16);
                                            const b = parseInt(color.slice(5, 7), 16);
                                            fill.setColor([r, g, b, 0.5]);
                                        }
                                    } else if (Array.isArray(color)) {
                                        // すでに [R, G, B, A] の配列なら、4番目のA（透明度）を0.5にする
                                        // [R, G, B] の3要素なら、4番目に0.5を追加する
                                        color[3] = 0.5;
                                        fill.setColor(color);
                                    }
                                }
                            }
                            // 💡 ここで境界線（stroke）やテキスト（text）には触れないため、
                            // それらは100%の濃さ（元の設定）のまま維持されます。
                        });

                        return styles;
                    });
                }
            });

            console.log("境界線とラベルを維持し、塗りつぶしだけを50%透明にしました。");
        }
    }, 600); // 念のため少し長めに待つ
});
