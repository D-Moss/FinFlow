// =====================================
// FINFLOW - CATEGORIES & SETTINGS
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // SETTINGS TABS
    // =====================================

    const settingsTabs = Array.from(
        document.querySelectorAll(".settings-tab")
    );

    const settingsPanels = document.querySelectorAll(
        ".settings-panel"
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

        settingsTabs.forEach(tab => {

            tab.classList.remove("active-tab");
            tab.setAttribute("aria-selected", "false");
            tab.setAttribute("tabindex", "-1");

        });


        // Hide all panels

        settingsPanels.forEach(panel => {

            panel.hidden = true;

        });


        // Activate selected tab

        selectedTab.classList.add("active-tab");
        selectedTab.setAttribute("aria-selected", "true");
        selectedTab.setAttribute("tabindex", "0");


        // Display selected panel

        targetPanel.hidden = false;

    }


    // =====================================
    // TAB CLICK EVENTS
    // =====================================

    settingsTabs.forEach(tab => {

        tab.addEventListener("click", () => {

            activateTab(tab);

        });

    });


    // =====================================
    // KEYBOARD TAB NAVIGATION
    // =====================================

    settingsTabs.forEach((tab, index) => {

        tab.addEventListener("keydown", event => {

            let nextIndex;

            switch (event.key) {

                case "ArrowRight":

                    nextIndex =
                        (index + 1) % settingsTabs.length;

                    break;

                case "ArrowLeft":

                    nextIndex =
                        (index - 1 + settingsTabs.length)
                        % settingsTabs.length;

                    break;

                case "Home":

                    nextIndex = 0;

                    break;

                case "End":

                    nextIndex = settingsTabs.length - 1;

                    break;

                default:

                    return;

            }

            event.preventDefault();

            const nextTab = settingsTabs[nextIndex];

            activateTab(nextTab);

            nextTab.focus();

        });

    });


    // =====================================
    // DEFAULT ACTIVE TAB
    // =====================================

    const defaultTab = document.getElementById(
        "accountsTab"
    );

    if (defaultTab) {

        activateTab(defaultTab);

    }


    // =====================================
    // CLOSE CLIENT PROFILE EDITOR
    // =====================================

    const clientEditor = document.getElementById(
        "clientEditor"
    );

    const closeClientEditorBtn = document.getElementById(
        "closeClientEditorBtn"
    );

    if (clientEditor && closeClientEditorBtn) {

        closeClientEditorBtn.addEventListener("click", () => {

            clientEditor.hidden = true;

        });

    }


    // =====================================
    // CLIENT PROFILE FORM
    // =====================================

    const clientProfileForm = document.getElementById(
        "clientProfileForm"
    );

    if (clientProfileForm) {

        clientProfileForm.addEventListener("submit", event => {

            event.preventDefault();

            // Client profile saving will be connected
            // when the database is implemented.

        });

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