
/* =========================================
   FIREBASE CONFIGURATION
   ========================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDKNumgI1MvLAdPqD4u3Qah_SbWWAbfwR4",
    authDomain: "finflow-dcab6.firebaseapp.com",
    projectId: "finflow-dcab6",
    storageBucket: "finflow-dcab6.firebasestorage.app",
    messagingSenderId: "536136161454",
    appId: "1:536136161454:web:885b77f96109d30850f53f",
    measurementId: "G-MDY4MDRC16"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


/* =========================================
   FOOTER
   ========================================= */

const currentYear = document.getElementById("currentYear");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}


/* =========================================
   MODAL CONTROLS
   ========================================= */

const loginModal = document.getElementById("loginModal");
const signupModal = document.getElementById("signupModal");
const contactModal = document.getElementById("contactModal");
const demoOverlay = document.getElementById("demoOverlay");

const allOverlays = [
    loginModal,
    signupModal,
    contactModal,
    demoOverlay
].filter(Boolean);

const CLOSE_ANIMATION_MS = 220;

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);

let activeOverlay = null;
let previousFocus = null;
let closingTimer = null;
let modalTransitioning = false;

function animationDuration() {
    return prefersReducedMotion.matches
        ? 0
        : CLOSE_ANIMATION_MS;
}

function focusFirstField(modal) {
    const firstField = modal.querySelector(
        'input:not([disabled]), textarea:not([disabled])'
    );

    const closeButton = modal.querySelector(
        '[data-close-modal], #closeDemoBtn'
    );

    const target = firstField || closeButton;

    if (target) {
        target.focus({ preventScroll: true });
    }
}

function openModal(modal) {
    if (!modal) return;

    // Cancel a pending close if another modal is opened.
    if (closingTimer !== null) {
        clearTimeout(closingTimer);
        closingTimer = null;
    }

    if (!activeOverlay) {
        previousFocus = document.activeElement;
    }

    allOverlays.forEach(overlay => {
        overlay.classList.remove("is-closing");
        overlay.hidden = overlay !== modal;
    });

    activeOverlay = modal;
    modalTransitioning = false;

    document.body.classList.add("modal-open");

    focusFirstField(modal);
}

function closeModal() {
    if (!activeOverlay || modalTransitioning) return;

    modalTransitioning = true;

    const modalToClose = activeOverlay;

    modalToClose.classList.add("is-closing");

    closingTimer = window.setTimeout(() => {
        modalToClose.hidden = true;
        modalToClose.classList.remove("is-closing");

        if (activeOverlay === modalToClose) {
            activeOverlay = null;
        }

        document.body.classList.remove("modal-open");

        modalTransitioning = false;
        closingTimer = null;

        if (
            previousFocus &&
            typeof previousFocus.focus === "function"
        ) {
            previousFocus.focus({ preventScroll: true });
        }

        previousFocus = null;
    }, animationDuration());
}

// Close buttons
document.querySelectorAll("[data-close-modal]").forEach(button => {
    button.addEventListener("click", closeModal);
});

// Clicking outside a popup
allOverlays.forEach(overlay => {
    overlay.addEventListener("click", event => {
        if (event.target === overlay) {
            closeModal();
        }
    });
});

// Escape key
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && activeOverlay) {
        closeModal();
    }
});

// Keep keyboard focus inside the active overlay.
document.addEventListener("keydown", event => {
    if (event.key !== "Tab" || !activeOverlay) return;

    const focusableElements = [
        ...activeOverlay.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
    ].filter(element => {
        return !element.closest("[hidden]") &&
            element.getClientRects().length > 0;
    });

    if (!focusableElements.length) {
        event.preventDefault();
        return;
    }

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (
        !event.shiftKey &&
        document.activeElement === last
    ) {
        event.preventDefault();
        first.focus();
    }
});


/* =========================================
   FORM MESSAGES
   ========================================= */

function showMessage(element, message, type = "error") {
    if (!element) return;

    element.textContent = message;

    element.classList.remove("error", "success");

    if (message) {
        element.classList.add(type);
    }
}

function getAuthErrorMessage(error) {
    switch (error.code) {
        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
            return "The email or password is incorrect.";

        case "auth/email-already-in-use":
            return "An account already exists with this email address.";

        case "auth/weak-password":
            return "Please choose a stronger password.";

        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";

        case "auth/network-request-failed":
            return "Network error. Please check your connection.";

        default:
            return "Something went wrong. Please try again.";
    }
}


/* =========================================
   LOGIN MODAL
   ========================================= */

const loginBtn = document.getElementById("loginBtn");
const startBtn = document.getElementById("startBtn");

const loginForm = document.getElementById("loginForm");

const loginEmailStep = document.getElementById("loginEmailStep");
const loginPasswordStep = document.getElementById("loginPasswordStep");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const loginContinueBtn = document.getElementById(
    "loginContinueBtn"
);

const loginBackBtn = document.getElementById("loginBackBtn");

const forgotPasswordBtn = document.getElementById(
    "forgotPasswordBtn"
);

const loginEmailDisplay = document.getElementById(
    "loginEmailDisplay"
);

const loginMessage = document.getElementById("loginMessage");

function showLoginStep(step) {
    const isEmailStep = step === "email";

    if (loginEmailStep) {
        loginEmailStep.hidden = !isEmailStep;
    }

    if (loginPasswordStep) {
        loginPasswordStep.hidden = isEmailStep;
    }

    // Prevent hidden inputs from blocking form submission.
    if (loginEmail) {
        loginEmail.disabled = !isEmailStep;
    }

    if (loginPassword) {
        loginPassword.disabled = isEmailStep;
    }

    showMessage(loginMessage, "");

    const target = isEmailStep
        ? loginEmail
        : loginPassword;

    if (target) {
        target.focus({ preventScroll: true });
    }
}

function openLogin() {
    if (loginForm) {
        loginForm.reset();
        loginForm.noValidate = true;
    }

    openModal(loginModal);
    showLoginStep("email");
}

if (loginBtn) {
    loginBtn.addEventListener("click", openLogin);
}

if (startBtn) {
    startBtn.addEventListener("click", openLogin);
}

function continueLogin() {
    if (!loginEmail) return;

    const email = loginEmail.value.trim();

    if (!email || !loginEmail.checkValidity()) {
        showMessage(
            loginMessage,
            "Please enter a valid email address."
        );

        loginEmail.focus();
        return;
    }

    if (loginEmailDisplay) {
        loginEmailDisplay.textContent = email;
    }

    showLoginStep("password");
}

if (loginContinueBtn) {
    loginContinueBtn.addEventListener("click", event => {
        event.preventDefault();
        continueLogin();
    });
}

if (loginEmail) {
    loginEmail.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            continueLogin();
        }
    });
}

if (loginBackBtn) {
    loginBackBtn.addEventListener("click", event => {
        event.preventDefault();
        showLoginStep("email");
    });
}

// Sign in
if (loginForm) {
    loginForm.noValidate = true;

    loginForm.addEventListener("submit", async event => {
        event.preventDefault();

        if (loginPasswordStep?.hidden) {
            continueLogin();
            return;
        }

        const email = loginEmail?.value.trim();
        const password = loginPassword?.value;

        if (!email || !password) {
            showMessage(
                loginMessage,
                "Please enter your email and password."
            );
            return;
        }

        const submitButton = loginForm.querySelector(
            'button[type="submit"]'
        );

        if (submitButton?.disabled) return;

        if (submitButton) {
            submitButton.disabled = true;
        }

        showMessage(loginMessage, "");

        try {
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            window.location.href = "dashboard.html";
        } catch (error) {
            showMessage(
                loginMessage,
                getAuthErrorMessage(error)
            );
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });
}

// Password reset
if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener("click", async event => {
        event.preventDefault();

        const email = loginEmail?.value.trim();

        if (!email) {
            showMessage(
                loginMessage,
                "Please enter your email address first."
            );
            return;
        }

        forgotPasswordBtn.disabled = true;

        try {
            await sendPasswordResetEmail(auth, email);

            showMessage(
                loginMessage,
                "If an account exists for this email, a password reset link will be sent.",
                "success"
            );
        } catch (error) {
            if (error.code === "auth/too-many-requests") {
                showMessage(
                    loginMessage,
                    getAuthErrorMessage(error)
                );
            } else {
                showMessage(
                    loginMessage,
                    "If an account exists for this email, a password reset link will be sent.",
                    "success"
                );
            }
        } finally {
            forgotPasswordBtn.disabled = false;
        }
    });
}


/* =========================================
   SIGN UP MODAL
   ========================================= */

const signupBtn = document.getElementById("signupBtn");
const signupForm = document.getElementById("signupForm");

const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById(
    "signupPassword"
);

const confirmPassword = document.getElementById(
    "confirmPassword"
);

const signupMessage = document.getElementById(
    "signupMessage"
);

const switchToLoginBtn = document.getElementById(
    "switchToLoginBtn"
);

function openSignup() {
    if (signupForm) {
        signupForm.reset();
    }

    showMessage(signupMessage, "");
    openModal(signupModal);
}

if (signupBtn) {
    signupBtn.addEventListener("click", openSignup);
}

if (switchToLoginBtn) {
    switchToLoginBtn.addEventListener("click", event => {
        event.preventDefault();
        openLogin();
    });
}

if (signupForm) {
    signupForm.addEventListener("submit", async event => {
        event.preventDefault();

        const email = signupEmail?.value.trim();
        const password = signupPassword?.value;
        const confirmation = confirmPassword?.value;

        if (!email || !signupEmail.checkValidity()) {
            showMessage(
                signupMessage,
                "Please enter a valid email address."
            );
            return;
        }

        if (!password || password.length < 6) {
            showMessage(
                signupMessage,
                "Your password must contain at least 6 characters."
            );
            return;
        }

        if (password !== confirmation) {
            showMessage(
                signupMessage,
                "Your passwords do not match."
            );
            return;
        }

        const submitButton = signupForm.querySelector(
            'button[type="submit"]'
        );

        if (submitButton?.disabled) return;

        if (submitButton) {
            submitButton.disabled = true;
        }

        showMessage(signupMessage, "");

        try {
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            window.location.href = "dashboard.html";
        } catch (error) {
            showMessage(
                signupMessage,
                getAuthErrorMessage(error)
            );
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });
}


/* =========================================
   SAMPLE DASHBOARD OVERLAY
   ========================================= */

const demoBtn = document.getElementById("demoBtn");
const closeDemoBtn = document.getElementById("closeDemoBtn");

const demoPrevBtn = document.getElementById("demoPrevBtn");
const demoNextBtn = document.getElementById("demoNextBtn");

const demoPageLabel = document.getElementById(
    "demoPageLabel"
);

const demoPages = [
    {
        element: document.getElementById("demoDashboard"),
        label: "Dashboard"
    },
    {
        element: document.getElementById("demoMonthlySummary"),
        label: "Monthly Summary"
    },
    {
        element: document.getElementById("demoAccounts"),
        label: "Accounts"
    }
];

let currentDemoPage = 0;
let demoTransitioning = false;

function renderDemoPage(direction = 0) {
    demoPages.forEach((page, index) => {
        if (!page.element) return;

        page.element.classList.remove(
            "slide-in-left",
            "slide-in-right"
        );

        page.element.hidden = index !== currentDemoPage;
    });

    const activePage = demoPages[currentDemoPage];

    if (demoPageLabel) {
        demoPageLabel.textContent = activePage.label;
    }

    if (demoPrevBtn) {
        demoPrevBtn.disabled =
            demoTransitioning || currentDemoPage === 0;
    }

    if (demoNextBtn) {
        demoNextBtn.disabled =
            demoTransitioning ||
            currentDemoPage === demoPages.length - 1;
    }

    if (!activePage.element || direction === 0) return;

    if (prefersReducedMotion.matches) return;

    // Restart the slide animation when changing screens.
    void activePage.element.offsetWidth;

    activePage.element.classList.add(
        direction > 0
            ? "slide-in-right"
            : "slide-in-left"
    );
}

function changeDemoPage(direction) {
    if (demoTransitioning) return;

    const nextPage = currentDemoPage + direction;

    if (nextPage < 0 || nextPage >= demoPages.length) {
        return;
    }

    demoTransitioning = true;
    currentDemoPage = nextPage;

    renderDemoPage(direction);

    window.setTimeout(() => {
        demoTransitioning = false;
        renderDemoPage();
    }, prefersReducedMotion.matches ? 0 : 280);
}

function openDemo() {
    currentDemoPage = 0;
    demoTransitioning = false;

    renderDemoPage();
    openModal(demoOverlay);
}

if (demoBtn) {
    demoBtn.addEventListener("click", openDemo);
}

if (closeDemoBtn) {
    closeDemoBtn.addEventListener("click", closeModal);
}

if (demoPrevBtn) {
    demoPrevBtn.addEventListener("click", () => {
        changeDemoPage(-1);
    });
}

if (demoNextBtn) {
    demoNextBtn.addEventListener("click", () => {
        changeDemoPage(1);
    });
}

// Set the initial demo screen.
renderDemoPage();


/* =========================================
   CONTACT MODAL
   ========================================= */

const contactLink = document.getElementById("contactLink");
const contactForm = document.getElementById("contactForm");

const contactName = document.getElementById("contactName");
const contactEmail = document.getElementById("contactEmail");
const contactPhone = document.getElementById("contactPhone");
const contactQuestion = document.getElementById(
    "contactQuestion"
);

const contactMessage = document.getElementById(
    "contactMessage"
);

function openContact() {
    if (contactForm) {
        contactForm.reset();
    }

    showMessage(contactMessage, "");
    openModal(contactModal);

    if (contactName) {
        contactName.focus({ preventScroll: true });
    }
}

if (contactLink) {
    contactLink.addEventListener("click", event => {
        event.preventDefault();
        openContact();
    });
}

if (contactForm) {
    contactForm.addEventListener("submit", event => {
        event.preventDefault();

        const name = contactName?.value.trim() || "";
        const email = contactEmail?.value.trim() || "";
        const phone = contactPhone?.value.trim() || "";
        const question = contactQuestion?.value.trim() || "";

        if (!email || !question) {
            showMessage(
                contactMessage,
                "Please enter your email and question."
            );
            return;
        }

        // The form will send inquiries to DnA Financial
        // once an email delivery service is connected.
        // No message is sent by this placeholder.

        showMessage(
            contactMessage,
            "The contact form is not connected to message delivery yet."
        );
    });
}