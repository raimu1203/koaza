// 💡 設定1：ラベルを強制出現させたい最低のズームレベル（12）
const MIN_ZOOM_FOR_LABEL = 12; 

// 💡 設定2：文字の大きさの倍率
const LABEL_SCALE_RATIO = 0.8;

// 💡 設定3：ヘッダーに表示するテキストの設定
const HEADER_TITLE = "仙台市小字地図"; 
const HEADER_TWITTER = "X(Twitter): @raimu_sendai"; 

// 二重適用を防ぐフラグ
let isCustomStyleApplied = false;

// 🌟 地図のカスタムスタイルを即時適用する関数
function applyCustomMapSettings() {
    if (isCustomStyleApplied) return;
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

    // 初回表示を確実に確定させる
    map.getLayers().forEach((layer) => {
        if (!(layer instanceof ol.layer.Tile) && typeof layer.changed === 'function') {
            layer.changed();
        }
    });

    isCustomStyleApplied = true;
    console.log("最速タイミングで地図カスタムを適用しました。");
}

// 🌟 上部ヘッダーを作成して画面に設置する関数
function createTopHeader() {
    if (document.getElementById('custom-map-header')) return;

    const header = document.createElement('div');
    header.id = 'custom-map-header';

    header.style.position = 'fixed';
    header.style.top = '0';
    header.style.left = '0';
    header.style.width = '100%';
    header.style.height = '50px';
    header.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
    header.style.backdropFilter = 'blur(5px)';
    header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.15)';
    header.style.zIndex = '9999';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.padding = '0 20px';
    header.style.boxSizing = 'border-box';
    header.style.pointerEvents = 'auto';
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

    header.appendChild(leftText);
    header.appendChild(rightText);
    document.body.appendChild(header);
}

// ⚡ 読み込み完了と同時に無駄なタイマーなしで最速実行
window.addEventListener('DOMContentLoaded', () => {
    createTopHeader();
    applyCustomMapSettings();
});
