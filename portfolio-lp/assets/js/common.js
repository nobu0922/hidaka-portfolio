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

// ハンバーガーメニュー
document.addEventListener("DOMContentLoaded", () => {
  const drawer = document.querySelector(".header__drawer");
  const hamburger = document.querySelector(".header__hamburger-button");
  const nav = document.getElementById("global-nav");
  if (!drawer || !hamburger || !nav) return;

  const mq = window.matchMedia("(max-width: 767px)");

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
    focusFirstItem();
  };

  const closeDrawer = () => {
    hamburger.classList.remove("active");
    drawer.classList.remove("active");
    hamburger.setAttribute("aria-expanded", "false");
    drawer.setAttribute("aria-hidden", "true");
    nav.hidden = true;
    unlockScroll();
    (lastFocused instanceof HTMLElement ? lastFocused : hamburger).focus();
  };

  const bindMobileEvents = () => {
    // 初期状態は閉じる
    closeDrawer();
    hamburger.style.display = ""; // 表示
    hamburger.addEventListener("click", toggleHandler);
    document.addEventListener("click", outsideHandler);
    document.addEventListener("keydown", escHandler);
    nav.addEventListener("click", linkHandler);
  };

  const unbindMobileEvents = () => {
    // PC時は常時表示
    hamburger.classList.remove("active");
    drawer.classList.add("active");
    hamburger.setAttribute("aria-expanded", "true");
    drawer.setAttribute("aria-hidden", "false");
    nav.hidden = false;
    hamburger.style.display = "none"; // ハンバーガー非表示
    unlockScroll();

    hamburger.removeEventListener("click", toggleHandler);
    document.removeEventListener("click", outsideHandler);
    document.removeEventListener("keydown", escHandler);
    nav.removeEventListener("click", linkHandler);
  };

  const toggleHandler = () => {
    const open = hamburger.getAttribute("aria-expanded") === "true";
    open ? closeDrawer() : openDrawer();
  };
  const outsideHandler = (e) => {
    if (!hamburger.contains(e.target) && !drawer.contains(e.target) && hamburger.getAttribute("aria-expanded") === "true") {
      closeDrawer();
    }
  };
  const escHandler = (e) => {
    if (e.key === "Escape" && hamburger.getAttribute("aria-expanded") === "true") {
      closeDrawer();
    }
  };
  const linkHandler = (e) => {
    if (e.target.closest("a")) {
      closeDrawer();
    }
  };

  // 初回判定
  mq.matches ? bindMobileEvents() : unbindMobileEvents();

  // 幅が変わったら切り替え
  mq.addEventListener("change", (e) => {
    e.matches ? bindMobileEvents() : unbindMobileEvents();
  });
});
