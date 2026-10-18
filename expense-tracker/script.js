"use strict";

const STORAGE_KEY = "ledger.transactions.v1";
const CATEGORIES = {
  housing: "Housing",
  food: "Food & groceries",
  transportation: "Transportation",
  utilities: "Utilities",
  health: "Health",
  entertainment: "Entertainment",
  shopping: "Shopping",
  salary: "Salary",
  freelance: "Freelance",
  other: "Other"
};
const CURRENCY_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
const DATE_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric"
});

const elements = {
  form: document.querySelector("#transaction-form"),
  description: document.querySelector("#description"),
  amount: document.querySelector("#amount"),
  type: document.querySelector("#type"),
  category: document.querySelector("#category"),
  date: document.querySelector("#date"),
  formTitle: document.querySelector("#form-title"),
  formEyebrow: document.querySelector("#form-eyebrow"),
  submitButton: document.querySelector("#submit-button"),
  submitLabel: document.querySelector("#submit-button span"),
  cancelEdit: document.querySelector("#cancel-edit"),
  formFeedback: document.querySelector("#form-feedback"),
  balanceTotal: document.querySelector("#balance-total"),
  incomeTotal: document.querySelector("#income-total"),
  expensesTotal: document.querySelector("#expenses-total"),
  transactionCount: document.querySelector("#transaction-count"),
  transactionList: document.querySelector("#transaction-list"),
  search: document.querySelector("#search"),
  typeFilter: document.querySelector("#type-filter"),
  categoryFilter: document.querySelector("#category-filter"),
  sortOrder: document.querySelector("#sort-order"),
  insightsSection: document.querySelector("#insights-section"),
  insightStats: document.querySelector("#insight-stats"),
  breakdownList: document.querySelector("#breakdown-list"),
  overviewEmpty: document.querySelector("#overview-empty"),
  todayDate: document.querySelector("#today-date"),
  storageNote: document.querySelector("#storage-note"),
  deleteDialog: document.querySelector("#delete-dialog")
};

const state = {
  transactions: loadTransactions(),
  editingId: null,
  deletingId: null
};

function formatCurrency(amount) {
  return CURRENCY_FORMATTER.format(amount);
}

function toCents(amount) {
  return Math.round(amount * 100);
}

function todayAsISODate() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function parseValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

function formatDate(value) {
  const date = parseValidDate(value);
  return date ? DATE_FORMATTER.format(date) : value;
}

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isValidStoredTransaction(value) {
  return value
    && typeof value.id === "string"
    && value.id.length > 0
    && typeof value.description === "string"
    && value.description.trim().length > 0
    && typeof value.amount === "number"
    && Number.isFinite(value.amount)
    && value.amount > 0
    && (value.type === "income" || value.type === "expense")
    && Object.hasOwn(CATEGORIES, value.category)
    && parseValidDate(value.date) !== null;
}

function loadTransactions() {
  let storedValue;
  try {
    storedValue = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    elements.storageNote.textContent = "Local storage is unavailable. Your changes may not persist after closing this page.";
    return [];
  }

  if (storedValue === null) {
    return [];
  }

  try {
    const parsed = JSON.parse(storedValue);
    if (!Array.isArray(parsed)) {
      throw new TypeError("Stored transactions must be a list.");
    }

    const validTransactions = parsed.filter(isValidStoredTransaction);
    if (validTransactions.length !== parsed.length) {
      elements.storageNote.textContent = "Some saved entries were invalid and have been left out of this view.";
    }
    return validTransactions;
  } catch (error) {
    elements.storageNote.textContent = "Saved transaction data could not be read. Add a transaction to replace it with valid data.";
    return [];
  }
}

function saveTransactions() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.transactions));
    elements.storageNote.textContent = "";
    return true;
  } catch (error) {
    elements.storageNote.textContent = "Your changes are visible, but could not be saved in this browser.";
    return false;
  }
}

function announceForm(message, type = "success") {
  elements.formFeedback.textContent = message;
  elements.formFeedback.dataset.state = type;
}

function clearFormFeedback() {
  elements.formFeedback.textContent = "";
  delete elements.formFeedback.dataset.state;
}

function getFormValues() {
  return {
    description: elements.description.value.trim(),
    amountText: elements.amount.value.trim(),
    type: elements.type.value,
    category: elements.category.value,
    date: elements.date.value
  };
}

function validateForm(values) {
  const fields = [
    elements.description,
    elements.amount,
    elements.type,
    elements.category,
    elements.date
  ];
  fields.forEach((field) => field.removeAttribute("aria-invalid"));

  const fail = (field, message) => {
    field.setAttribute("aria-invalid", "true");
    announceForm(message, "error");
    field.focus();
    return null;
  };

  if (!values.description) {
    return fail(elements.description, "Enter a description for this transaction.");
  }
  if (values.description.length > 80) {
    return fail(elements.description, "Descriptions must be 80 characters or fewer.");
  }
  if (!/^\d+(?:\.\d{1,2})?$/.test(values.amountText)) {
    return fail(elements.amount, "Enter a valid amount with up to two decimal places.");
  }
  const amount = Number(values.amountText);
  if (!Number.isFinite(amount) || amount <= 0) {
    return fail(elements.amount, "Amount must be greater than zero.");
  }
  if (!Number.isSafeInteger(toCents(amount))) {
    return fail(elements.amount, "Enter an amount that can be safely represented to two decimal places.");
  }
  if (!values.type || !["income", "expense"].includes(values.type)) {
    return fail(elements.type, "Choose whether this is income or an expense.");
  }
  if (!Object.hasOwn(CATEGORIES, values.category)) {
    return fail(elements.category, "Choose a transaction category.");
  }
  if (!parseValidDate(values.date)) {
    return fail(elements.date, "Choose a valid transaction date.");
  }

  return {
    description: values.description,
    amount: toCents(amount) / 100,
    type: values.type,
    category: values.category,
    date: values.date
  };
}

function resetForm() {
  elements.form.reset();
  elements.date.value = todayAsISODate();
  elements.editingId = null;
  elements.formTitle.textContent = "Add transaction";
  elements.formEyebrow.textContent = "KEEP IT UP TO DATE";
  elements.submitLabel.textContent = "Add transaction";
  elements.submitButton.querySelector("svg").innerHTML = '<path d="M12 5v14M5 12h14" />';
  elements.cancelEdit.hidden = true;
  elements.description.removeAttribute("aria-invalid");
  elements.amount.removeAttribute("aria-invalid");
  elements.type.removeAttribute("aria-invalid");
  elements.category.removeAttribute("aria-invalid");
  elements.date.removeAttribute("aria-invalid");
}

function beginEditing(transaction) {
  state.editingId = transaction.id;
  elements.description.value = transaction.description;
  elements.amount.value = String(transaction.amount);
  elements.type.value = transaction.type;
  elements.category.value = transaction.category;
  elements.date.value = transaction.date;
  elements.formTitle.textContent = "Edit transaction";
  elements.formEyebrow.textContent = "UPDATE YOUR ACTIVITY";
  elements.submitLabel.textContent = "Save changes";
  elements.submitButton.querySelector("svg").innerHTML = '<path d="m5 12 4 4L19 6" />';
  elements.cancelEdit.hidden = false;
  clearFormFeedback();
  elements.description.focus();
  elements.form.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function handleFormSubmit(event) {
  event.preventDefault();
  clearFormFeedback();

  const transactionFields = validateForm(getFormValues());
  if (!transactionFields) {
    return;
  }

  if (state.editingId) {
    const index = state.transactions.findIndex((transaction) => transaction.id === state.editingId);
    if (index === -1) {
      resetForm();
      announceForm("This transaction could not be found. Please try again.", "error");
      return;
    }
    state.transactions[index] = { ...state.transactions[index], ...transactionFields };
    const saved = saveTransactions();
    render();
    resetForm();
    announceForm(
      saved ? "Transaction updated." : "Transaction updated for this session, but could not be saved.",
      saved ? "success" : "error"
    );
    return;
  }

  state.transactions.push({
    id: createId(),
    ...transactionFields,
    createdAt: new Date().toISOString()
  });
  const saved = saveTransactions();
  render();
  resetForm();
  announceForm(
    saved ? "Transaction added." : "Transaction added for this session, but could not be saved.",
    saved ? "success" : "error"
  );
}

function calculateTotals() {
  const incomeCents = state.transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + toCents(transaction.amount), 0);
  const expenseCents = state.transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + toCents(transaction.amount), 0);

  return {
    income: incomeCents / 100,
    expenses: expenseCents / 100,
    balance: (incomeCents - expenseCents) / 100
  };
}

function renderSummary() {
  const totals = calculateTotals();
  elements.balanceTotal.textContent = formatCurrency(totals.balance);
  elements.incomeTotal.textContent = `+${formatCurrency(totals.income)}`;
  elements.expensesTotal.textContent = `−${formatCurrency(totals.expenses)}`;
}

function getVisibleTransactions() {
  const query = elements.search.value.trim().toLocaleLowerCase();
  const type = elements.typeFilter.value;
  const category = elements.categoryFilter.value;
  const direction = elements.sortOrder.value === "oldest" ? 1 : -1;

  return state.transactions
    .filter((transaction) => {
      const matchesDescription = transaction.description.toLocaleLowerCase().includes(query);
      const matchesType = type === "all" || transaction.type === type;
      const matchesCategory = category === "all" || transaction.category === category;
      return matchesDescription && matchesType && matchesCategory;
    })
    .sort((first, second) => {
      const dateOrder = first.date.localeCompare(second.date) * direction;
      if (dateOrder !== 0) {
        return dateOrder;
      }
      return (first.createdAt || first.id).localeCompare(second.createdAt || second.id) * direction;
    });
}

function createIconButton(action, label, iconMarkup, extraClass = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `icon-button ${extraClass}`.trim();
  button.dataset.action = action;
  button.setAttribute("aria-label", label);
  button.title = label;
  button.innerHTML = iconMarkup;
  return button;
}

function createTransactionRow(transaction) {
  const row = document.createElement("article");
  row.className = "transaction-row";
  row.dataset.type = transaction.type;
  row.dataset.id = transaction.id;

  const main = document.createElement("div");
  main.className = "transaction-main";

  const typeIcon = document.createElement("span");
  typeIcon.className = "transaction-kind-icon";
  typeIcon.setAttribute("aria-hidden", "true");
  typeIcon.innerHTML = transaction.type === "income"
    ? '<svg viewBox="0 0 24 24" fill="none"><path d="M12 19V5M6.5 10.5 12 5l5.5 5.5" /></svg>'
    : '<svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M17.5 13.5 12 19l-5.5-5.5" /></svg>';

  const copy = document.createElement("div");
  copy.className = "transaction-copy";
  const description = document.createElement("h3");
  description.className = "transaction-description";
  description.textContent = transaction.description;
  const meta = document.createElement("div");
  meta.className = "transaction-meta";

  const category = document.createElement("span");
  category.textContent = CATEGORIES[transaction.category];
  const separator = document.createElement("span");
  separator.className = "meta-separator";
  separator.setAttribute("aria-hidden", "true");
  separator.textContent = "·";
  const date = document.createElement("time");
  date.dateTime = transaction.date;
  date.textContent = formatDate(transaction.date);
  copy.append(description, meta);
  meta.append(category, separator, date);
  main.append(typeIcon, copy);

  const typeLabel = document.createElement("span");
  typeLabel.className = "transaction-type";
  typeLabel.textContent = transaction.type === "income" ? "Income" : "Expense";
  typeLabel.setAttribute("aria-label", `Transaction type: ${typeLabel.textContent}`);

  const amount = document.createElement("p");
  amount.className = "transaction-amount";
  amount.textContent = `${transaction.type === "income" ? "+" : "−"}${formatCurrency(transaction.amount)}`;
  amount.setAttribute("aria-label", `${typeLabel.textContent} ${formatCurrency(transaction.amount)}`);

  const actions = document.createElement("div");
  actions.className = "transaction-actions";
  actions.append(
    createIconButton("edit", `Edit ${transaction.description}`, '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m14 6 4 4M4 20l4.2-.9L19 8.3a2.1 2.1 0 0 0-3-3L5.2 16.1 4 20Z" /></svg>'),
    createIconButton("delete", `Delete ${transaction.description}`, '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>', "delete-button")
  );

  const amountAndType = document.createElement("div");
  amountAndType.className = "transaction-amount-group";
  amountAndType.append(typeLabel, amount);
  row.append(main, amountAndType, actions);
  return row;
}

function renderTransactionList() {
  const visibleTransactions = getVisibleTransactions();
  const total = state.transactions.length;
  elements.transactionCount.textContent = total === visibleTransactions.length
    ? `${total} ${total === 1 ? "transaction" : "transactions"}`
    : `${visibleTransactions.length} of ${total} transactions`;

  if (visibleTransactions.length === 0) {
    const isFiltered = total > 0;
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `
      <span class="empty-state-icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none">
          <rect x="9" y="7" width="30" height="34" rx="7" />
          <path d="M17 17h14M17 24h14M17 31h8" />
          <path d="M33 32v8M29 36h8" />
        </svg>
      </span>
      <h3>${isFiltered ? "No matching transactions" : "No transactions yet"}</h3>
      <p>${isFiltered ? "Try changing your search or filters." : "Your activity will appear here once you add your first transaction."}</p>
    `;
    elements.transactionList.replaceChildren(empty);
    return;
  }

  const rows = visibleTransactions.map(createTransactionRow);
  elements.transactionList.replaceChildren(...rows);
}

function renderInsights() {
  const expenses = state.transactions.filter((transaction) => transaction.type === "expense");
  if (expenses.length === 0) {
    elements.insightsSection.hidden = false;
    elements.overviewEmpty.hidden = false;
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "insight-empty";
    emptyMessage.textContent = "Insights appear after your first expense.";
    elements.insightStats.replaceChildren(emptyMessage);
    elements.breakdownList.replaceChildren();
    return;
  }

  elements.insightsSection.hidden = false;
  elements.overviewEmpty.hidden = true;
  const categoryTotals = new Map();
  let expenseCents = 0;
  let highestExpenseCents = 0;

  expenses.forEach((transaction) => {
    const amountCents = toCents(transaction.amount);
    expenseCents += amountCents;
    highestExpenseCents = Math.max(highestExpenseCents, amountCents);
    categoryTotals.set(
      transaction.category,
      (categoryTotals.get(transaction.category) || 0) + amountCents
    );
  });

  const sortedCategories = [...categoryTotals.entries()].sort((first, second) => second[1] - first[1]);
  const topCategory = sortedCategories[0];
  const stats = [
    ["Top spending category", CATEGORIES[topCategory[0]]],
    ["Number of expenses", String(expenses.length)],
    ["Average expense", formatCurrency(expenseCents / expenses.length / 100)],
    ["Highest expense", formatCurrency(highestExpenseCents / 100)]
  ];
  elements.insightStats.replaceChildren(...stats.map(([label, value]) => {
    const item = document.createElement("div");
    item.className = "insight-stat";
    const labelElement = document.createElement("span");
    labelElement.className = "insight-stat-label";
    labelElement.textContent = label;
    const valueElement = document.createElement("strong");
    valueElement.className = "insight-stat-value";
    valueElement.textContent = value;
    item.append(labelElement, valueElement);
    return item;
  }));

  const breakdownRows = sortedCategories.map(([categoryId, amountCents]) => {
    const row = document.createElement("div");
    row.className = "breakdown-row";
    const heading = document.createElement("div");
    heading.className = "breakdown-row-heading";
    const label = document.createElement("span");
    label.textContent = CATEGORIES[categoryId];
    const value = document.createElement("strong");
    value.textContent = formatCurrency(amountCents / 100);
    heading.append(label, value);

    const track = document.createElement("div");
    track.className = "breakdown-track";
    track.setAttribute("role", "img");
    track.setAttribute("aria-label", `${CATEGORIES[categoryId]}: ${formatCurrency(amountCents / 100)}`);
    const bar = document.createElement("div");
    bar.className = "breakdown-bar";
    bar.style.setProperty("--bar-width", `${(amountCents / expenseCents) * 100}%`);
    track.append(bar);
    row.append(heading, track);
    return row;
  });
  elements.breakdownList.replaceChildren(...breakdownRows);
}

function render() {
  renderSummary();
  renderTransactionList();
  renderInsights();
}

function handleTransactionAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const row = button.closest(".transaction-row");
  const transaction = state.transactions.find((item) => item.id === row?.dataset.id);
  if (!transaction) {
    return;
  }

  if (button.dataset.action === "edit") {
    beginEditing(transaction);
    return;
  }

  state.deletingId = transaction.id;
  elements.deleteDialog.showModal();
}

function handleDeleteDialogClose() {
  if (elements.deleteDialog.returnValue !== "confirm" || !state.deletingId) {
    state.deletingId = null;
    return;
  }

  state.transactions = state.transactions.filter((transaction) => transaction.id !== state.deletingId);
  if (state.editingId === state.deletingId) {
    resetForm();
    announceForm("The transaction being edited was deleted.", "error");
  }
  state.deletingId = null;
  saveTransactions();
  render();
}

function setTodayDate() {
  elements.todayDate.dateTime = todayAsISODate();
  elements.todayDate.textContent = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date());
  elements.date.value = todayAsISODate();
}

elements.form.addEventListener("submit", handleFormSubmit);
elements.cancelEdit.addEventListener("click", () => {
  resetForm();
  clearFormFeedback();
});
elements.transactionList.addEventListener("click", handleTransactionAction);
elements.deleteDialog.addEventListener("close", handleDeleteDialogClose);
elements.search.addEventListener("input", renderTransactionList);
elements.typeFilter.addEventListener("change", renderTransactionList);
elements.categoryFilter.addEventListener("change", renderTransactionList);
elements.sortOrder.addEventListener("change", renderTransactionList);

setTodayDate();
render();
