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


// Profit/Loss color logic
const profitLossAmount = document.getElementById("profitLossAmount");

if (profitLossAmount) {
    const value = parseFloat(profitLossAmount.textContent.replace(/[$,]/g, ""));

    profitLossAmount.classList.remove("profit", "loss", "neutral");

    if (value > 0) {
        profitLossAmount.classList.add("profit");
    } else if (value < 0) {
        profitLossAmount.classList.add("loss");
    } else {
        profitLossAmount.classList.add("neutral");
    }
}


// Upload button placeholder
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
        },
        error: function(error) {
            console.error("CSV Parse Error:", error);
        }
    });
});
}

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

// TEMPORARY SAMPLE TOTALS
// Later these will come from uploaded transactions
const expenseTotals = {};


const expenseList = document.getElementById("expenseList");
if (expenseList) {
    expenseList.innerHTML = "";
    const sortedCategories = expenseCategories
        .map(category => ({
            name: category,
            amount: expenseTotals[category] || 0
        }))
        .sort((a, b) => b.amount - a.amount);

    sortedCategories.forEach((category, index) => {
        const item = document.createElement("div");

        item.classList.add("expense-item");

        if (index >= 5) {
            item.classList.add("hidden-expense");
        }

        item.innerHTML = `
            <div class="expense-info">
                <span>${category.name}</span>
                <strong>$${category.amount.toFixed(2)}</strong>
            </div>

            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        `;

        expenseList.appendChild(item);
    });
}