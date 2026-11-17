/* =========================================
   FINFLOW — INCOME & EXPENSE REPORT
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const reportingYear = document.getElementById("reportingYear");
    const periodSelect = document.getElementById("periodSelect");
    const periodLabel = document.getElementById("periodLabel");

    const expandAllBtn = document.getElementById("expandAll");
    const collapseAllBtn = document.getElementById("collapseAll");
    const printReportBtn = document.getElementById("printReportBtn");

    const currentYear = new Date().getFullYear();


    /* =====================================
       REPORTING YEAR OPTIONS
       ===================================== */

    reportingYear.innerHTML = "";

    for (let year = currentYear; year >= currentYear - 10; year--) {

        const option = document.createElement("option");

        option.value = year;
        option.textContent = year;

        reportingYear.appendChild(option);

    }

    reportingYear.value = currentYear;


    /* =====================================
       REPORTING PERIOD LABEL
       ===================================== */

    function updatePeriodLabel() {

        const selectedYear = reportingYear.value;

        const selectedPeriod =
            periodSelect.options[periodSelect.selectedIndex].text;

        if (periodSelect.value === "year") {

            periodLabel.textContent = `Full Year — ${selectedYear}`;

        } else {

            periodLabel.textContent = `${selectedPeriod} ${selectedYear}`;

        }

    }


    /* =====================================
       REPORT FILTER EVENTS
       ===================================== */

    reportingYear.addEventListener("change", () => {

        updatePeriodLabel();
        updateReport();

    });

    periodSelect.addEventListener("change", () => {

        updatePeriodLabel();
        updateReport();

    });


    /* =====================================
       CURRENCY FORMATTER
       ===================================== */

    function formatCurrency(amount) {

        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(amount);

    }


    /* =====================================
       REPORT CALCULATIONS
       ===================================== */

    function calculateReportTotals(data) {

        const totalIncome = data.grossReceipts + data.otherIncome;

        const grossProfit = totalIncome - data.cogs;

        const totalExpenses = data.cogs + data.operatingExpenses;

        const netProfit = totalIncome - totalExpenses;

        return {
            totalIncome,
            grossProfit,
            totalExpenses,
            netProfit
        };

    }


    /* =====================================
       UPDATE FINANCIAL OVERVIEW
       ===================================== */

    function updateFinancialOverview(totals) {

        document.getElementById("incomeCard").textContent =
            formatCurrency(totals.totalIncome);

        document.getElementById("expenseCard").textContent =
            formatCurrency(totals.totalExpenses);

        const profitCard = document.getElementById("profitCard");

        profitCard.textContent =
            formatCurrency(totals.netProfit);

        profitCard.classList.remove(
            "positive",
            "negative",
            "neutral"
        );

        if (totals.netProfit > 0) {

            profitCard.classList.add("positive");

        } else if (totals.netProfit < 0) {

            profitCard.classList.add("negative");

        } else {

            profitCard.classList.add("neutral");

        }

    }


    /* =====================================
       UPDATE REPORT
       ===================================== */

    function updateReport() {

        // Placeholder data until transaction
        // storage and business profiles are connected.

        const reportData = {

            grossReceipts: 0,
            otherIncome: 0,
            cogs: 0,
            operatingExpenses: 0

        };

        const totals = calculateReportTotals(reportData);

        updateFinancialOverview(totals);

    }


    /* =====================================
       EXPANDABLE REPORT CATEGORIES
       ===================================== */

    function setCategoryExpanded(button, expanded) {

        const targetId = button.getAttribute("aria-controls");

        if (!targetId) return;

        const subcategories = document.getElementById(targetId);

        if (!subcategories) return;

        button.setAttribute(
            "aria-expanded",
            String(expanded)
        );

        subcategories.hidden = !expanded;

        const icon = button.querySelector("i");

        if (icon) {

            icon.classList.toggle(
                "fa-chevron-down",
                expanded
            );

            icon.classList.toggle(
                "fa-chevron-right",
                !expanded
            );

        }

    }


    /* =====================================
       INDIVIDUAL CATEGORY TOGGLE
       ===================================== */

    document.addEventListener("click", event => {

        const button = event.target.closest(".category-toggle");

        if (!button) return;

        const isExpanded =
            button.getAttribute("aria-expanded") === "true";

        setCategoryExpanded(button, !isExpanded);

    });


    /* =====================================
       EXPAND ALL
       ===================================== */

    expandAllBtn.addEventListener("click", () => {

        document.querySelectorAll(".category-toggle")
            .forEach(button => {

                setCategoryExpanded(button, true);

            });

    });


    /* =====================================
       COLLAPSE ALL
       ===================================== */

    collapseAllBtn.addEventListener("click", () => {

        document.querySelectorAll(".category-toggle")
            .forEach(button => {

                setCategoryExpanded(button, false);

            });

    });


    /* =====================================
       PRINT / SAVE PDF
       ===================================== */

    printReportBtn.addEventListener("click", () => {

        // Remove this restriction once real
        // financial report data is connected.

        alert(
            "Printing will be available once financial data is connected."
        );

    });


    /* =====================================
       INITIAL PAGE LOAD
       ===================================== */

    updatePeriodLabel();

    updateReport();

});