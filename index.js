// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";


// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyDKNumgI1MvLAdPqD4u3Qah_SbWWAbfwR4",
    authDomain: "finflow-dcab6.firebaseapp.com",
    projectId: "finflow-dcab6",
    storageBucket: "finflow-dcab6.firebasestorage.app",
    messagingSenderId: "536136161454",
    appId: "1:536136161454:web:885b77f96109d30850f53f",
    measurementId: "G-MDY4MDRC16"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


// Footer year
const currentYear = document.getElementById("currentYear");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}


// Sign Up
const signupBtn = document.getElementById("signupBtn");

if (signupBtn) {
    signupBtn.addEventListener("click", () => {
        const email = prompt("Enter email:");
        const password = prompt("Enter password:");

        if (!email || !password) {
            alert("Please enter both an email and password.");
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                alert("Account created!");
                console.log(userCredential.user);

                // Send user to dashboard after signup
                window.location.href = "dashboard.html";
            })
            .catch((error) => {
                alert(error.message);
            });
    });
}


// Login
const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
    loginBtn.addEventListener("click", () => {
        const email = prompt("Enter email:");
        const password = prompt("Enter password:");

        if (!email || !password) {
            alert("Please enter both an email and password.");
            return;
        }

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                alert("Logged in!");
                console.log(userCredential.user);

                // Send user to dashboard after login
                window.location.href = "dashboard.html";
            })
            .catch((error) => {
                alert(error.message);
            });
    });
}


// Hero button: login to upload documents
const startBtn = document.getElementById("startBtn");

if (startBtn) {
    startBtn.addEventListener("click", () => {
        loginBtn.click();
    });
}


// Sample dashboard button
const demoBtn = document.getElementById("demoBtn");

if (demoBtn) {
    demoBtn.addEventListener("click", () => {
        window.location.href = "dashboard.html";
    });
}