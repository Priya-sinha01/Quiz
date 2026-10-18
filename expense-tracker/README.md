# Expense Tracker

A polished personal finance dashboard for tracking income, expenses, transactions, and spending patterns.

## 1. Overview

Expense Tracker is a responsive, dark-themed dashboard for recording personal transactions and understanding spending at a glance. It calculates available balance from saved income and expenses, and presents expense categories with summary insights.

## 2. Features

- Track income and expenses in Indian rupees.
- View available balance, total income, and total expenses.
- Add, edit, and delete transactions, with confirmation before deletion.
- Search transactions by description and filter by type or category.
- Sort transaction history by newest or oldest date.
- Persist transactions in browser `localStorage`.
- View spending insights, including the top category, expense count, average expense, and highest expense.
- Explore a category breakdown visualization based on recorded expenses.
- Use the dashboard on desktop, tablet, and mobile layouts.
- Navigate semantic forms and controls with keyboard support, visible focus styles, descriptive labels, and status announcements.

## 3. Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser `localStorage`

No frameworks, external libraries, or APIs are required.

## 4. Project Structure

```text
expense-tracker/
├── index.html   # Dashboard structure and form
├── style.css    # Theme, layout, and responsive styling
├── script.js    # Transactions, calculations, filters, and persistence
└── README.md    # Project documentation
```

## 5. How to Run Locally

1. Open `expense-tracker/index.html` in a modern web browser.
2. Add transactions using the form. Your entries are saved in that browser’s local storage.

If your browser restricts local storage for files opened directly, open the folder with a local static file server instead.

## 6. What I Learned

- Managing application state and implementing create, edit, and delete workflows with vanilla JavaScript.
- Persisting and validating structured data with browser local storage.
- Deriving financial summaries and spending breakdowns from transaction data.
- Building responsive layouts and accessible, keyboard-friendly form controls.

## 7. Future Improvements

- Add date-range summaries and spending comparisons.
- Support transaction export and import.
- Add optional budgets and spending targets.
