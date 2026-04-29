/**
 * budget.test.js
 * @jest-environment jsdom
 */

const mockUpdateChart = jest.fn();
const budget = require("./budget");
budget.setChartUpdater(mockUpdateChart);

const {
  escapeHTML,
  calculateTotal,
  calculateBalance,
  clearInput,
  show,
  hide,
  active,
  inactive,
  clearElement,
  showEntry,
  deleteEntry,
  editEntry,
  updateUI,
  init,
  getEntryList,
  setEntryList,
  setDOMRefs,
} = budget;

const DOM_HTML = `
  <div class="balance"><span class="value"></span></div>
  <span class="income-total"></span>
  <span class="outcome-total"></span>
  <div id="income" class="hide">
    <ul class="list"></ul>
    <input id="income-title-input" />
    <input id="income-amount-input" />
  </div>
  <div id="expense">
    <ul class="list"></ul>
    <input id="expense-title-input" />
    <input id="expense-amount-input" />
  </div>
  <div id="all" class="hide"><ul class="list"></ul></div>
  <button class="first-tab focus"></button>
  <button class="second-tab"></button>
  <button class="third-tab"></button>
  <button class="add-expense"></button>
  <button class="add-income"></button>
  <div class="chart"></div>
`;

beforeEach(() => {
  document.body.innerHTML = DOM_HTML;
  setEntryList([]);
  mockUpdateChart.mockClear();
  localStorage.clear();

  setDOMRefs({
    balanceEl: document.querySelector(".balance .value"),
    incomeTotalEl: document.querySelector(".income-total"),
    outcomeTotalEl: document.querySelector(".outcome-total"),
    incomeList: document.querySelector("#income .list"),
    expenseList: document.querySelector("#expense .list"),
    allList: document.querySelector("#all .list"),
    incomeTitle: document.getElementById("income-title-input"),
    incomeAmount: document.getElementById("income-amount-input"),
    expenseTitle: document.getElementById("expense-title-input"),
    expenseAmount: document.getElementById("expense-amount-input"),
  });
});

// ================================================================
// escapeHTML
// ================================================================
describe("escapeHTML()", () => {
  test("将 & 转义为 &amp;", () => {
    expect(escapeHTML("Tom & Jerry")).toBe("Tom &amp; Jerry");
  });

  test("将 < 和 > 转义，阻止 XSS 注入", () => {
    expect(escapeHTML("<script>alert(1)</script>")).toBe(
      "&lt;script&gt;alert(1)&lt;&#x2F;script&gt;"
    );
  });

  test('将双引号 " 转义为 &quot;', () => {
    expect(escapeHTML('"quoted"')).toBe("&quot;quoted&quot;");
  });

  test("将单引号 ' 转义为 &#x27;", () => {
    expect(escapeHTML("it's fine")).toBe("it&#x27;s fine");
  });

  test("将 / 转义为 &#x2F;", () => {
    expect(escapeHTML("a/b")).toBe("a&#x2F;b");
  });

  test("非字符串原样返回（数字）", () => {
    expect(escapeHTML(42)).toBe(42);
  });

  test("非字符串原样返回（null）", () => {
    expect(escapeHTML(null)).toBe(null);
  });

  test("空字符串返回空字符串", () => {
    expect(escapeHTML("")).toBe("");
  });

  test("无特殊字符的字符串保持不变", () => {
    expect(escapeHTML("Hello World")).toBe("Hello World");
  });
});

// ================================================================
// calculateTotal
// ================================================================
describe("calculateTotal()", () => {
  const entries = [
    { type: "income", amount: 1000 },
    { type: "income", amount: 500 },
    { type: "expense", amount: 200 },
    { type: "expense", amount: 50 },
  ];

  test("正确汇总所有 income 条目", () => {
    expect(calculateTotal("income", entries)).toBe(1500);
  });

  test("正确汇总所有 expense 条目", () => {
    expect(calculateTotal("expense", entries)).toBe(250);
  });

  test("空列表返回 0", () => {
    expect(calculateTotal("income", [])).toBe(0);
  });

  test("无匹配类型时返回 0", () => {
    expect(
      calculateTotal("income", [{ type: "expense", amount: 100 }])
    ).toBe(0);
  });

  test("仅含单条记录时正确求和", () => {
    expect(
      calculateTotal("expense", [{ type: "expense", amount: 99 }])
    ).toBe(99);
  });
});

// ================================================================
// calculateBalance
// ================================================================
describe("calculateBalance()", () => {
  test("收入 > 支出时返回正数", () => {
    expect(calculateBalance(800, 300)).toBe(500);
  });

  test("收入 < 支出时返回负数", () => {
    expect(calculateBalance(100, 400)).toBe(-300);
  });

  test("收支相等时返回 0", () => {
    expect(calculateBalance(200, 200)).toBe(0);
  });

  test("均为 0 时返回 0", () => {
    expect(calculateBalance(0, 0)).toBe(0);
  });
});

// ================================================================
// show / hide
// ================================================================
describe("show() and hide()", () => {
  test("show() 移除 hide 类", () => {
    const el = document.createElement("div");
    el.classList.add("hide");
    show(el);
    expect(el.classList.contains("hide")).toBe(false);
  });

  test("show() 对没有 hide 类的元素无副作用", () => {
    const el = document.createElement("div");
    show(el);
    expect(el.classList.contains("hide")).toBe(false);
  });

  test("hide() 为数组中每个元素添加 hide 类", () => {
    const el1 = document.createElement("div");
    const el2 = document.createElement("div");
    hide([el1, el2]);
    expect(el1.classList.contains("hide")).toBe(true);
    expect(el2.classList.contains("hide")).toBe(true);
  });

  test("hide() 传入空数组不报错", () => {
    expect(() => hide([])).not.toThrow();
  });
});

// ================================================================
// active / inactive
// ================================================================
describe("active() and inactive()", () => {
  test("active() 添加 focus 类", () => {
    const btn = document.createElement("button");
    active(btn);
    expect(btn.classList.contains("focus")).toBe(true);
  });

  test("inactive() 移除数组中每个元素的 focus 类", () => {
    const b1 = document.createElement("button");
    const b2 = document.createElement("button");
    b1.classList.add("focus");
    b2.classList.add("focus");
    inactive([b1, b2]);
    expect(b1.classList.contains("focus")).toBe(false);
    expect(b2.classList.contains("focus")).toBe(false);
  });

  test("inactive() 对无 focus 类的元素无副作用", () => {
    const btn = document.createElement("button");
    inactive([btn]);
    expect(btn.classList.contains("focus")).toBe(false);
  });
});

// ================================================================
// clearElement
// ================================================================
describe("clearElement()", () => {
  test("清空所有传入元素的 innerHTML", () => {
    const ul1 = document.createElement("ul");
    ul1.innerHTML = "<li>item 1</li>";
    const ul2 = document.createElement("ul");
    ul2.innerHTML = "<li>item 2</li><li>item 3</li>";
    clearElement([ul1, ul2]);
    expect(ul1.innerHTML).toBe("");
    expect(ul2.innerHTML).toBe("");
  });

  test("对已空元素无副作用", () => {
    const el = document.createElement("ul");
    clearElement([el]);
    expect(el.innerHTML).toBe("");
  });
});

// ================================================================
// clearInput
// ================================================================
describe("clearInput()", () => {
  test("清空所有 input 的 value", () => {
    const inp1 = document.createElement("input");
    inp1.value = "Coffee";
    const inp2 = document.createElement("input");
    inp2.value = "50";
    clearInput([inp1, inp2]);
    expect(inp1.value).toBe("");
    expect(inp2.value).toBe("");
  });
});

// ================================================================
// showEntry
// ================================================================
describe("showEntry()", () => {
  test("在列表中插入 li 元素", () => {
    const list = document.querySelector("#expense .list");
    showEntry(list, "expense", "Coffee", 5, 0);
    expect(list.querySelector("li")).not.toBeNull();
  });

  test("li 元素包含正确的 class 和内容", () => {
    const list = document.querySelector("#expense .list");
    showEntry(list, "expense", "Coffee", 5, 0);
    const li = list.querySelector("li");
    expect(li.classList.contains("expense")).toBe(true);
    expect(li.textContent).toContain("Coffee");
    expect(li.textContent).toContain("$5");
  });

  test("对标题进行 HTML 转义，防止 XSS", () => {
    const list = document.querySelector("#income .list");
    showEntry(list, "income", "<img onerror='alert(1)'>", 100, 0);
    expect(list.innerHTML).not.toContain("<img");
    expect(list.innerHTML).toContain("&lt;img");
  });

  test("使用 afterbegin，最新条目排在最前面", () => {
    const list = document.querySelector("#all .list");
    showEntry(list, "income", "First", 10, 0);
    showEntry(list, "expense", "Second", 20, 1);
    const items = list.querySelectorAll("li");
    expect(items[0].textContent).toContain("Second");
    expect(items[1].textContent).toContain("First");
  });

  test("li 包含 edit 和 delete 按钮", () => {
    const list = document.querySelector("#all .list");
    showEntry(list, "income", "Salary", 1000, 0);
    const li = list.querySelector("li");
    expect(li.querySelector("#edit")).not.toBeNull();
    expect(li.querySelector("#delete")).not.toBeNull();
  });
});

// ================================================================
// updateUI
// ================================================================
describe("updateUI()", () => {
  test("收入 > 支出时，余额显示正号 $", () => {
    setEntryList([
      { type: "income", title: "Salary", amount: 1000 },
      { type: "expense", title: "Rent", amount: 400 },
    ]);
    updateUI();
    const balanceEl = document.querySelector(".balance .value");
    expect(balanceEl.innerHTML).toContain("600");
    expect(balanceEl.innerHTML).toContain("<small>$</small>");
  });

  test("支出 > 收入时，余额显示负号 -$", () => {
    setEntryList([
      { type: "income", title: "Part-time", amount: 100 },
      { type: "expense", title: "Rent", amount: 600 },
    ]);
    updateUI();
    const balanceEl = document.querySelector(".balance .value");
    expect(balanceEl.innerHTML).toContain("-$");
    expect(balanceEl.innerHTML).toContain("500");
  });

  test("expense 条目出现在 expense 列表中", () => {
    setEntryList([{ type: "expense", title: "Food", amount: 80 }]);
    updateUI();
    expect(
      document.querySelector("#expense .list").querySelectorAll("li").length
    ).toBe(1);
  });

  test("income 条目出现在 income 列表中", () => {
    setEntryList([{ type: "income", title: "Salary", amount: 3000 }]);
    updateUI();
    expect(
      document.querySelector("#income .list").querySelectorAll("li").length
    ).toBe(1);
  });

  test("所有条目都出现在 all 列表中", () => {
    setEntryList([
      { type: "income", title: "Salary", amount: 500 },
      { type: "expense", title: "Food", amount: 50 },
      { type: "expense", title: "Bus", amount: 10 },
    ]);
    updateUI();
    expect(
      document.querySelector("#all .list").querySelectorAll("li").length
    ).toBe(3);
  });

  test("调用 chart 更新函数", () => {
    setEntryList([{ type: "income", title: "A", amount: 100 }]);
    updateUI();
    expect(mockUpdateChart).toHaveBeenCalledWith(100, 0);
  });

  test("空列表时余额为 0", () => {
    setEntryList([]);
    updateUI();
    expect(document.querySelector(".balance .value").innerHTML).toContain("0");
  });
});

// ================================================================
// deleteEntry
// ================================================================
describe("deleteEntry()", () => {
  test("从 ENTRY_LIST 中移除指定索引的条目", () => {
    setEntryList([
      { type: "income", title: "A", amount: 100 },
      { type: "expense", title: "B", amount: 50 },
      { type: "income", title: "C", amount: 200 },
    ]);
    deleteEntry({ id: 1 });
    const list = getEntryList();
    expect(list.length).toBe(2);
    expect(list.find((e) => e.title === "B")).toBeUndefined();
  });

  test("删除第一个条目后顺序正确", () => {
    setEntryList([
      { type: "income", title: "First", amount: 100 },
      { type: "income", title: "Second", amount: 200 },
    ]);
    deleteEntry({ id: 0 });
    expect(getEntryList()[0].title).toBe("Second");
  });
});

// ================================================================
// editEntry
// ================================================================
describe("editEntry()", () => {
  test("将 income 条目的 title 填入 income 输入框", () => {
    setEntryList([{ type: "income", title: "Freelance", amount: 800 }]);
    editEntry({ id: 0 });
    expect(document.getElementById("income-title-input").value).toBe(
      "Freelance"
    );
  });

  test("将 income 条目的 amount 填入 income 金额框", () => {
    setEntryList([{ type: "income", title: "Freelance", amount: 800 }]);
    editEntry({ id: 0 });
    expect(document.getElementById("income-amount-input").value).toBe("800");
  });

  test("将 expense 条目的 title 填入 expense 输入框", () => {
    setEntryList([{ type: "expense", title: "Electricity", amount: 120 }]);
    editEntry({ id: 0 });
    expect(document.getElementById("expense-title-input").value).toBe(
      "Electricity"
    );
  });

  test("编辑后条目从列表中移除", () => {
    setEntryList([{ type: "income", title: "Bonus", amount: 500 }]);
    editEntry({ id: 0 });
    expect(getEntryList().length).toBe(0);
  });

  test("id 无效时不抛出错误", () => {
    setEntryList([{ type: "income", title: "X", amount: 10 }]);
    expect(() => editEntry({ id: 99 })).not.toThrow();
  });
});

// ================================================================
// init() — 覆盖 tab 切换、添加条目、localStorage 读取等分支
// ================================================================
describe("init()", () => {
  test("init() 执行后不报错，updateUI 被调用", () => {
    expect(() => init()).not.toThrow();
    // init 内部调用 updateUI，会触发 mockUpdateChart
    expect(mockUpdateChart).toHaveBeenCalled();
  });

  test("点击 expense tab 显示 expense 面板", () => {
    init();
    document.querySelector(".first-tab").click();
    expect(
      document.querySelector("#expense").classList.contains("hide")
    ).toBe(false);
    expect(
      document.querySelector("#income").classList.contains("hide")
    ).toBe(true);
    expect(
      document.querySelector("#all").classList.contains("hide")
    ).toBe(true);
  });

  test("点击 income tab 显示 income 面板", () => {
    init();
    document.querySelector(".second-tab").click();
    expect(
      document.querySelector("#income").classList.contains("hide")
    ).toBe(false);
    expect(
      document.querySelector("#expense").classList.contains("hide")
    ).toBe(true);
  });

  test("点击 all tab 显示 all 面板", () => {
    init();
    document.querySelector(".third-tab").click();
    expect(
      document.querySelector("#all").classList.contains("hide")
    ).toBe(false);
    expect(
      document.querySelector("#income").classList.contains("hide")
    ).toBe(true);
    expect(
      document.querySelector("#expense").classList.contains("hide")
    ).toBe(true);
  });

  test("点击 add-expense 按钮添加 expense 条目", () => {
    init();
    document.getElementById("expense-title-input").value = "Coffee";
    document.getElementById("expense-amount-input").value = "5";
    document.querySelector(".add-expense").click();
    expect(getEntryList().length).toBe(1);
    expect(getEntryList()[0]).toMatchObject({
      type: "expense",
      title: "Coffee",
      amount: 5,
    });
  });

  test("add-expense 输入为空时不添加条目", () => {
    init();
    document.getElementById("expense-title-input").value = "";
    document.getElementById("expense-amount-input").value = "";
    document.querySelector(".add-expense").click();
    expect(getEntryList().length).toBe(0);
  });

  test("点击 add-income 按钮添加 income 条目", () => {
    init();
    document.getElementById("income-title-input").value = "Salary";
    document.getElementById("income-amount-input").value = "3000";
    document.querySelector(".add-income").click();
    expect(getEntryList().length).toBe(1);
    expect(getEntryList()[0]).toMatchObject({
      type: "income",
      title: "Salary",
      amount: 3000,
    });
  });

  test("add-income 输入为空时不添加条目", () => {
    init();
    document.getElementById("income-title-input").value = "";
    document.getElementById("income-amount-input").value = "";
    document.querySelector(".add-income").click();
    expect(getEntryList().length).toBe(0);
  });

  test("添加条目后输入框被清空", () => {
    init();
    document.getElementById("expense-title-input").value = "Bus";
    document.getElementById("expense-amount-input").value = "2";
    document.querySelector(".add-expense").click();
    expect(document.getElementById("expense-title-input").value).toBe("");
    expect(document.getElementById("expense-amount-input").value).toBe("");
  });

  test("localStorage 有数据时 init() 恢复条目", () => {
    const saved = [{ type: "income", title: "Cached", amount: 999 }];
    localStorage.setItem("entry_list", JSON.stringify(saved));
    init();
    expect(getEntryList().length).toBe(1);
    expect(getEntryList()[0].title).toBe("Cached");
  });

  test("localStorage 数据损坏时 init() 不报错，列表为空", () => {
    localStorage.setItem("entry_list", "INVALID JSON{{");
    expect(() => init()).not.toThrow();
    expect(getEntryList().length).toBe(0);
  });

  test("点击 expense list 中的 delete 按钮触发删除", () => {
    init();
    setEntryList([{ type: "expense", title: "Food", amount: 30 }]);
    updateUI();

    const deleteBtn = document
      .querySelector("#expense .list li")
      .querySelector("#delete");
    deleteBtn.click();
    expect(getEntryList().length).toBe(0);
  });

  test("点击 income list 中的 edit 按钮触发编辑", () => {
    init();
    setEntryList([{ type: "income", title: "Bonus", amount: 200 }]);
    updateUI();

    const editBtn = document
      .querySelector("#income .list li")
      .querySelector("#edit");
    editBtn.click();
    expect(document.getElementById("income-title-input").value).toBe("Bonus");
    expect(getEntryList().length).toBe(0);
  });

  test("点击 all list 中的 delete 按钮触发删除", () => {
    init();
    setEntryList([{ type: "income", title: "X", amount: 10 }]);
    updateUI();

    const deleteBtn = document
      .querySelector("#all .list li")
      .querySelector("#delete");
    deleteBtn.click();
    expect(getEntryList().length).toBe(0);
  });
});