// Automatic greeting
const greetingText = document.getElementById("greetingText");

if (greetingText) {
    const hour = new Date().getHours();

    if (hour < 12) {
        greetingText.textContent = "Good Morning";
    } else if (hour < 18) {
        greetingText.textContent = "Good Afternoon";
    } else {
        greetingText.textContent = "Good Evening";
    }
}

// Highlight active sidebar link when clicked
const sidebarLinks = document.querySelectorAll(".sidebar-nav a");

sidebarLinks.forEach(link => {
    link.addEventListener("click", () => {
        sidebarLinks.forEach(item => item.classList.remove("active-link"));
        link.classList.add("active-link");
    });
});

// Expense categories
const expenseCategories = [
    "Advertising & Marketing",
    "Car & Truck Expenses",
    "Commissions & Fees",
    "Contract Labor",
    "Dues & Subscriptions",
    "Insurance (Non-Health)",
    "Interest",
    "Legal & Professional Services",
    "Meals",
    "Office Expenses",
    "Other Expenses",
    "Property Rent / Lease",
    "Vehicle Rent / Lease",
    "Repairs & Maintenance",
    "Supplies",
    "Taxes & Licenses",
    "Travel",
    "Utilities",
    "Wages",
    "Home Office",
    "Equipment & Software",
    "Bank Fees",
    "Education & Training",
    "Shipping & Postage",
    "Telephone & Internet"
];

const columnAliases = {
    date: [
        "date",
        "transaction date",
        "trans date",
        "trans. date",
        "posted date",
        "post date",
        "posting date"
    ],
    description: [
        "description",
        "transaction description",
        "memo",
        "name",
        "payee",
        "merchant",
        "details",
        "extended details",
        "appears on your statement as"
    ],
    amount: [
        "amount",
        "transaction amount",
        "net amount"
    ],
    debit: [
        "debit",
        "debits",
        "withdrawal",
        "withdrawals",
        "charge",
        "charges",
        "money out",
        "money outflow"
    ],
    credit: [
        "credit",
        "credits",
        "deposit",
        "deposits",
        "payment",
        "payments",
        "money in",
        "money inflow"
    ]
};

function normalizeHeader(header) {
    return String(header || "")
        .toLowerCase()
        .replace(/[._-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function aliasMatches(cell, aliases) {
    const normalizedCell = normalizeHeader(cell);

    return aliases.some(alias =>
        normalizeHeader(alias) === normalizedCell
    );
}

function getField(row, aliases) {
    const keys = Object.keys(row);

    const matchedKey = keys.find(key =>
        aliases.includes(normalizeHeader(key))
    );

    return matchedKey ? row[matchedKey] : "";
}

function cleanMoney(value) {
    if (value === null || value === undefined || value === "") return 0;

    let text = String(value)
        .replace(/[$,]/g, "")
        .trim();

    if (text.startsWith("(") && text.endsWith(")")) {
        text = "-" + text.slice(1, -1);
    }

    return parseFloat(text) || 0;
}

function formatCurrency(amount) {
    return `$${Number(amount || 0).toFixed(2)}`;
}

function getTransactionAmount(row) {
    const debit = cleanMoney(getField(row, columnAliases.debit));
    const credit = cleanMoney(getField(row, columnAliases.credit));
    const amount = cleanMoney(getField(row, columnAliases.amount));
    const description = String(getField(row, columnAliases.description)).toLowerCase();

    if (debit !== 0 || credit !== 0) {
        if (debit !== 0) return -Math.abs(debit);
        if (credit !== 0) return Math.abs(credit);
    }

    if (amount !== 0) {
        const looksLikeIncome =
            description.includes("deposit") ||
            description.includes("payment received") ||
            description.includes("direct deposit") ||
            description.includes("payroll") ||
            description.includes("refund") ||
            description.includes("credit");

        const looksLikePaymentToCard =
            description.includes("payment") &&
            !description.includes("payment received");

        if (amount < 0) return amount;
        if (looksLikeIncome) return Math.abs(amount);
        if (looksLikePaymentToCard) return Math.abs(amount);

        return -Math.abs(amount);
    }

    return 0;
}

const merchantRules = {
    "openai": "Equipment & Software",
    "chatgpt": "Equipment & Software",
    "adobe": "Equipment & Software",
    "canva": "Equipment & Software",
    "marblism": "Equipment & Software",
    "microsoft": "Equipment & Software",
    "google": "Equipment & Software",

    "coursera": "Education & Training",
    "udemy": "Education & Training",

    "burger king": "Meals",
    "golden corral": "Meals",
    "mcdonald": "Meals",
    "wendy": "Meals",
    "subway": "Meals",
    "restaurant": "Meals",
    "cafe": "Meals",
    "coffee": "Meals",

    "xfinity": "Telephone & Internet",
    "comcast": "Telephone & Internet",
    "verizon": "Telephone & Internet",

    "office depot": "Office Expenses",
    "staples": "Office Expenses",

    "service fee": "Bank Fees",
    "bank fee": "Bank Fees"
};

function categorizeTransaction(description, amount) {
    const text = String(description || "").toLowerCase();

    if (amount > 0) return "Income";

    for (const merchant in merchantRules) {
        if (text.includes(merchant)) {
            return merchantRules[merchant];
        }
    }

    return "Other Expenses";
}

function normalizeTransaction(row) {
    const amount = getTransactionAmount(row);

    const description = getField(row, columnAliases.description);
    const date = getField(row, columnAliases.date);

    return {
        date: date || "No date",
        description: description || "No description",
        category: categorizeTransaction(description, amount),
        amount: amount
    };
}

function hasDetectableColumns(row) {
    const hasDate = getField(row, columnAliases.date);
    const hasDescription = getField(row, columnAliases.description);
    const hasAmount = getField(row, columnAliases.amount);
    const hasDebit = getField(row, columnAliases.debit);
    const hasCredit = getField(row, columnAliases.credit);

    return hasDate && hasDescription && (hasAmount || hasDebit || hasCredit);
}

function renderTransactions(transactions) {
    const tableBody = document.querySelector(".transactions-section tbody");

    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (!transactions.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    No transactions uploaded yet.
                </td>
            </tr>
        `;
        return;
    }

    transactions.slice(0, 10).forEach(transaction => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.description}</td>
            <td>${transaction.category}</td>
            <td>${formatCurrency(transaction.amount)}</td>
        `;

        tableBody.appendChild(row);
    });
}

function updateDashboardTotals(transactions) {
    const cards = document.querySelectorAll(".overview-cards .card h3");

    const totalIncome = transactions
        .filter(transaction => transaction.amount > 0)
        .reduce((sum, transaction) => sum + transaction.amount, 0);

    const totalExpenses = transactions
        .filter(transaction => transaction.amount < 0)
        .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

    const profitLoss = totalIncome - totalExpenses;

    if (cards[0]) cards[0].textContent = formatCurrency(totalIncome);
    if (cards[1]) cards[1].textContent = formatCurrency(totalExpenses);
    if (cards[2]) cards[2].textContent = formatCurrency(profitLoss);
    if (cards[3]) cards[3].textContent = transactions.length;

    const profitLossAmount = document.getElementById("profitLossAmount");

    if (profitLossAmount) {
        profitLossAmount.classList.remove("profit", "loss", "neutral");

        if (profitLoss > 0) {
            profitLossAmount.classList.add("profit");
        } else if (profitLoss < 0) {
            profitLossAmount.classList.add("loss");
        } else {
            profitLossAmount.classList.add("neutral");
        }
    }
}

function updateExpenseSummary(transactions) {
    const expenseList = document.getElementById("expenseList");

    if (!expenseList) return;

    const expenseTotals = {};

    expenseCategories.forEach(category => {
        expenseTotals[category] = 0;
    });

    transactions.forEach(transaction => {
        if (transaction.amount < 0) {
            const category = transaction.category || "Other Expenses";

            if (!expenseTotals[category]) {
                expenseTotals[category] = 0;
            }

            expenseTotals[category] += Math.abs(transaction.amount);
        }
    });

    const sortedCategories = Object.keys(expenseTotals)
        .map(category => ({
            name: category,
            amount: expenseTotals[category]
        }))
        .sort((a, b) => b.amount - a.amount);

    const highestExpense = sortedCategories[0]?.amount || 0;

    expenseList.innerHTML = "";

    sortedCategories.forEach((category, index) => {
        const item = document.createElement("div");

        item.classList.add("expense-item");

        if (index >= 5) {
            item.classList.add("hidden-expense");
        }

        const percentage = highestExpense > 0
            ? (category.amount / highestExpense) * 100
            : 0;

        item.innerHTML = `
            <div class="expense-info">
                <span>${category.name}</span>
                <strong>${formatCurrency(category.amount)}</strong>
            </div>

            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%;"></div>
            </div>
        `;

        expenseList.appendChild(item);
    });
}

function resetDashboard() {
    renderTransactions([]);
    updateDashboardTotals([]);
    updateExpenseSummary([]);
}

updateExpenseSummary([]);

// Upload and parse CSV
const uploadStatementBtn = document.getElementById("uploadStatementBtn");
const statementUpload = document.getElementById("statementUpload");

if (uploadStatementBtn && statementUpload) {
    uploadStatementBtn.addEventListener("click", () => {
        statementUpload.click();
    });

    statementUpload.addEventListener("change", () => {
        const file = statementUpload.files[0];

        if (!file) return;

        const fileName = file.name.toLowerCase();

        if (!fileName.endsWith(".csv")) {
            alert("Please upload a CSV file. PDF uploads will need a separate parser later.");
            statementUpload.value = "";
            return;
        }

        Papa.parse(file, {
            header: false,
            skipEmptyLines: true,

            complete: function(results) {
                const rawRows = results.data.filter(row =>
                    row.some(cell => String(cell || "").trim() !== "")
                );

                if (!rawRows.length) {
                    alert("No transactions were found in this file.");
                    resetDashboard();
                    return;
                }

                const headerIndex = rawRows.findIndex(row => {
                    const hasDate = row.some(cell =>
                        aliasMatches(cell, columnAliases.date)
                        );

                    const hasDescription = row.some(cell =>
                        aliasMatches(cell, columnAliases.description)
                        );

                    const hasAmount = row.some(cell =>
                        aliasMatches(cell, columnAliases.amount)
                        );

                    const hasDebitOrCredit = row.some(cell =>
                        aliasMatches(cell, columnAliases.debit) ||
                        aliasMatches(cell, columnAliases.credit)
                        );

                    return hasDate && hasDescription && (hasAmount || hasDebitOrCredit);
                });

                if (headerIndex === -1) {
                    alert("FinFlow could not find a transaction table in this CSV.");
                    console.log("CSV rows checked:", rawRows);
                    resetDashboard();
                    return;
                }

                const headers = rawRows[headerIndex];
                const transactionRows = rawRows.slice(headerIndex + 1);

                const rows = transactionRows
                    .map(row => {
                        const obj = {};

                        headers.forEach((header, index) => {
                            obj[header] = row[index] || "";
                        });

                        return obj;
                    })
                    .filter(row => {
                        const description = getField(row, columnAliases.description);
                        const amount = getField(row, columnAliases.amount);
                        const debit = getField(row, columnAliases.debit);
                        const credit = getField(row, columnAliases.credit);

                        return description && (amount || debit || credit);
                    });

                const transactions = rows
                    .map(normalizeTransaction)
                    .filter(transaction => transaction.amount !== 0);

                if (!transactions.length) {
                    alert("The transaction table was found, but no valid transaction amounts were detected.");
                    resetDashboard();
                    return;
                }

                console.log("Detected Header Row:", headers);
                console.log("Rows Used:", rows);
                console.log("Normalized Transactions:", transactions);

                renderTransactions(transactions);
                updateDashboardTotals(transactions);
                updateExpenseSummary(transactions);
            },

            error: function(error) {
                console.error("CSV Parse Error:", error);
                alert("There was a problem reading this CSV file.");
            }
        });
    });
}

const toggleExpensesBtn = document.getElementById("toggleExpensesBtn");

if (toggleExpensesBtn) {
    toggleExpensesBtn.addEventListener("click", () => {
        const hiddenExpenses = document.querySelectorAll(".hidden-expense");

        hiddenExpenses.forEach(item => {
            item.classList.toggle("show-expense");
        });

        const isExpanded = toggleExpensesBtn.textContent === "Show fewer categories";

        toggleExpensesBtn.textContent = isExpanded
            ? "View all categories"
            : "Show fewer categories";
    });
}