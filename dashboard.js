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
const uploadButton = document.querySelector(".upload-box button");

if (uploadButton) {
    uploadButton.addEventListener("click", () => {
        alert("Upload feature coming soon.");
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

const expenseTotals = {
    "Advertising & Marketing": 164,
    "Office Expenses": 382,
    "Equipment & Software": 293.85,
    "Utilities": 1734.62
};

// TEMPORARY SAMPLE TOTALS
// Later these will come from uploaded transactions
const expenseTotals = {
    "Advertising & Marketing": 164,
    "Office Expenses": 382,
    "Equipment & Software": 293.85,
    "Utilities": 1734.62
};


const expenseList = document.getElementById("expenseList");
if (expenseList) {
    expenseCategories.forEach(category => {
        const amount = expenseTotals[category] || 0;
        const item = document.createElement("div");
        item.classList.add("expense-item");
        item.innerHTML = `
            <div class="expense-info">
                <span>${category}</span>
                <strong>$${amount.toFixed(2)}</strong>
            </div>

            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        `;
        expenseList.appendChild(item);
    });
}