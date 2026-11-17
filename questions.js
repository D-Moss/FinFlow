// =====================================
// FINFLOW - CLIENT QUESTIONS
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // QUESTION TABS
    // =====================================

    const questionTabs = Array.from(
        document.querySelectorAll(".question-tabs .tab-btn")
    );

    const questionPanels = document.querySelectorAll(
        ".questions-panel .tab-panel"
    );

    const questionDetailsSection = document.getElementById(
        "questionDetailsSection"
    );


    // =====================================
    // SWITCH BETWEEN TABS
    // =====================================

    function activateTab(selectedTab) {

        const targetPanelId = selectedTab.getAttribute(
            "aria-controls"
        );

        const targetPanel = document.getElementById(
            targetPanelId
        );

        if (!targetPanel) return;


        // Reset all tabs

        questionTabs.forEach(tab => {

            tab.classList.remove("active-tab");
            tab.setAttribute("aria-selected", "false");
            tab.setAttribute("tabindex", "-1");

        });


        // Hide all panels

        questionPanels.forEach(panel => {

            panel.hidden = true;

        });


        // Activate selected tab

        selectedTab.classList.add("active-tab");
        selectedTab.setAttribute("aria-selected", "true");
        selectedTab.setAttribute("tabindex", "0");


        // Display selected panel

        targetPanel.hidden = false;


        // Close previously opened question details

        if (questionDetailsSection) {

            questionDetailsSection.hidden = true;

        }

    }


    // =====================================
    // TAB CLICK EVENTS
    // =====================================

    questionTabs.forEach(tab => {

        tab.addEventListener("click", () => {

            activateTab(tab);

        });

    });


    // =====================================
    // KEYBOARD TAB NAVIGATION
    // =====================================

    questionTabs.forEach((tab, index) => {

        tab.addEventListener("keydown", event => {

            let nextIndex;

            switch (event.key) {

                case "ArrowRight":

                    nextIndex =
                        (index + 1) % questionTabs.length;

                    break;

                case "ArrowLeft":

                    nextIndex =
                        (index - 1 + questionTabs.length)
                        % questionTabs.length;

                    break;

                case "Home":

                    nextIndex = 0;

                    break;

                case "End":

                    nextIndex = questionTabs.length - 1;

                    break;

                default:

                    return;

            }

            event.preventDefault();

            const nextTab = questionTabs[nextIndex];

            activateTab(nextTab);

            nextTab.focus();

        });

    });


    // =====================================
    // DEFAULT ACTIVE TAB
    // =====================================

    const defaultTab = document.getElementById(
        "transactionQuestionsTab"
    );

    if (defaultTab) {

        activateTab(defaultTab);

    }


    // =====================================
    // ASK A QUESTION MODAL
    // =====================================

    const askQuestionBtn = document.getElementById(
        "askQuestionBtn"
    );

    const askQuestionModal = document.getElementById(
        "askQuestionModal"
    );

    const closeAskQuestionBtn = document.getElementById(
        "closeAskQuestionBtn"
    );

    const cancelQuestionBtn = document.getElementById(
        "cancelQuestionBtn"
    );

    const askQuestionForm = document.getElementById(
        "askQuestionForm"
    );

    const questionType = document.getElementById(
        "questionType"
    );

    const questionFormMessage = document.getElementById(
        "questionFormMessage"
    );

    let previousFocusedElement = null;
    let previousBodyOverflow = "";


    // =====================================
    // OPEN ASK A QUESTION MODAL
    // =====================================

    function openQuestionModal() {

        if (!askQuestionModal || !askQuestionModal.hidden) {
            return;
        }

        previousFocusedElement = document.activeElement;
        previousBodyOverflow = document.body.style.overflow;

        askQuestionModal.hidden = false;

        document.body.style.overflow = "hidden";

        if (questionFormMessage) {

            questionFormMessage.textContent = "";
            questionFormMessage.classList.remove(
                "success",
                "error"
            );

        }

        updateTransactionFields();

        if (questionType) {

            questionType.focus();

        }

    }


    // =====================================
    // CLOSE ASK A QUESTION MODAL
    // =====================================

    function closeQuestionModal() {

        if (!askQuestionModal || askQuestionModal.hidden) {
            return;
        }

        askQuestionModal.hidden = true;

        document.body.style.overflow = previousBodyOverflow;

        if (askQuestionForm) {

            askQuestionForm.reset();

        }

        if (questionFormMessage) {

            questionFormMessage.textContent = "";
            questionFormMessage.classList.remove(
                "success",
                "error"
            );

        }

        updateTransactionFields();

        if (previousFocusedElement) {

            previousFocusedElement.focus();

        }

    }


    // =====================================
    // MODAL BUTTON EVENTS
    // =====================================

    if (askQuestionBtn) {

        askQuestionBtn.addEventListener(
            "click",
            openQuestionModal
        );

    }

    if (closeAskQuestionBtn) {

        closeAskQuestionBtn.addEventListener(
            "click",
            closeQuestionModal
        );

    }

    if (cancelQuestionBtn) {

        cancelQuestionBtn.addEventListener(
            "click",
            closeQuestionModal
        );

    }


    // =====================================
    // CLOSE MODAL WHEN CLICKING OUTSIDE
    // =====================================

    if (askQuestionModal) {

        askQuestionModal.addEventListener("click", event => {

            if (event.target === askQuestionModal) {

                closeQuestionModal();

            }

        });

    }


    // =====================================
    // MODAL KEYBOARD CONTROLS
    // =====================================

    document.addEventListener("keydown", event => {

        if (!askQuestionModal || askQuestionModal.hidden) {
            return;
        }


        // Close modal with Escape

        if (event.key === "Escape") {

            event.preventDefault();

            closeQuestionModal();

            return;

        }


        // Keep keyboard focus inside the modal

        if (event.key === "Tab") {

            const focusableElements = Array.from(
                askQuestionModal.querySelectorAll(
                    'button:not([disabled]), ' +
                    'input:not([disabled]), ' +
                    'select:not([disabled]), ' +
                    'textarea:not([disabled]), ' +
                    'a[href], ' +
                    '[tabindex="0"]'
                )
            ).filter(element => {

                return (
                    element.getClientRects().length > 0 &&
                    element.tabIndex >= 0
                );

            });

            if (!focusableElements.length) return;

            const firstElement = focusableElements[0];

            const lastElement =
                focusableElements[focusableElements.length - 1];

            if (
                event.shiftKey &&
                document.activeElement === firstElement
            ) {

                event.preventDefault();

                lastElement.focus();

            } else if (
                !event.shiftKey &&
                document.activeElement === lastElement
            ) {

                event.preventDefault();

                firstElement.focus();

            }

        }

    });


    // =====================================
    // TRANSACTION QUESTION FIELDS
    // =====================================

    const questionTransactionFields = document.getElementById(
        "questionTransactionFields"
    );

    const questionTransactionSearch = document.getElementById(
        "questionTransactionSearch"
    );

    const questionTransactionSelect = document.getElementById(
        "questionTransactionSelect"
    );


    // =====================================
    // SHOW / HIDE TRANSACTION SELECTION
    // =====================================

    function updateTransactionFields() {

        if (!questionType || !questionTransactionFields) {
            return;
        }

        const isTransactionQuestion =
            questionType.value === "transaction";

        questionTransactionFields.hidden =
            !isTransactionQuestion;


        // Clear transaction fields when not needed

        if (!isTransactionQuestion) {

            if (questionTransactionSearch) {

                questionTransactionSearch.value = "";

            }

            if (questionTransactionSelect) {

                questionTransactionSelect.value = "";

            }

        }

    }

    if (questionType) {

        questionType.addEventListener(
            "change",
            updateTransactionFields
        );

    }

    updateTransactionFields();


    // =====================================
    // ASK A QUESTION FORM SUBMISSION
    // =====================================

    if (askQuestionForm) {

        askQuestionForm.addEventListener("submit", event => {

            event.preventDefault();

            const questionSubject = document.getElementById(
                "questionSubject"
            );

            const questionMessage = document.getElementById(
                "questionMessage"
            );

            if (
                !questionType ||
                !questionSubject ||
                !questionMessage
            ) {
                return;
            }

            const type = questionType.value;
            const subject = questionSubject.value.trim();
            const message = questionMessage.value.trim();


            // Validate required fields

            if (!type || !subject || !message) {

                if (questionFormMessage) {

                    questionFormMessage.textContent =
                        "Please complete all required fields.";

                    questionFormMessage.classList.remove(
                        "success"
                    );

                    questionFormMessage.classList.add(
                        "error"
                    );

                }

                return;

            }


            // Database and email functionality
            // will be connected later.

            if (questionFormMessage) {

                questionFormMessage.textContent =
                    "The question form is currently in testing mode. " +
                    "Your question has not been submitted.";

                questionFormMessage.classList.remove(
                    "success",
                    "error"
                );

            }

        });

    }


    // =====================================
    // CLOSE QUESTION DETAILS
    // =====================================

    const closeQuestionDetailsBtn = document.getElementById(
        "closeQuestionDetailsBtn"
    );

    if (closeQuestionDetailsBtn && questionDetailsSection) {

        closeQuestionDetailsBtn.addEventListener("click", () => {

            questionDetailsSection.hidden = true;

        });

    }


    // =====================================
    // QUESTION REPLY FORM
    // =====================================

    const questionReplyForm = document.getElementById(
        "questionReplyForm"
    );

    if (questionReplyForm) {

        questionReplyForm.addEventListener("submit", event => {

            event.preventDefault();

            // Reply functionality will be connected
            // when the database is implemented.

        });

    }


    // =====================================
    // INTERNAL NOTES FORM
    // =====================================

    const internalNotesForm = document.getElementById(
        "internalNotesForm"
    );

    if (internalNotesForm) {

        internalNotesForm.addEventListener("submit", event => {

            event.preventDefault();

            // Internal notes will be saved to the
            // database when it is implemented.

        });

    }


    // =====================================
    // QUESTION TABLE FILTERS
    // =====================================

    function filterQuestionTable(
        tableBodyId,
        searchInputId,
        statusFilterId,
        clientFilterId
    ) {

        const tableBody = document.getElementById(
            tableBodyId
        );

        const searchInput = document.getElementById(
            searchInputId
        );

        const statusFilter = document.getElementById(
            statusFilterId
        );

        const clientFilter = document.getElementById(
            clientFilterId
        );

        if (!tableBody) return;

        const searchTerm = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        const selectedStatus = statusFilter
            ? statusFilter.value
            : "all";

        const selectedClient = clientFilter
            ? clientFilter.value
            : "all";

        const rows = tableBody.querySelectorAll(
            "tr[data-question-id]"
        );

        rows.forEach(row => {

            const rowText = row.textContent.toLowerCase();

            const rowStatus = row.dataset.status || "";

            const rowClient = row.dataset.clientId || "";

            const matchesSearch =
                rowText.includes(searchTerm);

            const matchesStatus =
                selectedStatus === "all" ||
                rowStatus === selectedStatus;

            const matchesClient =
                selectedClient === "all" ||
                rowClient === selectedClient;

            row.hidden = !(
                matchesSearch &&
                matchesStatus &&
                matchesClient
            );

        });


        // Display a message when no records match

        let noResultsRow = tableBody.querySelector(
            ".no-results-row"
        );

        const visibleRows = Array.from(rows).filter(
            row => !row.hidden
        );

        if (rows.length > 0 && visibleRows.length === 0) {

            if (!noResultsRow) {

                noResultsRow = document.createElement("tr");

                noResultsRow.className = "no-results-row";

                const cell = document.createElement("td");

                cell.colSpan = 6;
                cell.className = "empty-state";

                const message = document.createElement("p");

                message.textContent =
                    "No questions match your filters.";

                cell.appendChild(message);

                noResultsRow.appendChild(cell);

                tableBody.appendChild(noResultsRow);

            }

            noResultsRow.hidden = false;

        } else if (noResultsRow) {

            noResultsRow.hidden = true;

        }

    }


    // =====================================
    // TRANSACTION QUESTION FILTER EVENTS
    // =====================================

    function filterTransactionQuestions() {

        filterQuestionTable(
            "transactionQuestionsTableBody",
            "transactionQuestionSearch",
            "transactionStatusFilter",
            "transactionClientFilter"
        );

    }

    const transactionQuestionSearch = document.getElementById(
        "transactionQuestionSearch"
    );

    const transactionStatusFilter = document.getElementById(
        "transactionStatusFilter"
    );

    const transactionClientFilter = document.getElementById(
        "transactionClientFilter"
    );

    if (transactionQuestionSearch) {

        transactionQuestionSearch.addEventListener(
            "input",
            filterTransactionQuestions
        );

    }

    if (transactionStatusFilter) {

        transactionStatusFilter.addEventListener(
            "change",
            filterTransactionQuestions
        );

    }

    if (transactionClientFilter) {

        transactionClientFilter.addEventListener(
            "change",
            filterTransactionQuestions
        );

    }


    // =====================================
    // CLIENT QUESTION FILTER EVENTS
    // =====================================

    function filterClientQuestions() {

        filterQuestionTable(
            "clientQuestionsTableBody",
            "clientQuestionSearch",
            "clientQuestionStatusFilter",
            "clientQuestionClientFilter"
        );

    }

    const clientQuestionSearch = document.getElementById(
        "clientQuestionSearch"
    );

    const clientQuestionStatusFilter = document.getElementById(
        "clientQuestionStatusFilter"
    );

    const clientQuestionClientFilter = document.getElementById(
        "clientQuestionClientFilter"
    );

    if (clientQuestionSearch) {

        clientQuestionSearch.addEventListener(
            "input",
            filterClientQuestions
        );

    }

    if (clientQuestionStatusFilter) {

        clientQuestionStatusFilter.addEventListener(
            "change",
            filterClientQuestions
        );

    }

    if (clientQuestionClientFilter) {

        clientQuestionClientFilter.addEventListener(
            "change",
            filterClientQuestions
        );

    }


    // =====================================
    // AUTOMATIC FOOTER YEAR
    // =====================================

    const currentYear = document.getElementById(
        "currentYear"
    );

    if (currentYear) {

        currentYear.textContent = new Date().getFullYear();

    }

});