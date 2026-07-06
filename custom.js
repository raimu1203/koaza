// ページが完全に読み込まれた後に実行する
window.addEventListener('DOMContentLoaded', () => {
    // 💡 2行目の「lyr_1」の「1」の部分は、先ほどリネームしたファイル名（1.js）に対応しています
    if (typeof lyr__1 !== 'undefined') {
        // 透明度を 0.5 (50%) に設定する
        lyr__1.setOpacity(0.5);
        console.log("レイヤー1の透明度を0.5に変更しました。");
    } else {
        console.error("lyr_1 が見つかりませんでした。layers.js内の変数名を確認してください。");
    }
});
