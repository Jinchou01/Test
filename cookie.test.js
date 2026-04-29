/**
 * cookie.test.js
 * 测试覆盖：setCookie / getCookie / createBanner
 *
 * @jest-environment jsdom
 */

const { setCookie, getCookie, createBanner } = require("./cookie");

// ─── 工具：清空所有 cookie ──────────────────────────────────
function clearAllCookies() {
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (name) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
  });
}

beforeEach(() => {
  clearAllCookies();
  // 提供 .budget-container，createBanner 需要它
  document.body.innerHTML = '<div class="budget-container" style="width:300px;"></div>';
});

afterEach(() => {
  clearAllCookies();
});

// ================================================================
// setCookie
// ================================================================
describe("setCookie()", () => {
  test("设置后 document.cookie 包含对应的 name=value", () => {
    setCookie("test_key", "hello", 1);
    expect(document.cookie).toContain("test_key=hello");
  });

  test("可连续设置多个不同 cookie", () => {
    setCookie("alpha", "1", 1);
    setCookie("beta", "2", 1);
    expect(document.cookie).toContain("alpha=1");
    expect(document.cookie).toContain("beta=2");
  });

  test("值为字符串 'accepted' 时正确写入", () => {
    setCookie("cookie_consent", "accepted", 30);
    expect(document.cookie).toContain("cookie_consent=accepted");
  });

  test("值为字符串 'rejected' 时正确写入", () => {
    setCookie("cookie_consent", "rejected", 30);
    expect(document.cookie).toContain("cookie_consent=rejected");
  });

  test("days = 0 时也不报错", () => {
    expect(() => setCookie("zero_day", "value", 0)).not.toThrow();
  });
});

// ================================================================
// getCookie
// ================================================================
describe("getCookie()", () => {
  test("读取存在的 cookie 返回正确值", () => {
    setCookie("my_cookie", "my_value", 1);
    expect(getCookie("my_cookie")).toBe("my_value");
  });

  test("cookie 不存在时返回空字符串", () => {
    expect(getCookie("nonexistent_cookie")).toBe("");
  });

  test("多个 cookie 共存时各自读取正确", () => {
    setCookie("user", "alice", 1);
    setCookie("theme", "dark", 1);
    expect(getCookie("user")).toBe("alice");
    expect(getCookie("theme")).toBe("dark");
  });

  test("读取 cookie_consent 的值", () => {
    setCookie("cookie_consent", "accepted", 30);
    expect(getCookie("cookie_consent")).toBe("accepted");
  });

  test("name 部分匹配时不误读（'name' 不会匹配 'my_name'）", () => {
    setCookie("name", "Alice", 1);
    setCookie("my_name", "Bob", 1);
    expect(getCookie("name")).toBe("Alice");
    expect(getCookie("my_name")).toBe("Bob");
  });
});

// ================================================================
// createBanner
// ================================================================
describe("createBanner()", () => {
  test("成功挂载 .cookie-banner 到 body", () => {
    createBanner();
    expect(document.querySelector(".cookie-banner")).not.toBeNull();
  });

  test("成功挂载 .cookie-overlay 到 body", () => {
    createBanner();
    expect(document.querySelector(".cookie-overlay")).not.toBeNull();
  });

  test("banner 内包含 .accept-btn", () => {
    createBanner();
    expect(document.querySelector(".accept-btn")).not.toBeNull();
  });

  test("banner 内包含 .reject-btn", () => {
    createBanner();
    expect(document.querySelector(".reject-btn")).not.toBeNull();
  });

  test("点击 accept-btn 将 cookie_consent 设为 accepted", () => {
    createBanner();
    document.querySelector(".accept-btn").click();
    expect(getCookie("cookie_consent")).toBe("accepted");
  });

  test("点击 accept-btn 后 banner 从 DOM 中移除", () => {
    createBanner();
    document.querySelector(".accept-btn").click();
    expect(document.querySelector(".cookie-banner")).toBeNull();
  });

  test("点击 accept-btn 后 overlay 从 DOM 中移除", () => {
    createBanner();
    document.querySelector(".accept-btn").click();
    expect(document.querySelector(".cookie-overlay")).toBeNull();
  });

  test("点击 reject-btn 将 cookie_consent 设为 rejected", () => {
    createBanner();
    document.querySelector(".reject-btn").click();
    expect(getCookie("cookie_consent")).toBe("rejected");
  });

  test("点击 reject-btn 后 banner 从 DOM 中移除", () => {
    createBanner();
    document.querySelector(".reject-btn").click();
    expect(document.querySelector(".cookie-banner")).toBeNull();
  });

  test("找不到 .budget-container 时打印错误并直接返回", () => {
    document.body.innerHTML = ""; // 移除容器
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    createBanner();
    expect(consoleSpy).toHaveBeenCalledWith("Cannot find .budget-container");
    expect(document.querySelector(".cookie-banner")).toBeNull();
    consoleSpy.mockRestore();
  });

  test("找不到容器时不挂载 overlay", () => {
    document.body.innerHTML = "";
    jest.spyOn(console, "error").mockImplementation(() => {});
    createBanner();
    expect(document.querySelector(".cookie-overlay")).toBeNull();
    jest.restoreAllMocks();
  });
});