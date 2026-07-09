// CSSの力を使って、地図内の「塗りつぶし（path要素）」だけを狙って透明度を50%にする
const style = document.createElement('style');
style.innerHTML = '#map svg path { fill-opacity: 0.5 !important; }';
document.head.appendChild(style);

console.log("CSSを使って安全に塗りつぶしだけを50%透明にしました。");
