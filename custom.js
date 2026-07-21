// 💡 設定1：ラベルを強制出現させたい最低のズームレベル（12）
const MIN_ZOOM_FOR_LABEL = 12; 

// 💡 設定2：文字の大きさの倍率（好みのサイズに調整してください）
const LABEL_SCALE_RATIO = 0.8;

// 💡 設定3：ヘッダーに表示するテキストの設定
const HEADER_TITLE = "仙台市小字地図"; // 左側に表示するタイトル（大きく表示）
const HEADER_TWITTER = "X(Twitter): @raimu_sendai"; // 右側に表示するアカウント表記

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
                        if (typeof textStyle.setScale === 'function') {
                            textStyle.setScale(LABEL_SCALE_RATIO);
                        }

                        // 文字の配置を「中央揃え」にする
                        if (typeof textStyle.setTextAlign === 'function') {
                            textStyle.setTextAlign('center');
                        }

                        // 右寄りの原因である「ズレ（オフセット）」を完全に0にする
                        if (typeof textStyle.setOffsetX === 'function') {
                            textStyle.setOffsetX(0);
                        }
                        if (typeof textStyle.setOffsetY === 'function') {
                            textStyle.setOffsetY(0);
                        }
                        
                        // 縦方向の基準位置も「真ん中」に揃える
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
    console.log("地図の各種カスタムとヘッダーの生成を完了しました。");
}

// 🌟 上部ヘッダーを作成して画面に設置する関数
function createTopHeader() {
    if (document.getElementById('custom-map-header')) return;

    // ヘッダー要素の作成
    const header = document.createElement('div');
    header.id = 'custom-map-header';

    // ヘッダーの装飾・スタイリング（半透明の白、最前面に固定表示など）
    header.style.position = 'fixed';
    header.style.top = '0';
    header.style.left = '0';
    header.style.width = '100%';
    header.style.height = '50px';
    header.style.backgroundColor = 'rgba(255, 255, 255, 0.85)'; // 半透明の白（85%不透明度）
    header.style.backdropFilter = 'blur(5px)'; // 背景にすりガラスのようなぼかし
    header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.15)'; // 下側に薄い影
    header.style.zIndex = '9999'; // 地図の操作ボタン等より常に前面に表示
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.padding = '0 20px';
    header.style.boxSizing = 'border-box';
    header.style.pointerEvents = 'auto'; // ヘッダー上のクリックなどを有効化
    header.style.fontFamily = 'sans-serif';

    // 左側：仙台市小字地図（大・24px）
    const leftText = document.createElement('div');
    leftText.style.fontSize = '24px';
    leftText.style.color = '#111111';
    leftText.style.fontWeight = 'bold';
    leftText.textContent = HEADER_TITLE;

    // 右側：X(Twitter): @raimu_sendai
    const rightText = document.createElement('div');
    rightText.style.fontSize = '13px';
    rightText.style.color = '#444444';
    rightText.style.fontWeight = 'bold';
    rightText.textContent = HEADER_TWITTER;

    // ヘッダーにテキストを追加して画面の先頭に差し込み
    header.appendChild(leftText);
    header.appendChild(rightText);
    document.body.appendChild(header);
}

// 実行処理（画面読み込み時＆地図完成時）
window.addEventListener('DOMContentLoaded', () => {
    // ヘッダーを即座に作成して表示
    createTopHeader();

    // 地図が「最初の描画」を終えた瞬間に地図スタイルを適用
    setTimeout(() => {
        if (typeof map !== 'undefined' && typeof map.on === 'function') {
            map.on('rendercomplete', applyCustomMapSettings);
        } else {
            setTimeout(applyCustomMapSettings, 1000);
        }
    }, 100);
});
