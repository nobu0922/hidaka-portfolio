// 画面幅374px以下では font-size を自動で縮小して設定する関数
const setResponsiveFontSize = () => {
  const html = document.documentElement;
  const width = window.innerWidth;
  if (width <= 374) {
    const baseFontSize = 6 * (width / 375); // 375px基準で縮小
    html.style.fontSize = `${baseFontSize}px`;
  } else {
    html.style.fontSize = ""; // clamp()に戻す
  }
};
// 初回実行
setResponsiveFontSize();
// resize時の負荷軽減（デバウンス）
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    setResponsiveFontSize();
  }, 100);
});

// グーグルフォントページ読み込み時チラつき回避 + タイムアウト対応
document.addEventListener("DOMContentLoaded", function () {
  const TIMEOUT_MS = 3000; // 3秒
  let isFontReady = false;
  // タイムアウト処理
  const timeoutId = setTimeout(function () {
    if (!isFontReady) {
      document.body.classList.remove("hidden");
      const spinner = document.querySelector(".loadingSpinner");
      if (spinner) spinner.style.display = "none";
    }
  }, TIMEOUT_MS);
  // フォント読み込み完了時の処理
  document.fonts.ready.then(function () {
    isFontReady = true;
    clearTimeout(timeoutId); // タイムアウトキャンセル
    document.body.classList.remove("hidden");
    const spinner = document.querySelector(".loadingSpinner");
    if (spinner) spinner.style.display = "none";
  });
});

// ドロワーメニューのトグル（スクロールロック & アクセシビリティ対応）
document.addEventListener("DOMContentLoaded", () => {
  const drawer = document.querySelector(".header__drawer");
  const hamburger = document.querySelector(".header__hamburger-button");
  const nav = document.getElementById("global-nav"); // <nav id="global-nav" ... hidden>
  if (!drawer || !hamburger || !nav) return;

  // 初期状態（必ず閉じた状態に統一）
  drawer.classList.add("is-ready");
  hamburger.setAttribute("aria-expanded", "false");
  drawer.setAttribute("aria-hidden", "true");
  nav.hidden = true;

  let savedScrollY = 0;
  let lastFocused = null;

  const lockScroll = () => {
    if (document.documentElement.classList.contains("is-scroll-locked")) return;
    savedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const sbw = window.innerWidth - document.documentElement.clientWidth;

    document.documentElement.classList.add("is-scroll-locked");
    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    if (sbw > 0) document.body.style.paddingRight = `${sbw}px`;
  };

  const unlockScroll = () => {
    if (!document.documentElement.classList.contains("is-scroll-locked")) return;
    document.documentElement.classList.remove("is-scroll-locked");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.body.style.paddingRight = "";
    window.scrollTo(0, savedScrollY);
  };

  const focusFirstItem = () => {
    const first = nav.querySelector("a, button, [tabindex]:not([tabindex='-1'])");
    first?.focus();
  };

  const openDrawer = () => {
    lastFocused = document.activeElement;

    hamburger.classList.add("active");
    drawer.classList.add("active");

    hamburger.setAttribute("aria-expanded", "true");
    drawer.setAttribute("aria-hidden", "false");
    nav.hidden = false;

    lockScroll();
    // 初回フォーカスをメニューへ
    focusFirstItem();
  };

  const closeDrawer = () => {
    hamburger.classList.remove("active");
    drawer.classList.remove("active");

    hamburger.setAttribute("aria-expanded", "false");
    drawer.setAttribute("aria-hidden", "true");
    nav.hidden = true;

    unlockScroll();
    // フォーカスをトグルに戻す（または直前の要素）
    (lastFocused instanceof HTMLElement ? lastFocused : hamburger).focus();
  };

  // トグル
  hamburger.addEventListener("click", () => {
    const open = hamburger.getAttribute("aria-expanded") === "true";
    open ? closeDrawer() : openDrawer();
  });

  // 外側クリックで閉じる
  document.addEventListener("click", (e) => {
    const isOpen = hamburger.getAttribute("aria-expanded") === "true";
    if (!isOpen) return;
    const t = e.target;
    if (!drawer.contains(t) && !hamburger.contains(t)) {
      closeDrawer();
    }
  });

  // Escで閉じる
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && hamburger.getAttribute("aria-expanded") === "true") {
      closeDrawer();
    }
  });

  // メニュー内リンクをクリックしたら閉じる（#アンカーでも閉じたい想定）
  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    // 同ページ内リンクは即閉じる
    closeDrawer();
  });
});
