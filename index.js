/* =========================================
   FIREBASE IMPORTS
   ========================================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";


/* =========================================
   FIREBASE CONFIGURATION
   ========================================= */
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
   FOOTER YEAR
   ========================================= */
const currentYear = document.getElementById("currentYear");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}


/* =========================================
   MODAL ELEMENTS
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

let activeOverlay = null;
let previousFocus = null;


/* =========================================
   MODAL HELPERS
   ========================================= */
function openModal(modal) {
    if (!modal) return;

    // Close any other open overlay
    allOverlays.forEach(overlay => {
        overlay.hidden = true;
    });

    previousFocus = document.activeElement;
    activeOverlay = modal;

    modal.hidden = false;
    document.body.classList.add("modal-open");

    // Focus the first usable field or control
    const firstControl = modal.querySelector(
        "input:not([disabled]), textarea:not([disabled]), button:not([disabled])"
    );

    if (firstControl) {
        firstControl.focus();
    }
}

function closeModal() {
    if (!activeOverlay) return;

    activeOverlay.hidden = true;
    activeOverlay = null;

    document.body.classList.remove("modal-open");

    if (previousFocus && previousFocus.isConnected) {
        previousFocus.focus();
    }

    previousFocus = null;
}

// Close buttons
document.querySelectorAll("[data-close-modal]").forEach(button => {
    button.addEventListener("click", closeModal);
});

// Click outside modal to close
allOverlays.forEach(overlay => {
    overlay.addEventListener("click", event => {
        if (event.target === overlay) {
            closeModal();
        }
    });
});

// Escape key closes active overlay
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && activeOverlay) {
        closeModal();
    }
});


/* =========================================
   FORM MESSAGE HELPER
   ========================================= */
function showMessage(element, message, type = "") {
    if (!element) return;

    element.textContent = message;
    element.classList.remove("error", "success");

    if (type) {
        element.classList.add(type);
    }
}

function getAuthErrorMessage(error) {
    switch (error.code) {
        case "auth/email-already-in-use":
            return "An account with this email already exists. Please log in.";

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/weak-password":
            return "Please choose a stronger password.";

        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
            return "The email or password is incorrect.";

        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";

        case "auth/network-request-failed":
            return "Connection problem. Please check your internet and try again.";

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

const loginContinueBtn = document.getElementById("loginContinueBtn");
const loginBackBtn = document.getElementById("loginBackBtn");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");

const loginEmailDisplay = document.getElementById("loginEmailDisplay");
const loginMessage = document.getElementById("loginMessage");

function resetLoginSteps() {
    loginForm?.reset();

    if (loginEmailStep) loginEmailStep.hidden = false;
    if (loginPasswordStep) loginPasswordStep.hidden = true;

    showMessage(loginMessage, "");
}

function openLogin() {
    resetLoginSteps();
    openModal(loginModal);
    loginEmail?.focus();
}

loginBtn?.addEventListener("click", openLogin);
startBtn?.addEventListener("click", openLogin);

// Step 1: Email
loginContinueBtn?.addEventListener("click", () => {
    if (!loginEmail.checkValidity()) {
        loginEmail.reportValidity();
        return;
    }

    loginEmailDisplay.textContent = loginEmail.value.trim();

    loginEmailStep.hidden = true;
    loginPasswordStep.hidden = false;

    showMessage(loginMessage, "");
    loginPassword.focus();
});

// Allow Enter on email step
loginEmail?.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        event.preventDefault();
        loginContinueBtn.click();
    }
});

// Return to email step
loginBackBtn?.addEventListener("click", () => {
    loginPasswordStep.hidden = true;
    loginEmailStep.hidden = false;

    loginPassword.value = "";
    showMessage(loginMessage, "");

    loginEmail.focus();
});

// Step 2: Password and Firebase login
loginForm?.addEventListener("submit", async event => {
    event.preventDefault();

    if (loginPasswordStep.hidden) {
        loginContinueBtn.click();
        return;
    }

    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
        showMessage(loginMessage, "Please enter your email and password.", "error");
        return;
    }

    const submitBtn = loginForm.querySelector(
        '#loginPasswordStep button[type="submit"]'
    );

    if (submitBtn) submitBtn.disabled = true;

    try {
        await signInWithEmailAndPassword(auth, email, password);

        showMessage(loginMessage, "Login successful!", "success");

        window.location.href = "dashboard.html";
    } catch (error) {
        showMessage(loginMessage, getAuthErrorMessage(error), "error");
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
});

// Forgot password
forgotPasswordBtn?.addEventListener("click", async () => {
    const email = loginEmail.value.trim();

    if (!email) {
        showMessage(loginMessage, "Please enter your email first.", "error");
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
        if (
            error.code === "auth/user-not-found" ||
            error.code === "auth/invalid-credential"
        ) {
            showMessage(
                loginMessage,
                "If an account exists for this email, a password reset link will be sent.",
                "success"
            );
        } else {
            showMessage(loginMessage, getAuthErrorMessage(error), "error");
        }
    } finally {
        forgotPasswordBtn.disabled = false;
    }
});


/* =========================================
   SIGN UP MODAL
   ========================================= */
const signupBtn = document.getElementById("signupBtn");
const signupForm = document.getElementById("signupForm");

const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const confirmPassword = document.getElementById("confirmPassword");

const signupMessage = document.getElementById("signupMessage");
const switchToLoginBtn = document.getElementById("switchToLoginBtn");

signupBtn?.addEventListener("click", () => {
    signupForm?.reset();
    showMessage(signupMessage, "");

    openModal(signupModal);
    signupEmail?.focus();
});

signupForm?.addEventListener("submit", async event => {
    event.preventDefault();

    const email = signupEmail.value.trim();
    const password = signupPassword.value;
    const confirmation = confirmPassword.value;

    if (password !== confirmation) {
        showMessage(signupMessage, "Passwords do not match.", "error");
        return;
    }

    if (password.length < 6) {
        showMessage(
            signupMessage,
            "Your password must contain at least 6 characters.",
            "error"
        );
        return;
    }

    const submitBtn = signupForm.querySelector('button[type="submit"]');

    if (submitBtn) submitBtn.disabled = true;

    try {
        await createUserWithEmailAndPassword(auth, email, password);

        showMessage(signupMessage, "Account created successfully!", "success");

        window.location.href = "dashboard.html";
    } catch (error) {
        showMessage(signupMessage, getAuthErrorMessage(error), "error");
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
});

// Switch from Sign Up to Login
switchToLoginBtn?.addEventListener("click", openLogin);


/* =========================================
   SAMPLE DASHBOARD
   ========================================= */
const demoBtn = document.getElementById("demoBtn");
const closeDemoBtn = document.getElementById("closeDemoBtn");

const demoPrevBtn = document.getElementById("demoPrevBtn");
const demoNextBtn = document.getElementById("demoNextBtn");
const demoPageLabel = document.getElementById("demoPageLabel");

const demoPages = [
    {
        element: document.getElementById("demoDashboard"),
        title: "Dashboard"
    },
    {
        element: document.getElementById("demoMonthlySummary"),
        title: "Monthly Summary"
    },
    {
        element: document.getElementById("demoAccounts"),
        title: "Accounts"
    }
];

let currentDemoPage = 0;

function showDemoPage(index) {
    if (index < 0 || index >= demoPages.length) return;

    currentDemoPage = index;

    demoPages.forEach((page, pageIndex) => {
        if (page.element) {
            page.element.hidden = pageIndex !== index;
        }
    });

    demoPageLabel.textContent = demoPages[index].title;

    demoPrevBtn.disabled = index === 0;
    demoNextBtn.disabled = index === demoPages.length - 1;
}

demoBtn?.addEventListener("click", () => {
    showDemoPage(0);
    openModal(demoOverlay);
});

closeDemoBtn?.addEventListener("click", closeModal);

demoPrevBtn?.addEventListener("click", () => {
    showDemoPage(currentDemoPage - 1);
});

demoNextBtn?.addEventListener("click", () => {
    showDemoPage(currentDemoPage + 1);
});


/* =========================================
   CONTACT MODAL
   ========================================= */
const contactLink = document.getElementById("contactLink");
const contactForm = document.getElementById("contactForm");
const contactMessage = document.getElementById("contactMessage");

contactLink?.addEventListener("click", event => {
    event.preventDefault();

    contactForm?.reset();
    showMessage(contactMessage, "");

    openModal(contactModal);
});

contactForm?.addEventListener("submit", event => {
    event.preventDefault();

    showMessage(
        contactMessage,
        "The contact form is not connected to message delivery yet.",
        "error"
    );
});