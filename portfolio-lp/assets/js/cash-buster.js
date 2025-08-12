// ==============================
// キャッシュバスター（アップロード時に削除）
// ==============================
// CSS
document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
  const href = link.getAttribute("href");
  if (href) {
    const newHref = href + (href.includes("?") ? "&" : "?") + "_=" + Date.now();
    link.setAttribute("href", newHref);
  }
});
// JS
document.querySelectorAll("script[src]").forEach((script) => {
  const src = script.getAttribute("src");
  // 自分自身を除外（たとえば "cash-buster.js" を含むなら除く）
  if (src && !src.includes("_=") && !src.includes("cash-buster.js")) {
    const newSrc = src + (src.includes("?") ? "&" : "?") + "_=" + Date.now();
    const newScript = document.createElement("script");
    newScript.src = newSrc;
    newScript.async = script.async;
    script.parentNode.replaceChild(newScript, script);
  }
});
