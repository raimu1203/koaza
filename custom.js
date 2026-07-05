var originalStyle = lyr_map_1.getStyle();

lyr_map_1.setStyle(function(feature, resolution) {

    var styles;

    if (typeof originalStyle === "function") {
        styles = originalStyle(feature, resolution);
    } else {
        styles = originalStyle;
    }

    if (!styles) return styles;

    // 配列対応
    if (Array.isArray(styles)) {
        styles.forEach(function(s) {
            if (s.getFill()) {
                var color = s.getFill().getColor();

                // rgbaに変換して透明度だけ変更
                if (typeof color === 'string' && color.startsWith('rgba')) {
                    s.getFill().setColor(color.replace(/[\d\.]+\)$/,'0.3)'));
                }
            }
        });
    } else {
        if (styles.getFill && styles.getFill()) {
            var color = styles.getFill().getColor();

            if (typeof color === 'string' && color.startsWith('rgba')) {
                styles.getFill().setColor(color.replace(/[\d\.]+\)$/,'0.3)'));
            }
        }
    }

    return styles;
});
