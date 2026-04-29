(function () {

  function setConsent(value) {
    localStorage.setItem("cookie_consent", value);
  }

  function getConsent() {
    return localStorage.getItem("cookie_consent");
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
      setConsent("accepted");
      closeBanner();
    };

    banner.querySelector(".reject-btn").onclick = function () {
      setConsent("rejected");
      closeBanner();
    };

    function closeBanner() {
      window.removeEventListener("resize", alignBannerWithApp);
      banner.remove();
      overlay.remove();
    }
  }

  window.addEventListener("load", function () {
    if (!getConsent()) {
      createBanner();
    }
  });

})();