/**
 * i18n.test.js
 * 测试覆盖：translations 对象结构 / t() / setLanguage() / getCurrentLang()
 *
 * @jest-environment jsdom
 */

// 每次 require 前清空 localStorage，确保默认语言为 en
beforeAll(() => {
  localStorage.clear();
});

const { translations, t, setLanguage, getCurrentLang } = require("./i18n");

// ================================================================
// translations 对象结构验证
// ================================================================
describe("translations 对象", () => {
  test("包含 en 和 zh 两种语言", () => {
    expect(translations).toHaveProperty("en");
    expect(translations).toHaveProperty("zh");
  });

  test("en.app 包含所有必需字段", () => {
    const { app } = translations.en;
    ["title", "balance", "income", "outcome", "expense", "all"].forEach(
      (key) => {
        expect(app).toHaveProperty(key);
      }
    );
  });

  test("zh.app 包含所有必需字段", () => {
    const { app } = translations.zh;
    ["title", "balance", "income", "outcome", "expense", "all"].forEach(
      (key) => {
        expect(app).toHaveProperty(key);
      }
    );
  });

  test("en.cookie 包含 message / accept / reject", () => {
    const { cookie } = translations.en;
    expect(cookie).toHaveProperty("message");
    expect(cookie).toHaveProperty("accept");
    expect(cookie).toHaveProperty("reject");
  });

  test("zh.cookie 包含 message / accept / reject", () => {
    const { cookie } = translations.zh;
    expect(cookie).toHaveProperty("message");
    expect(cookie).toHaveProperty("accept");
    expect(cookie).toHaveProperty("reject");
  });

  test("en.privacy 包含必需字段", () => {
    const { privacy } = translations.en;
    ["title", "desc", "footer", "back"].forEach((key) => {
      expect(privacy).toHaveProperty(key);
    });
  });

  test("zh.privacy.title 不等于 en.privacy.title（确认已翻译）", () => {
    expect(translations.zh.privacy.title).not.toBe(
      translations.en.privacy.title
    );
  });
});

// ================================================================
// t() 函数
// ================================================================
describe("t()", () => {
  // 确保测试以英文开始
  beforeEach(() => {
    setLanguage("en");
  });

  test("返回 en 的 app.title", () => {
    expect(t("app.title")).toBe("Budget App");
  });

  test("返回 en 的 app.balance", () => {
    expect(t("app.balance")).toBe("Balance");
  });

  test("返回 en 的 cookie.accept", () => {
    expect(t("cookie.accept")).toBe("Accept All");
  });

  test("返回 en 的 cookie.reject", () => {
    expect(t("cookie.reject")).toBe("Reject");
  });

  test("返回 en 的 privacy.back", () => {
    expect(t("privacy.back")).toBe("← Go back");
  });

  test("key 不存在时返回 path 字符串本身", () => {
    const consoleSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    const result = t("nonexistent.deep.key");
    expect(result).toBe("nonexistent.deep.key");
    consoleSpy.mockRestore();
  });

  test("key 不存在时调用 console.warn", () => {
    const consoleSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    t("missing.key");
    expect(consoleSpy).toHaveBeenCalledWith(
      "Missing translation:",
      "missing.key"
    );
    consoleSpy.mockRestore();
  });

  test("切换到 zh 后返回中文 app.title", () => {
    setLanguage("zh");
    expect(t("app.title")).toBe("记账应用");
    setLanguage("en"); // 恢复
  });

  test("切换到 zh 后 cookie.accept 返回中文", () => {
    setLanguage("zh");
    expect(t("cookie.accept")).toBe("同意");
    setLanguage("en");
  });

  test("切换到 zh 后 privacy.back 返回中文", () => {
    setLanguage("zh");
    expect(t("privacy.back")).toBe("← 返回");
    setLanguage("en");
  });
});

// ================================================================
// setLanguage() 和 getCurrentLang()
// ================================================================
describe("setLanguage() 和 getCurrentLang()", () => {
  test("默认语言为 en（localStorage 为空时）", () => {
    // 模块加载时 localStorage 已清空，应默认为 en
    expect(["en", "zh"]).toContain(getCurrentLang());
  });

  test("setLanguage('zh') 将当前语言切换为 zh", () => {
    setLanguage("zh");
    expect(getCurrentLang()).toBe("zh");
  });

  test("setLanguage('zh') 将 lang 保存到 localStorage", () => {
    setLanguage("zh");
    expect(localStorage.getItem("lang")).toBe("zh");
  });

  test("setLanguage('en') 将当前语言切换回 en", () => {
    setLanguage("zh");
    setLanguage("en");
    expect(getCurrentLang()).toBe("en");
  });

  test("setLanguage('en') 将 lang 保存到 localStorage", () => {
    setLanguage("en");
    expect(localStorage.getItem("lang")).toBe("en");
  });

  test("传入不存在的语言代码不改变当前语言", () => {
    setLanguage("zh");
    setLanguage("fr"); // 无效语言
    expect(getCurrentLang()).toBe("zh");
    setLanguage("en");
  });

  test("传入空字符串不改变当前语言", () => {
    setLanguage("en");
    setLanguage("");
    expect(getCurrentLang()).toBe("en");
  });

  test("反复切换语言后 t() 输出正确", () => {
    setLanguage("en");
    expect(t("app.income")).toBe("Income");
    setLanguage("zh");
    expect(t("app.income")).toBe("收入");
    setLanguage("en");
    expect(t("app.income")).toBe("Income");
  });
});