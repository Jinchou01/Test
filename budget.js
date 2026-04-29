// ============================================================
// budget.js
// ============================================================

let ENTRY_LIST = [];
let balance = 0,
  income = 0,
  outcome = 0;
const DELETE = "delete",
  EDIT = "edit";

let balanceEl, incomeTotalEl, outcomeTotalEl;
let incomeEl, expenseEl, allEl;
let incomeList, expenseList, allList;
let expenseTitle, expenseAmount, incomeTitle, incomeAmount;

let _updateChart = null;

// ============================================================
// 纯工具函数
// ============================================================

function escapeHTML(text) {
  if (typeof text !== "string") return text;
  const escapeMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };
  return text.replace(/[&<>"'/]/g, (char) => escapeMap[char]);
}

function calculateTotal(type, list) {
  let sum = 0;
  list.forEach((entry) => {
    if (entry.type === type) sum += entry.amount;
  });
  return sum;
}

function calculateBalance(inc, out) {
  return inc - out;
}

function clearInput(inputs) {
  inputs.forEach((input) => {
    input.value = "";
  });
}

function show(element) {
  element.classList.remove("hide");
}

function hide(elements) {
  elements.forEach((element) => element.classList.add("hide"));
}

function active(element) {
  element.classList.add("focus");
}

function inactive(elements) {
  elements.forEach((element) => element.classList.remove("focus"));
}

function clearElement(elements) {
  elements.forEach((element) => {
    element.innerHTML = "";
  });
}

// ============================================================
// DOM 相关函数
// ============================================================

function showEntry(list, type, title, amount, id) {
  const entry = `<li id="${id}" class="${type}">
    <div class="entry">${escapeHTML(title)} : $${amount}</div>
    <button type="button" id="edit" class="btn-icon" aria-label="Edit entry"></button>
    <button type="button" id="delete" class="btn-icon" aria-label="Delete entry"></button>
  </li>`;
  list.insertAdjacentHTML("afterbegin", entry);
}

function deleteOrEdit(event) {
  const targetBtn = event.target;
  const entry = targetBtn.parentNode;
  if (targetBtn.id === EDIT) {
    editEntry(entry);
  } else if (targetBtn.id === DELETE) {
    deleteEntry(entry);
  }
}

function deleteEntry(entry) {
  ENTRY_LIST.splice(entry.id, 1);
  updateUI();
}

function editEntry(entry) {
  const ENTRY = ENTRY_LIST[entry.id];
  if (!ENTRY) return;

  if (ENTRY.type === "income") {
    if (incomeTitle) incomeTitle.value = ENTRY.title;
    if (incomeAmount) incomeAmount.value = ENTRY.amount;
  } else if (ENTRY.type === "expense") {
    if (expenseTitle) expenseTitle.value = ENTRY.title;
    if (expenseAmount) expenseAmount.value = ENTRY.amount;
  }
  deleteEntry(entry);
}

function updateUI() {
  income = calculateTotal("income", ENTRY_LIST);
  outcome = calculateTotal("expense", ENTRY_LIST);
  balance = Math.abs(calculateBalance(income, outcome));

  const sign = income >= outcome ? "$" : "-$";

  if (balanceEl) balanceEl.innerHTML = `<small>${sign}</small>${balance}`;
  if (outcomeTotalEl) outcomeTotalEl.innerHTML = `<small>$</small>${outcome}`;
  if (incomeTotalEl) incomeTotalEl.innerHTML = `<small>$</small>${income}`;

  if (expenseList && incomeList && allList) {
    clearElement([expenseList, incomeList, allList]);
    ENTRY_LIST.forEach((entry, index) => {
      if (entry.type === "expense") {
        showEntry(expenseList, entry.type, entry.title, entry.amount, index);
      } else if (entry.type === "income") {
        showEntry(incomeList, entry.type, entry.title, entry.amount, index);
      }
      showEntry(allList, entry.type, entry.title, entry.amount, index);
    });
  }

  if (typeof _updateChart === "function") {
    _updateChart(income, outcome);
  } /* istanbul ignore next */ else if (typeof updateChart === "function") {
    updateChart(income, outcome);
  }

  try {
    localStorage.setItem("entry_list", JSON.stringify(ENTRY_LIST));
  } catch (e) {
    // localStorage 不可用时静默失败
  }
}

// ============================================================
// 初始化
// ============================================================

function init() {
  balanceEl = document.querySelector(".balance .value");
  incomeTotalEl = document.querySelector(".income-total");
  outcomeTotalEl = document.querySelector(".outcome-total");
  incomeEl = document.querySelector("#income");
  expenseEl = document.querySelector("#expense");
  allEl = document.querySelector("#all");
  incomeList = document.querySelector("#income .list");
  expenseList = document.querySelector("#expense .list");
  allList = document.querySelector("#all .list");

  const expenseBtn = document.querySelector(".first-tab");
  const incomeBtn = document.querySelector(".second-tab");
  const allBtn = document.querySelector(".third-tab");
  const addExpense = document.querySelector(".add-expense");
  const addIncome = document.querySelector(".add-income");

  expenseTitle = document.getElementById("expense-title-input");
  expenseAmount = document.getElementById("expense-amount-input");
  incomeTitle = document.getElementById("income-title-input");
  incomeAmount = document.getElementById("income-amount-input");

  try {
    ENTRY_LIST = JSON.parse(localStorage.getItem("entry_list")) || [];
  } catch (e) {
    ENTRY_LIST = [];
  }

  expenseBtn.addEventListener("click", function () {
    show(expenseEl);
    hide([incomeEl, allEl]);
    active(expenseBtn);
    inactive([incomeBtn, allBtn]);
  });

  incomeBtn.addEventListener("click", function () {
    show(incomeEl);
    hide([expenseEl, allEl]);
    active(incomeBtn);
    inactive([expenseBtn, allBtn]);
  });

  allBtn.addEventListener("click", function () {
    show(allEl);
    hide([incomeEl, expenseEl]);
    active(allBtn);
    inactive([incomeBtn, expenseBtn]);
  });

  addExpense.addEventListener("click", function () {
    if (!expenseTitle.value || !expenseAmount.value) return;
    ENTRY_LIST.push({
      type: "expense",
      title: expenseTitle.value,
      amount: +expenseAmount.value,
    });
    updateUI();
    clearInput([expenseTitle, expenseAmount]);
  });

  addIncome.addEventListener("click", function () {
    if (!incomeTitle.value || !incomeAmount.value) return;
    ENTRY_LIST.push({
      type: "income",
      title: incomeTitle.value,
      amount: +incomeAmount.value,
    });
    updateUI();
    clearInput([incomeTitle, incomeAmount]);
  });

  incomeList.addEventListener("click", deleteOrEdit);
  expenseList.addEventListener("click", deleteOrEdit);
  allList.addEventListener("click", deleteOrEdit);

  updateUI();
}

/* istanbul ignore next */
if (typeof window !== "undefined" && typeof module === "undefined") {
  window.addEventListener("DOMContentLoaded", init);
}

// ============================================================
// 导出
// ============================================================
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
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
    deleteOrEdit,
    deleteEntry,
    editEntry,
    updateUI,
    init,
    getEntryList: () => ENTRY_LIST,
    setEntryList: (list) => {
      ENTRY_LIST = list;
    },
    setDOMRefs: (refs) => {
      balanceEl = refs.balanceEl || null;
      incomeTotalEl = refs.incomeTotalEl || null;
      outcomeTotalEl = refs.outcomeTotalEl || null;
      incomeList = refs.incomeList || null;
      expenseList = refs.expenseList || null;
      allList = refs.allList || null;
      incomeTitle = refs.incomeTitle || null;
      incomeAmount = refs.incomeAmount || null;
      expenseTitle = refs.expenseTitle || null;
      expenseAmount = refs.expenseAmount || null;
    },
    setChartUpdater: (fn) => {
      _updateChart = fn;
    },
  };
}