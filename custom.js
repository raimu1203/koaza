window.addEventListener('DOMContentLoaded', () => {
    // qgis2webの地図オブジェクト（map）が読み込まれるのを少しだけ待つ
    setTimeout(() => {
        // 地図オブジェクトが存在するか確認
        if (typeof map !== 'undefined') {
            // 地図に登録されているすべてのレイヤーを取得
            const layers = map.getLayers().getArray();

            layers.forEach((layer) => {
                // 💡 背景地図（OSMや地理院地図など）は透明にしたくないので除外する
                // 通常、背景地図は「ol.layer.Tile」という形式で作られています
                if (layer instanceof ol.layer.Tile) {
                    return; // 背景地図なら処理をスキップ
                }

                // それ以外の自前データ（VectorレイヤーやGroupレイヤー）の透明度を0.5にする
                if (typeof layer.setOpacity === 'function') {
                    layer.setOpacity(0.5);
                }
            });

            console.log("背景以外のすべてのレイヤーの透明度を0.5に変更しました。");
        } else {
            console.error("mapオブジェクトが見つかりません。読み込み順序を確認してください。");
        }
    }, 500); // 0.5秒（500ミリ秒）待ってから実行
});
