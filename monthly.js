
document.addEventListener("DOMContentLoaded", () => {

    const months = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"
    ];

    const reportingYear = document.getElementById("reportingYear");
    const annualPeriodLabel = document.getElementById("annualPeriodLabel");
    const monthlyTableBody = document.getElementById("monthlyTableBody");

    const currentYear = new Date().getFullYear();

    // FOOTER YEAR
    document.getElementById("currentYear").textContent = currentYear;

    // REPORTING YEAR OPTIONS
    for (let year = currentYear; year >= currentYear - 10; year--) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        reportingYear.appendChild(option);
    }

    // PLACEHOLDER DATA
    // Real financial data will replace this later.
    function createEmptyMonthlyData() {
        return months.map(month => ({
            month,
            income: 0,
            cogs: 0,
            expenses: 0,
            profit: 0
        }));
    }

    let monthlyData = createEmptyMonthlyData();

    // CURRENCY FORMATTER
    function formatCurrency(amount) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(amount);
    }

    // ANNUAL TOTALS
    function calculateAnnualTotals(data) {
        return data.reduce((totals, month) => {
            totals.income += month.income;
            totals.cogs += month.cogs;
            totals.expenses += month.expenses;
            totals.profit += month.profit;
            return totals;
        }, {
            income: 0,
            cogs: 0,
            expenses: 0,
            profit: 0
        });
    }

    function updateAnnualOverview() {
        const totals = calculateAnnualTotals(monthlyData);

        document.getElementById("annualIncome").textContent =
            formatCurrency(totals.income);

        document.getElementById("annualCOGS").textContent =
            formatCurrency(totals.cogs);

        document.getElementById("annualExpenses").textContent =
            formatCurrency(totals.expenses);

        document.getElementById("annualProfit").textContent =
            formatCurrency(totals.profit);

        document.getElementById("footerIncome").textContent =
            formatCurrency(totals.income);

        document.getElementById("footerCOGS").textContent =
            formatCurrency(totals.cogs);

        document.getElementById("footerExpenses").textContent =
            formatCurrency(totals.expenses);

        document.getElementById("footerProfit").textContent =
            formatCurrency(totals.profit);

        const profitElements = [
            document.getElementById("annualProfit"),
            document.getElementById("footerProfit")
        ];

        profitElements.forEach(element => {
            element.classList.toggle("negative", totals.profit < 0);
            element.classList.toggle("positive", totals.profit > 0);
        });
    }

    // MONTHLY TABLE
    function renderMonthlyTable() {
        monthlyTableBody.innerHTML = "";

        monthlyData.forEach((data, index) => {

            const row = document.createElement("tr");
            row.className = "month-row";
            row.tabIndex = 0;
            row.setAttribute("role", "button");
            row.setAttribute("aria-expanded", "true");

            const detailId = `month-detail-${index}`;
            row.setAttribute("aria-controls", detailId);

            const profitClass =
                data.profit < 0 ? "negative" :
                data.profit > 0 ? "positive" : "";

            row.innerHTML = `
                <td>
                    <span class="month-name">
                        <i class="fa-solid fa-chevron-down"></i>
                        ${data.month}
                    </span>
                </td>
                <td>${formatCurrency(data.income)}</td>
                <td>${formatCurrency(data.cogs)}</td>
                <td>${formatCurrency(data.expenses)}</td>
                <td class="${profitClass}">
                    ${formatCurrency(data.profit)}
                </td>
            `;

            const detailRow = document.createElement("tr");
            detailRow.className = "detail-row";
            detailRow.id = detailId;

            detailRow.innerHTML = `
                <td colspan="5">
                    <div class="month-details">
                        <div class="detail-item">
                            <span>Gross Receipts / Sales</span>
                            <strong>${formatCurrency(0)}</strong>
                        </div>

                        <div class="detail-item">
                            <span>Other Income</span>
                            <strong>${formatCurrency(0)}</strong>
                        </div>

                        <div class="detail-item">
                            <span>Cost of Goods Sold</span>
                            <strong>${formatCurrency(data.cogs)}</strong>
                        </div>

                        <div class="detail-item">
                            <span>Operating Expenses</span>
                            <strong>${formatCurrency(data.expenses)}</strong>
                        </div>
                    </div>
                </td>
            `;

            function toggleMonth() {
                const isExpanded = row.getAttribute("aria-expanded") === "true";
                setExpanded(row, detailRow, !isExpanded);
            }

            row.addEventListener("click", toggleMonth);

            row.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggleMonth();
                }
            });

            monthlyTableBody.appendChild(row);
            monthlyTableBody.appendChild(detailRow);
        });

        updateAnnualOverview();
    }

    // EXPAND / COLLAPSE
    function setExpanded(row, detailRow, expanded) {
        row.setAttribute("aria-expanded", String(expanded));
        detailRow.hidden = !expanded;

        const icon = row.querySelector(".month-name i");

        icon.className = expanded
            ? "fa-solid fa-chevron-down"
            : "fa-solid fa-chevron-right";
    }

    document.getElementById("expandAllBtn").addEventListener("click", () => {
        document.querySelectorAll(".month-row").forEach(row => {
            const detailRow = document.getElementById(
                row.getAttribute("aria-controls")
            );

            setExpanded(row, detailRow, true);
        });
    });

    document.getElementById("collapseAllBtn").addEventListener("click", () => {
        document.querySelectorAll(".month-row").forEach(row => {
            const detailRow = document.getElementById(
                row.getAttribute("aria-controls")
            );

            setExpanded(row, detailRow, false);
        });
    });

    // YEAR CHANGE
    reportingYear.addEventListener("change", () => {
        annualPeriodLabel.textContent = reportingYear.value;

        // Placeholder until transaction storage is connected.
        monthlyData = createEmptyMonthlyData();
        renderMonthlyTable();
    });

    // PRINT / SAVE PDF
    document.getElementById("printReportBtn").addEventListener("click", () => {
        window.print();
    });

    // LOGOUT PLACEHOLDER
    // Authentication handling will be connected later.
    document.getElementById("logoutBtn").addEventListener("click", () => {
        alert("Logout functionality will be connected to authentication.");
    });

    // INITIAL LOAD
    annualPeriodLabel.textContent = reportingYear.value;
    renderMonthlyTable();

});