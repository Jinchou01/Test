// ============================================================
// i18n.js  (修改版：添加 module.exports，守护 localStorage/location)
// ============================================================

// =======================
// ? 多语言配置
// =======================
const translations = {
  en: {
    app: {
      title: "Budget App",
      logo: "Budget<b>App</b>",
      balance: "Balance",
      income: "Income",
      outcome: "Outcome",
      dashboard: "Dashboard",
      expense: "Expenses",
      all: "All",
      titlePlaceholder: "Title",
    },

    cookie: {
      message:
        "We use cookies to improve your experience. Please read our",
      accept: "Accept All",
      reject: "Reject",
    },

    privacy: {
      title: "Privacy Policy",
      desc: "This website may use cookies to improve your browsing experience and support basic website functions. Cookies are small text files stored on your device when you visit a website.",
      highlight:
        "We may collect limited information such as your cookie preference, browser type, device information, and basic usage information. This information is collected to remember your cookie choice, keep the website working properly, improve user experience, and understand how visitors use the website.",
      usage:
        "The information collected through cookies may be used for the following purposes:",
      item1:
        "Essential cookies are used to remember your cookie preference and support necessary website functionality.",
      item2:
        "Experience cookies may be used to improve page performance, language display, and general user experience.",
      footer:
        "We do not use cookies to collect sensitive personal information. You can choose to accept or reject cookies. If you have any questions about this Privacy Policy or how cookies are used, please contact Jiebo.Niu22@student.xjtlu.edu.cn.",
      back: "← Go back",
    },
  },

  zh: {
    app: {
      title: "记账应用",
      logo: "记账<b>应用</b>",
      balance: "余额",
      income: "收入",
      outcome: "支出",
      dashboard: "面板",
      expense: "支出",
      all: "全部",
      titlePlaceholder: "标题",
    },

    cookie: {
      message: "我们使用 Cookies 来提升您的体验，请阅读",
      accept: "同意",
      reject: "拒绝",
    },

    privacy: {
      title: "隐私政策",
      desc: "本网站可能会使用 Cookie 来提升您的浏览体验，并支持网站的基本功能。Cookie 是您访问网站时存储在您设备上的小型文本文件。",
      highlight:
        "我们可能会收集有限的信息，例如您的 Cookie 选择偏好、浏览器类型、设备信息以及基本的网站使用信息。收集这些信息的目的是记住您的 Cookie 选择、保证网站正常运行、提升用户体验，并了解访问者如何使用本网站。",
      usage: "通过 Cookie 收集的信息可能会用于以下目的：",
      item1:
        "必要 Cookie 用于记住您的 Cookie 选择偏好，并支持网站所需的基本功能。",
      item2:
        "体验类 Cookie 可能用于提升页面性能、语言显示效果以及整体用户体验。",
      footer:
        "我们不会使用 Cookie 收集敏感个人信息。您可以选择同意或拒绝 Cookie。如果您对本隐私政策或 Cookie 的使用有任何问题，请通过邮箱 Jiebo.Niu22@student.xjtlu.edu.cn 联系。",
      back: "← 返回",
    },
  },
};

// =======================
// ? 当前语言（守护 localStorage）
// =======================
let currentLang;
try {
  currentLang =
    (typeof localStorage !== "undefined" && localStorage.getItem("lang")) ||
    "en";
} catch (e) {
  currentLang = "en";
}

// =======================
// ? 获取翻译
// =======================
function t(path) {
  try {
    return path
      .split(".")
      .reduce((obj, key) => obj[key], translations[currentLang]);
  } catch (e) {
    console.warn("Missing translation:", path);
    return path;
  }
}

// =======================
// ? 切换语言
// =======================
function setLanguage(lang) {
  if (!translations[lang]) return;

  currentLang = lang;

  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("lang", lang);
    }
  } catch (e) {
    // localStorage 不可用时静默失败
  }

  // 仅在浏览器（非测试）环境中刷新页面
  if (typeof module === "undefined" && typeof location !== "undefined") {
    location.reload();
  }
}

// =======================
// 导出（供 Jest 测试使用）
// =======================
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    translations,
    t,
    setLanguage,
    getCurrentLang: () => currentLang,
  };
}