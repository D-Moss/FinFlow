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


// Format money
function formatCurrency(amount) {
    return `$${Number(amount || 0).toFixed(2)}`;
}


// Get amount safely from CSV row
function getTransactionAmount(row) {
    const rawAmount =
        row.Amount ||
        row.amount ||
        row.TransactionAmount ||
        row["Transaction Amount"] ||
        row.Debit ||
        row.Credit ||
        "0";

    return parseFloat(String(rawAmount).replace(/[$,]/g, "")) || 0;
}


// Normalize CSV row
function normalizeTransaction(row) {
    return {
        date: row.Date || row.date || row["Transaction Date"] || "",
        description: row.Description || row.description || row.Memo || row.Name || "",
        category: row.Category || row.category || "Other Expenses",
        amount: getTransactionAmount(row)
    };
}


// Render recent transactions table
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


// Update dashboard cards
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


// Update expense summary
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


// Initial empty expense summary
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

        console.log("Selected file:", file.name);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,

            complete: function(results) {
                console.log("Parsed CSV Data:", results.data);

                const transactions = results.data.map(normalizeTransaction);

                console.log("Normalized Transactions:", transactions);

                renderTransactions(transactions);
                updateDashboardTotals(transactions);
                updateExpenseSummary(transactions);
            },

            error: function(error) {
                console.error("CSV Parse Error:", error);
            }
        });
    });
}


// View all categories button
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