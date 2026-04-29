// ============================================================
// cookie.js  (修改版：移除 IIFE 包装，添加 module.exports)
// ============================================================

/**
 * 设置 Cookie
 * @param {string} name
 * @param {string} value
 * @param {number} days  有效天数
 */
function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie =
    name + "=" + value + ";expires=" + d.toUTCString() + ";path=/";
}

/**
 * 读取指定名称的 Cookie 值
 * @param {string} name
 * @returns {string}
 */
function getCookie(name) {
  const cname = name + "=";
  const decodedCookie = document.cookie;
  const ca = decodedCookie.split(";");

  for (let c of ca) {
    c = c.trim();
    if (c.indexOf(cname) === 0) {
      return c.substring(cname.length);
    }
  }
  return "";
}

/**
 * 创建 Cookie 同意横幅
 */
function createBanner() {
  const appContainer = document.querySelector(".budget-container");

  if (!appContainer) {
    console.error("Cannot find .budget-container");
    return;
  }

  // 背景遮罩
  const overlay = document.createElement("div");
  overlay.className = "cookie-overlay";
  document.body.appendChild(overlay);

  // 横幅本体
  const banner = document.createElement("div");
  banner.className = "cookie-banner";

  // 使用 i18n 的 t() 函数（若可用），否则使用默认英文文本
  const getMessage = (key, fallback) =>
    typeof t === "function" ? t(key) : fallback;

  banner.innerHTML = `
    <p>
      ${getMessage("cookie.message", "We use cookies to improve your experience. Please read our")}
      <a href="privacy.html" target="_blank">
        ${getMessage("privacy.title", "Privacy Policy")}
      </a>
    </p>
    <div class="cookie-buttons">
      <button class="accept-btn">${getMessage("cookie.accept", "Accept All")}</button>
      <button class="reject-btn">${getMessage("cookie.reject", "Reject")}</button>
    </div>
  `;

  document.body.appendChild(banner);

  function alignBannerWithApp() {
    const rect = appContainer.getBoundingClientRect();
    banner.style.width = rect.width + "px";
    banner.style.left = rect.left + "px";
  }

  alignBannerWithApp();
  window.addEventListener("resize", alignBannerWithApp);
  banner.style.display = "block";

  function close() {
    window.removeEventListener("resize", alignBannerWithApp);
    banner.remove();
    overlay.remove();
  }

  banner.querySelector(".accept-btn").onclick = function () {
    setCookie("cookie_consent", "accepted", 30);
    close();
  };

  banner.querySelector(".reject-btn").onclick = function () {
    setCookie("cookie_consent", "rejected", 30);
    close();
  };
}

// ============================================================
// 浏览器自动初始化（仅在 <script> 加载时执行）
// ============================================================
if (typeof window !== "undefined" && typeof module === "undefined") {
  window.addEventListener("load", function () {
    if (!getCookie("cookie_consent")) {
      createBanner();
    }
  });
}

// ============================================================
// 导出（供 Jest 测试使用）
// ============================================================
if (typeof module !== "undefined" && module.exports) {
  module.exports = { setCookie, getCookie, createBanner };
}