function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = name + "=" + value + ";expires=" + d.toUTCString() + ";path=/";
}

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

function createBanner() {
  const appContainer = document.querySelector(".budget-container");

  if (!appContainer) {
    console.error("Cannot find .budget-container");
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "cookie-overlay";
  document.body.appendChild(overlay);

  const banner = document.createElement("div");
  banner.className = "cookie-banner";

  banner.innerHTML = `
    <p>
      ${t("cookie.message")}

      <a href="privacy.html" target="_blank">
        ${t("privacy.title")}
      </a>
    </p>

    <div class="cookie-buttons">
      <button class="accept-btn">${t("cookie.accept")}</button>
      <button class="reject-btn">${t("cookie.reject")}</button>
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

  banner.querySelector(".accept-btn").onclick = function () {
    setCookie("cookie_consent", "accepted", 30);
    close();
  };

  banner.querySelector(".reject-btn").onclick = function () {
    setCookie("cookie_consent", "rejected", 30);
    close();
  };

  function close() {
    window.removeEventListener("resize", alignBannerWithApp);
    banner.remove();
    overlay.remove();
  }
}

window.addEventListener("load", function () {
  if (!getCookie("cookie_consent")) {
    createBanner();
  }
});

if (typeof module !== "undefined") {
  module.exports = {
    setCookie,
    getCookie,
    createBanner
  };
}