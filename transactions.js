
// =====================================
// FINFLOW - TRANSACTIONS
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // TRANSACTION DATA & PAGE STATE
    // =====================================

    let transactions = [];
    let categories = [];
    let businesses = [];
    let accounts = [];

    // Administrator permissions will be
    // supplied by authentication later.

    let isAdmin = false;

    let currentPage = 1;
    let expandedTransactionId = null;
    let selectedTransactions = new Set();
    let appliedDateRange = null;
    let notificationTimer;

    const currentYear = new Date().getFullYear();


    // =====================================
    // DOM ELEMENTS
    // =====================================

    const getElement = id => document.getElementById(id);

    const clientSelect = getElement("transactionClientSelect");
    const businessSelect = getElement("transactionBusinessSelect");
    const yearSelect = getElement("transactionYear");
    const periodSelect = getElement("transactionPeriod");

    const customDateRange = getElement("customDateRange");
    const startDateInput = getElement("transactionStartDate");
    const endDateInput = getElement("transactionEndDate");
    const applyDateRangeBtn = getElement("applyDateRangeBtn");

    const searchInput = getElement("transactionSearch");
    const accountFilter = getElement("transactionAccountFilter");
    const categoryFilter = getElement("transactionCategoryFilter");
    const typeFilter = getElement("transactionTypeFilter");
    const reviewFilter = getElement("transactionReviewFilter");
    const sortSelect = getElement("transactionSort");

    const clearFiltersBtn = getElement("clearTransactionFiltersBtn");

    const tableBody = getElement("transactionsTableBody");
    const rowTemplate = getElement("transactionRowTemplate");
    const detailsTemplate = getElement("transactionDetailsTemplate");

    const selectAllCheckbox = getElement("selectAllTransactions");
    const bulkReviewBtn = getElement("bulkReviewBtn");

    const perPageSelect = getElement("transactionsPerPage");
    const previousPageBtn = getElement("previousTransactionPage");
    const nextPageBtn = getElement("nextTransactionPage");

    const notification = getElement("transactionNotification");


    // =====================================
    // FORMAT CURRENCY
    // =====================================

    function formatCurrency(amount) {

        const numericAmount = Number(amount);

        if (!Number.isFinite(numericAmount)) {
            return "—";
        }

        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(numericAmount);

    }


    // =====================================
    // FORMAT DATE
    // =====================================

    function formatDate(value) {

        if (!value) return "—";

        const dateString = String(value).slice(0, 10);

        const date = new Date(dateString + "T00:00:00");

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });

    }


    // =====================================
    // NORMALIZE VALUES
    // =====================================

    function normalize(value) {

        return String(value ?? "")
            .trim()
            .toLowerCase();

    }


    // =====================================
    // NOTIFICATIONS
    // =====================================

    function showNotification(message, type = "") {

        if (!notification) return;

        clearTimeout(notificationTimer);

        notification.textContent = message;

        notification.classList.remove(
            "success",
            "error",
            "warning"
        );

        if (type) {
            notification.classList.add(type);
        }

        notification.hidden = false;

        notificationTimer = setTimeout(() => {

            notification.hidden = true;

        }, 4500);

    }


    // =====================================
    // AUTOMATIC FOOTER YEAR
    // =====================================

    const footerYear = getElement("currentYear");

    if (footerYear) {

        footerYear.textContent = currentYear;

    }


    // =====================================
    // POPULATE REPORTING YEARS
    // =====================================

    function populateYears() {

        if (!yearSelect) return;

        const selectedYear =
            yearSelect.value || String(currentYear);

        const availableYears = new Set();

        for (
            let year = currentYear;
            year >= currentYear - 10;
            year--
        ) {

            availableYears.add(year);

        }

        transactions.forEach(transaction => {

            const year = Number(
                String(transaction.date || "").slice(0, 4)
            );

            if (Number.isInteger(year) && year > 1900) {

                availableYears.add(year);

            }

        });

        yearSelect.replaceChildren();

        [...availableYears]
            .sort((a, b) => b - a)
            .forEach(year => {

                const option = document.createElement("option");

                option.value = String(year);
                option.textContent = year;

                yearSelect.appendChild(option);

            });

        yearSelect.value = availableYears.has(Number(selectedYear))
            ? selectedYear
            : String(currentYear);

    }

    populateYears();


    // =====================================
    // REPORTING PERIOD
    // =====================================

    function updateReportingPeriod() {

        const isCustom = periodSelect.value === "custom";

        customDateRange.hidden = !isCustom;

        yearSelect.disabled = isCustom;

        if (!isCustom) {

            appliedDateRange = null;

        }

        resetPageAndRender();

    }

    periodSelect.addEventListener(
        "change",
        updateReportingPeriod
    );

    yearSelect.addEventListener(
        "change",
        resetPageAndRender
    );


    // =====================================
    // APPLY CUSTOM DATE RANGE
    // =====================================

    applyDateRangeBtn.addEventListener("click", () => {

        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        if (!startDate || !endDate) {

            showNotification(
                "Please select both a start date and an end date.",
                "error"
            );

            return;

        }

        if (startDate > endDate) {

            showNotification(
                "The start date cannot be after the end date.",
                "error"
            );

            return;

        }

        appliedDateRange = {
            startDate,
            endDate
        };

        resetPageAndRender();

    });


    // =====================================
    // QUESTION STATUS
    // =====================================

    function hasOpenQuestion(transaction) {

        const status = normalize(
            transaction.questionStatus
        );

        return Boolean(
            transaction.flagged ||
            (
                status &&
                status !== "resolved"
            ) ||
            (
                String(transaction.question || "").trim() &&
                status !== "resolved"
            )
        );

    }


    // =====================================
    // TRANSACTION REVIEW STATUS
    // =====================================

    function getReviewStatus(transaction) {

        if (hasOpenQuestion(transaction)) {

            return {
                value: "question",
                label: "Open Question"
            };

        }

        if (transaction.reviewed === true) {

            return {
                value: "reviewed",
                label: "Reviewed"
            };

        }

        return {
            value: "unreviewed",
            label: "Not Reviewed"
        };

    }


    // =====================================
    // FILTER BY CLIENT & REPORTING PERIOD
    // =====================================

    function getContextTransactions() {

        const clientId = clientSelect.value;
        const businessId = businessSelect.value;
        const year = yearSelect.value;
        const period = periodSelect.value;

        // Do not display transactions until
        // a client has been selected.

        if (!clientId) return [];

        return transactions.filter(transaction => {

            const date = String(
                transaction.date || ""
            ).slice(0, 10);

            const matchesClient =
                String(transaction.clientId) === clientId;

            const matchesBusiness =
                businessId === "all" ||
                String(transaction.businessId) === businessId;

            let matchesDate = false;

            if (period === "custom") {

                if (!appliedDateRange) return false;

                matchesDate =
                    date >= appliedDateRange.startDate &&
                    date <= appliedDateRange.endDate;

            } else {

                matchesDate = date.slice(0, 4) === year;

                if (period !== "all") {

                    matchesDate =
                        matchesDate &&
                        date.slice(5, 7) === period;

                }

            }

            return (
                matchesClient &&
                matchesBusiness &&
                matchesDate
            );

        });

    }


    // =====================================
    // FILTER TRANSACTIONS
    // =====================================

    function getFilteredTransactions() {

        const searchTerm = normalize(searchInput.value);

        const selectedAccount = accountFilter.value;
        const selectedCategory = categoryFilter.value;
        const selectedType = typeFilter.value;
        const selectedReview = reviewFilter.value;

        const filtered = getContextTransactions().filter(
            transaction => {

                const searchableText = [

                    transaction.vendor,
                    transaction.description,
                    transaction.originalDescription,
                    transaction.detailedCategory,
                    transaction.taxCategory,
                    transaction.amount,
                    formatCurrency(transaction.amount),
                    transaction.businessName,
                    transaction.date

                ].map(normalize).join(" ");

                const matchesSearch =
                    searchableText.includes(searchTerm);

                const matchesAccount =
                    selectedAccount === "all" ||
                    String(transaction.accountId) ===
                    selectedAccount;

                const matchesCategory =
                    selectedCategory === "all" ||
                    String(transaction.detailedCategoryId) ===
                    selectedCategory;

                const matchesType =
                    selectedType === "all" ||
                    normalize(transaction.categoryType) ===
                    selectedType;

                let matchesReview =
                    selectedReview === "all";

                if (selectedReview === "question") {

                    matchesReview =
                        hasOpenQuestion(transaction);

                } else if (selectedReview === "reviewed") {

                    matchesReview =
                        transaction.reviewed === true &&
                        !hasOpenQuestion(transaction);

                } else if (selectedReview === "unreviewed") {

                    matchesReview =
                        transaction.reviewed !== true ||
                        hasOpenQuestion(transaction);

                }

                return (
                    matchesSearch &&
                    matchesAccount &&
                    matchesCategory &&
                    matchesType &&
                    matchesReview
                );

            }
        );

        return sortTransactions(filtered);

    }


    // =====================================
    // SORT TRANSACTIONS
    // =====================================

    function sortTransactions(items) {

        const sorted = [...items];

        switch (sortSelect.value) {

            case "oldest":

                sorted.sort((a, b) =>
                    String(a.date).localeCompare(
                        String(b.date)
                    )
                );

                break;

            case "highest":

                sorted.sort((a, b) =>
                    Math.abs(Number(b.amount)) -
                    Math.abs(Number(a.amount))
                );

                break;

            case "lowest":

                sorted.sort((a, b) =>
                    Math.abs(Number(a.amount)) -
                    Math.abs(Number(b.amount))
                );

                break;

            case "vendor":

                sorted.sort((a, b) =>
                    normalize(a.vendor).localeCompare(
                        normalize(b.vendor)
                    )
                );

                break;

            default:

                sorted.sort((a, b) =>
                    String(b.date).localeCompare(
                        String(a.date)
                    )
                );

        }

        return sorted;

    }


    // =====================================
    // UPDATE TRANSACTION OVERVIEW
    // =====================================

    function updateOverview() {

        const contextTransactions =
            getContextTransactions();

        let incomeCents = 0;
        let expenseCents = 0;
        let needsReview = 0;

        contextTransactions.forEach(transaction => {

            const amount = Number(transaction.amount);

            const type = normalize(
                transaction.categoryType
            );

            if (Number.isFinite(amount)) {

                const cents = Math.round(amount * 100);

                // Positive amounts represent inflows.
                // Negative amounts represent outflows.
                // Refunds reduce the applicable total.

                if (type === "income") {

                    incomeCents += cents;

                } else if (type === "expense") {

                    expenseCents -= cents;

                }

            }

            // Transfers and personal transactions
            // are excluded from income and expenses.

            if (
                transaction.reviewed !== true ||
                hasOpenQuestion(transaction)
            ) {

                needsReview++;

            }

        });

        getElement("transactionIncomeTotal").textContent =
            formatCurrency(incomeCents / 100);

        getElement("transactionExpenseTotal").textContent =
            formatCurrency(expenseCents / 100);

        getElement("transactionCount").textContent =
            contextTransactions.length.toLocaleString();

        getElement("transactionReviewCount").textContent =
            needsReview.toLocaleString();

    }


    // =====================================
    // SET TEMPLATE FIELD VALUES
    // =====================================

    function setField(container, field, value) {

        const element = container.querySelector(
            `[data-field="${field}"]`
        );

        if (element) {

            element.textContent =
                value === null ||
                value === undefined ||
                value === ""
                    ? "—"
                    : value;

        }

    }


    // =====================================
    // ADMINISTRATOR DISPLAY CONTROLS
    // =====================================

    function applyAdminControls(container = document) {

        container.querySelectorAll(".admin-only")
            .forEach(element => {

                element.hidden = !isAdmin;

            });

        container.querySelectorAll(".bookkeeping-fields")
            .forEach(fieldset => {

                fieldset.disabled = !isAdmin;

            });

    }


    // =====================================
    // CREATE EMPTY TABLE ROW
    // =====================================

    function renderEmptyState(hasContextTransactions) {

        const row = document.createElement("tr");

        row.id = "transactionEmptyRow";

        const cell = document.createElement("td");

        cell.colSpan = isAdmin ? 8 : 7;
        cell.className = "empty-state";

        const icon = document.createElement("i");

        icon.className = "fa-solid fa-receipt";
        icon.setAttribute("aria-hidden", "true");

        const title = document.createElement("p");
        const description = document.createElement("span");

        if (
            periodSelect.value === "custom" &&
            !appliedDateRange
        ) {

            title.textContent = "Select a date range.";

            description.textContent =
                "Choose a start date and an end date, then apply the dates.";

        } else if (hasContextTransactions) {

            title.textContent =
                "No transactions match your filters.";

            description.textContent =
                "Try changing or clearing your filters.";

        } else {

            title.textContent =
                "No transactions to display.";

            description.textContent =
                "Uploaded transactions will appear here.";

        }

        cell.append(icon, title, description);

        if (
            !hasContextTransactions &&
            periodSelect.value !== "custom"
        ) {

            const uploadLink = document.createElement("a");

            uploadLink.href = "dashboard.html#upload-files";
            uploadLink.className = "primary-btn";
            uploadLink.textContent = "Upload Statements";

            cell.appendChild(uploadLink);

        }

        row.appendChild(cell);

        tableBody.appendChild(row);

    }


    // =====================================
    // PAGINATION
    // =====================================

    function getPagination(items) {

        const perPage = Number(perPageSelect.value) || 25;

        const totalPages = Math.max(
            1,
            Math.ceil(items.length / perPage)
        );

        currentPage = Math.min(
            Math.max(currentPage, 1),
            totalPages
        );

        const startIndex = (currentPage - 1) * perPage;

        return {

            totalPages,
            startIndex,
            perPage,

            displayedItems: items.slice(
                startIndex,
                startIndex + perPage
            )

        };

    }


    // =====================================
    // UPDATE PAGINATION CONTROLS
    // =====================================

    function updatePagination(items, pagination) {

        const {
            totalPages,
            startIndex,
            displayedItems
        } = pagination;

        previousPageBtn.disabled = currentPage <= 1;

        nextPageBtn.disabled = currentPage >= totalPages;

        getElement("transactionPageInfo").textContent =
            `Page ${currentPage} of ${totalPages}`;

        const countElement = getElement(
            "displayedTransactionCount"
        );

        if (!items.length) {

            countElement.textContent =
                "Showing 0 transactions";

        } else {

            const first = startIndex + 1;

            const last =
                startIndex + displayedItems.length;

            countElement.textContent =
                `Showing ${first}–${last} of ` +
                `${items.length.toLocaleString()} transactions`;

        }

    }


    // =====================================
    // UPDATE SELECTION CONTROLS
    // =====================================

    function updateSelectionControls() {

        const filtered = getFilteredTransactions();

        const displayed = getPagination(
            filtered
        ).displayedItems;

        const displayedIds = displayed.map(
            transaction => String(transaction.id)
        );

        const selectedDisplayed = displayedIds.filter(
            id => selectedTransactions.has(id)
        );

        selectAllCheckbox.checked =
            displayedIds.length > 0 &&
            selectedDisplayed.length === displayedIds.length;

        selectAllCheckbox.indeterminate =
            selectedDisplayed.length > 0 &&
            selectedDisplayed.length < displayedIds.length;

        selectAllCheckbox.disabled =
            !isAdmin || displayedIds.length === 0;

        getElement("selectedTransactionCount").textContent =
            `${selectedTransactions.size} selected`;

        const eligible = transactions.some(transaction =>

            selectedTransactions.has(String(transaction.id)) &&
            transaction.reviewed !== true &&
            !hasOpenQuestion(transaction)

        );

        bulkReviewBtn.disabled =
            !isAdmin || !eligible;

    }


    // =====================================
    // CREATE TRANSACTION ROW
    // =====================================

    function createTransactionRow(transaction) {

        const fragment = rowTemplate.content.cloneNode(true);

        const row = fragment.querySelector(".transaction-row");

        const id = String(transaction.id);

        row.dataset.transactionId = id;

        setField(row, "date", formatDate(transaction.date));
        setField(row, "vendor", transaction.vendor);

        setField(
            row,
            "business",
            transaction.businessName || "Unassigned"
        );

        setField(
            row,
            "detailedCategory",
            transaction.detailedCategory || "Uncategorized"
        );

        setField(
            row,
            "amount",
            formatCurrency(transaction.amount)
        );


        // Transaction amount styling

        const amountCell = row.querySelector(
            '[data-field="amount"]'
        );

        const type = normalize(
            transaction.categoryType
        );

        if (
            type === "transfer" ||
            type === "personal"
        ) {

            amountCell.classList.add(`amount-${type}`);

        } else if (Number(transaction.amount) > 0) {

            amountCell.classList.add("positive-amount");

        } else if (Number(transaction.amount) < 0) {

            amountCell.classList.add("negative-amount");

        }


        // Review status

        const status = getReviewStatus(transaction);

        const statusCell = row.querySelector(
            '[data-field="status"]'
        );

        const badge = document.createElement("span");

        badge.className = `status-badge ${status.value}`;
        badge.textContent = status.label;

        statusCell.appendChild(badge);


        // Highlight transactions requiring clarification

        if (hasOpenQuestion(transaction)) {

            row.classList.add("has-question");

        }


        // Transaction selection

        const checkbox = row.querySelector(
            ".transaction-checkbox"
        );

        checkbox.checked = selectedTransactions.has(id);

        row.classList.toggle(
            "selected",
            checkbox.checked
        );

        checkbox.addEventListener("change", () => {

            if (!isAdmin) return;

            if (checkbox.checked) {

                selectedTransactions.add(id);

            } else {

                selectedTransactions.delete(id);

            }

            row.classList.toggle(
                "selected",
                checkbox.checked
            );

            updateSelectionControls();

        });


        // Expand transaction details

        const detailsBtn = row.querySelector(
            ".transaction-details-btn"
        );

        const isExpanded =
            expandedTransactionId === id;

        detailsBtn.setAttribute(
            "aria-expanded",
            String(isExpanded)
        );

        row.classList.toggle(
            "expanded",
            isExpanded
        );

        detailsBtn.addEventListener("click", () => {

            if (expandedTransactionId === id) {

                closeTransactionDetails();

            } else {

                openTransactionDetails(id);

            }

        });

        applyAdminControls(row);

        return row;

    }


    // =====================================
    // POPULATE SELECT OPTIONS
    // =====================================

    function populateSelect(
        select,
        items,
        placeholder,
        selectedValue = ""
    ) {

        select.replaceChildren();

        const defaultOption =
            document.createElement("option");

        defaultOption.value = "";
        defaultOption.textContent = placeholder;

        select.appendChild(defaultOption);

        items.forEach(item => {

            const option = document.createElement("option");

            option.value = String(item.id);
            option.textContent = item.name;

            select.appendChild(option);

        });

        select.value = String(selectedValue ?? "");

    }


    // =====================================
    // GET BUSINESS CATEGORIES
    // =====================================

    function getAvailableCategories(businessId) {

        const business = businesses.find(item =>

            String(item.id) === String(businessId)

        );

        if (!business) return [];

        return categories.filter(category => {

            const mappings = category.taxMappings || {};

            return (
                category.active !== false &&
                Object.prototype.hasOwnProperty.call(
                    mappings,
                    business.taxForm
                )
            );

        });

    }


    // =====================================
    // AUTOMATIC TAX CATEGORY
    // =====================================

    function updateTaxCategory(form) {

        const businessId = form.elements.businessId.value;

        const categoryId =
            form.elements.detailedCategoryId.value;

        const business = businesses.find(item =>

            String(item.id) === businessId

        );

        const category = categories.find(item =>

            String(item.id) === categoryId

        );

        let taxCategory = "";

        if (business && category) {

            taxCategory =
                category.taxMappings?.[business.taxForm] || "";

        }

        form.elements.taxCategory.value = taxCategory;

    }


    // =====================================
    // CREATE TRANSACTION DETAILS
    // =====================================

    function createTransactionDetails(transaction) {

        const fragment =
            detailsTemplate.content.cloneNode(true);

        const detailsRow = fragment.querySelector(
            ".transaction-details-row"
        );

        detailsRow.dataset.transactionId =
            String(transaction.id);

        detailsRow.querySelector(
            ".transaction-details-cell"
        ).colSpan = isAdmin ? 8 : 7;


        // Original bank information

        setField(
            detailsRow,
            "transactionReference",
            `Transaction reference: ${transaction.id}`
        );

        setField(
            detailsRow,
            "bankAccount",
            transaction.accountName
        );

        setField(
            detailsRow,
            "originalDate",
            formatDate(transaction.originalDate)
        );

        setField(
            detailsRow,
            "originalAmount",
            transaction.originalAmount == null
                ? "—"
                : formatCurrency(transaction.originalAmount)
        );

        setField(
            detailsRow,
            "uploadSource",
            transaction.uploadSource
        );

        setField(
            detailsRow,
            "originalDescription",
            transaction.originalDescription
        );


        // Bookkeeping information

        const form = detailsRow.querySelector(
            ".transaction-edit-form"
        );

        form.elements.date.value =
            String(transaction.date || "").slice(0, 10);

        form.elements.vendor.value =
            transaction.vendor || "";

        form.elements.description.value =
            transaction.description || "";

        form.elements.amount.value =
            transaction.amount ?? "";

        form.elements.categoryType.value =
            transaction.categoryType || "";

        form.elements.question.value =
            transaction.question || "";

        form.elements.notes.value =
            transaction.notes || "";


        // Business / property options

        const clientBusinesses = businesses.filter(item =>

            String(item.clientId) ===
            String(transaction.clientId) &&
            (
                item.active !== false ||
                String(item.id) === String(transaction.businessId)
            )

        );

        populateSelect(

            form.elements.businessId,
            clientBusinesses,
            "Select Business / Property",
            transaction.businessId

        );


        // Detailed category options

        const availableCategories =
            getAvailableCategories(transaction.businessId);

        const historicalCategory = categories.find(item =>

            String(item.id) ===
            String(transaction.detailedCategoryId)

        );

        if (
            historicalCategory &&
            !availableCategories.some(item =>
                String(item.id) ===
                String(historicalCategory.id)
            )
        ) {

            availableCategories.push(historicalCategory);

        }

        populateSelect(

            form.elements.detailedCategoryId,
            availableCategories,
            "Select Detailed Category",
            transaction.detailedCategoryId

        );

        form.elements.taxCategory.value =
            transaction.taxCategory || "";


        // Update categories when business changes

        form.elements.businessId.addEventListener(
            "change",
            () => {

                const businessCategories =
                    getAvailableCategories(
                        form.elements.businessId.value
                    );

                populateSelect(

                    form.elements.detailedCategoryId,
                    businessCategories,
                    "Select Detailed Category"

                );

                updateTaxCategory(form);

            }
        );


        // Update tax category automatically

        form.elements.detailedCategoryId.addEventListener(
            "change",
            () => {

                updateTaxCategory(form);

            }
        );


        // Linked transaction question

        const linkedQuestion = detailsRow.querySelector(
            ".linked-question-link"
        );

        if (transaction.questionId) {

            linkedQuestion.href =
                "questions.html?questionId=" +
                encodeURIComponent(transaction.questionId);

            linkedQuestion.hidden = false;

        }


        // Review information

        setField(
            detailsRow,
            "reviewStatus",
            getReviewStatus(transaction).label
        );

        setField(
            detailsRow,
            "reviewedBy",
            transaction.reviewedBy
        );

        setField(
            detailsRow,
            "reviewedDate",
            formatDate(transaction.reviewedDate)
        );

        setField(
            detailsRow,
            "questionStatus",
            transaction.questionStatus
        );


        // Save transaction changes

        form.addEventListener("submit", event => {

            event.preventDefault();

            if (!isAdmin) return;

            saveTransactionChanges(transaction, form);

        });


        // Mark as reviewed

        const markReviewedBtn = detailsRow.querySelector(
            ".mark-reviewed-btn"
        );

        markReviewedBtn.disabled =
            !isAdmin ||
            transaction.reviewed === true ||
            hasOpenQuestion(transaction);

        if (transaction.reviewed === true) {

            markReviewedBtn.classList.add("is-reviewed");

            markReviewedBtn.textContent = "Reviewed";

        }

        markReviewedBtn.addEventListener("click", () => {

            if (!isAdmin) return;

            if (hasOpenQuestion(transaction)) {

                showNotification(
                    "Resolve the open question before reviewing this transaction.",
                    "warning"
                );

                return;

            }

            if (formHasChanges(transaction, form)) {

                showNotification(
                    "Save your changes before marking this transaction as reviewed.",
                    "warning"
                );

                return;

            }

            markTransactionReviewed(transaction);

        });


        // Close transaction details

        detailsRow.querySelector(
            ".close-details-btn"
        ).addEventListener("click", () => {

            closeTransactionDetails();

        });


        // Next transaction

        const nextTransactionBtn = detailsRow.querySelector(
            ".next-transaction-btn"
        );

        const filtered = getFilteredTransactions();

        const index = filtered.findIndex(item =>

            String(item.id) === String(transaction.id)

        );

        nextTransactionBtn.disabled =
            index < 0 ||
            index >= filtered.length - 1;

        nextTransactionBtn.addEventListener("click", () => {

            openNextTransaction(transaction.id);

        });

        applyAdminControls(detailsRow);

        return detailsRow;

    }


    // =====================================
    // DETECT UNSAVED CHANGES
    // =====================================

    function formHasChanges(transaction, form) {

        if (!isAdmin || !form) return false;

        const fields = [

            "date",
            "vendor",
            "businessId",
            "description",
            "detailedCategoryId",
            "taxCategory",
            "amount",
            "categoryType",
            "question",
            "notes"

        ];

        return fields.some(field => {

            let original = transaction[field] ?? "";

            const current = form.elements[field].value;

            if (field === "date") {

                original = String(original).slice(0, 10);

            }

            if (field === "amount") {

                return Number(current) !== Number(original);

            }

            return String(current) !== String(original);

        });

    }


    // =====================================
    // CONFIRM BEFORE DISCARDING EDITS
    // =====================================

    function confirmDiscardChanges() {

        if (!expandedTransactionId) return true;

        const transaction = transactions.find(item =>

            String(item.id) === expandedTransactionId

        );

        const form = tableBody.querySelector(
            ".transaction-edit-form"
        );

        if (
            transaction &&
            form &&
            formHasChanges(transaction, form)
        ) {

            return window.confirm(
                "You have unsaved changes. Discard these changes?"
            );

        }

        return true;

    }


    // =====================================
    // OPEN TRANSACTION DETAILS
    // =====================================

    function openTransactionDetails(id) {

        if (!confirmDiscardChanges()) return;

        expandedTransactionId = String(id);

        renderTransactions();

        const detailsRow = tableBody.querySelector(
            ".transaction-details-row"
        );

        if (detailsRow) {

            detailsRow.scrollIntoView({

                behavior: "auto",
                block: "nearest"

            });

        }

    }


    // =====================================
    // CLOSE TRANSACTION DETAILS
    // =====================================

    function closeTransactionDetails() {

        if (!confirmDiscardChanges()) return;

        const previousId = expandedTransactionId;

        expandedTransactionId = null;

        renderTransactions();

        const previousRow = Array.from(
            tableBody.querySelectorAll(".transaction-row")
        ).find(row =>

            row.dataset.transactionId === previousId

        );

        previousRow?.querySelector(
            ".transaction-details-btn"
        )?.focus();

    }


    // =====================================
    // OPEN NEXT TRANSACTION
    // =====================================

    function openNextTransaction(id) {

        if (!confirmDiscardChanges()) return;

        const filtered = getFilteredTransactions();

        const index = filtered.findIndex(transaction =>

            String(transaction.id) === String(id)

        );

        if (
            index < 0 ||
            index >= filtered.length - 1
        ) return;

        const nextIndex = index + 1;

        const perPage = Number(perPageSelect.value) || 25;

        currentPage = Math.floor(nextIndex / perPage) + 1;

        expandedTransactionId =
            String(filtered[nextIndex].id);

        renderTransactions();

        tableBody.querySelector(
            ".transaction-details-row"
        )?.scrollIntoView({

            behavior: "auto",
            block: "nearest"

        });

    }


    // =====================================
    // TRANSACTION FORM MESSAGE
    // =====================================

    function showFormMessage(form, message, type = "") {

        const messageElement = form.querySelector(
            ".transaction-form-message"
        );

        if (!messageElement) return;

        messageElement.textContent = message;

        messageElement.classList.remove(
            "success",
            "error",
            "warning"
        );

        if (type) {

            messageElement.classList.add(type);

        }

    }


    // =====================================
    // SAVE TRANSACTION CHANGES
    // =====================================

    function saveTransactionChanges(transaction, form) {

        if (!isAdmin) return;

        const categoryType = normalize(
            form.elements.categoryType.value
        );

        const allowedTypes = [

            "income",
            "expense",
            "transfer",
            "personal"

        ];

        if (!allowedTypes.includes(categoryType)) {

            showFormMessage(

                form,
                "Category Type must be Income, Expense, Transfer, or Personal.",
                "error"

            );

            return;

        }

        if (!form.elements.vendor.value.trim()) {

            showFormMessage(

                form,
                "Please enter a vendor name.",
                "error"

            );

            return;

        }

        if (
            !form.elements.date.value ||
            form.elements.amount.value === "" ||
            !Number.isFinite(Number(form.elements.amount.value))
        ) {

            showFormMessage(

                form,
                "Please enter a valid transaction date and amount.",
                "error"

            );

            return;

        }


        // Actual saving will be connected to
        // the database during backend integration.
        //
        // Future save operations will:
        //
        // 1. Preserve original bank information.
        // 2. Save bookkeeping corrections.
        // 3. Reset review status when edited.
        // 4. Create or update linked questions.
        // 5. Record categorization corrections.
        // 6. Refresh financial reports.

        showFormMessage(

            form,
            "Database saving is not connected yet. Changes have not been saved.",
            "warning"

        );

    }


    // =====================================
    // MARK TRANSACTION AS REVIEWED
    // =====================================

    function markTransactionReviewed(transaction) {

        if (!isAdmin) return;

        if (hasOpenQuestion(transaction)) {

            showNotification(

                "This transaction has an unresolved question.",
                "warning"

            );

            return;

        }

        if (
            !transaction.businessId ||
            !transaction.detailedCategoryId ||
            !transaction.categoryType
        ) {

            showNotification(

                "Complete the transaction categorization before marking it as reviewed.",
                "warning"

            );

            return;

        }


        // Review status and administrator
        // information will be saved to the database.

        showNotification(

            "Review tracking is not connected to the database yet.",
            "warning"

        );

    }


    // =====================================
    // RENDER TRANSACTIONS
    // =====================================

    function renderTransactions() {

        const filtered = getFilteredTransactions();

        const pagination = getPagination(filtered);

        const displayed = pagination.displayedItems;

        tableBody.replaceChildren();

        if (!displayed.some(transaction =>

            String(transaction.id) === expandedTransactionId

        )) {

            expandedTransactionId = null;

        }

        if (!displayed.length) {

            renderEmptyState(
                getContextTransactions().length > 0
            );

        } else {

            displayed.forEach(transaction => {

                const row = createTransactionRow(transaction);

                tableBody.appendChild(row);

                if (
                    expandedTransactionId ===
                    String(transaction.id)
                ) {

                    const details =
                        createTransactionDetails(transaction);

                    tableBody.appendChild(details);

                }

            });

        }

        updateOverview();

        updatePagination(filtered, pagination);

        updateSelectionControls();

    }


    // =====================================
    // RESET PAGE AND RENDER
    // =====================================

    function resetPageAndRender() {

        currentPage = 1;

        expandedTransactionId = null;

        selectedTransactions.clear();

        renderTransactions();

    }


    // =====================================
    // FILTER EVENTS
    // =====================================

    // Preserve the last applied filter values
    // if an administrator cancels navigation.

    const filterControls = [

        searchInput,
        accountFilter,
        categoryFilter,
        typeFilter,
        reviewFilter,
        sortSelect,
        clientSelect,
        businessSelect

    ];

    filterControls.forEach(control => {

        let previousValue = control.value;

        const eventType =
            control === searchInput
                ? "input"
                : "change";

        control.addEventListener(eventType, () => {

            if (!confirmDiscardChanges()) {

                control.value = previousValue;

                return;

            }

            previousValue = control.value;

            resetPageAndRender();

        });

    });


    // =====================================
    // CLEAR TRANSACTION FILTERS
    // =====================================

    clearFiltersBtn.addEventListener("click", () => {

        if (!confirmDiscardChanges()) return;

        searchInput.value = "";

        accountFilter.value = "all";
        categoryFilter.value = "all";
        typeFilter.value = "all";
        reviewFilter.value = "all";

        sortSelect.value = "newest";

        // Keep the selected client, business,
        // year, and reporting period unchanged.

        resetPageAndRender();

    });


    // =====================================
    // SELECT ALL DISPLAYED TRANSACTIONS
    // =====================================

    selectAllCheckbox.addEventListener("change", () => {

        if (!isAdmin) return;

        const displayed = getPagination(
            getFilteredTransactions()
        ).displayedItems;

        displayed.forEach(transaction => {

            const id = String(transaction.id);

            if (selectAllCheckbox.checked) {

                selectedTransactions.add(id);

            } else {

                selectedTransactions.delete(id);

            }

        });

        tableBody.querySelectorAll(".transaction-row")
            .forEach(row => {

                const selected = selectedTransactions.has(
                    row.dataset.transactionId
                );

                row.querySelector(
                    ".transaction-checkbox"
                ).checked = selected;

                row.classList.toggle("selected", selected);

            });

        updateSelectionControls();

    });


    // =====================================
    // BULK TRANSACTION REVIEW
    // =====================================

    bulkReviewBtn.addEventListener("click", () => {

        if (!isAdmin) return;

        const eligible = transactions.filter(transaction =>

            selectedTransactions.has(String(transaction.id)) &&
            transaction.reviewed !== true &&
            !hasOpenQuestion(transaction) &&
            Boolean(transaction.businessId) &&
            Boolean(transaction.detailedCategoryId) &&
            Boolean(transaction.categoryType)

        );

        if (!eligible.length) {

            showNotification(

                "No selected transactions are eligible for review.",
                "warning"

            );

            return;

        }


        // Bulk review will be connected to
        // authenticated database operations.

        showNotification(

            "Bulk review is not connected to the database yet.",
            "warning"

        );

    });


    // =====================================
    // TRANSACTIONS PER PAGE
    // =====================================

    let previousPerPage = perPageSelect.value;

    perPageSelect.addEventListener("change", () => {

        if (!confirmDiscardChanges()) {

            perPageSelect.value = previousPerPage;

            return;

        }

        previousPerPage = perPageSelect.value;

        resetPageAndRender();

    });


    // =====================================
    // PREVIOUS PAGE
    // =====================================

    previousPageBtn.addEventListener("click", () => {

        if (currentPage <= 1) return;

        if (!confirmDiscardChanges()) return;

        currentPage--;

        expandedTransactionId = null;

        renderTransactions();

    });


    // =====================================
    // NEXT PAGE
    // =====================================

    nextPageBtn.addEventListener("click", () => {

        const pagination = getPagination(
            getFilteredTransactions()
        );

        if (currentPage >= pagination.totalPages) return;

        if (!confirmDiscardChanges()) return;

        currentPage++;

        expandedTransactionId = null;

        renderTransactions();

    });


    // =====================================
    // WARN BEFORE LEAVING WITH UNSAVED EDITS
    // =====================================

    window.addEventListener("beforeunload", event => {

        if (!expandedTransactionId || !isAdmin) return;

        const transaction = transactions.find(item =>

            String(item.id) === expandedTransactionId

        );

        const form = tableBody.querySelector(
            ".transaction-edit-form"
        );

        if (
            transaction &&
            form &&
            formHasChanges(transaction, form)
        ) {

            event.preventDefault();

            event.returnValue = "";

        }

    });


    // =====================================
    // INITIALIZE TRANSACTIONS PAGE
    // =====================================

    function initializeTransactionsPage() {

        // Future database integration will load:
        //
        // - Authenticated user permissions
        // - Authorized client profiles
        // - Businesses and rental properties
        // - Bank and credit card accounts
        // - Master bookkeeping categories
        // - Previously uploaded transactions
        // - Linked transaction questions
        // - Transaction review history

        applyAdminControls();

        updateReportingPeriod();

    }

    initializeTransactionsPage();

});