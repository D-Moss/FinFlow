// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

import {
    getStorage,
    ref,
    uploadBytes
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-storage.js";


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
const storage = getStorage(app);


// Sign Up
document.getElementById("signupBtn").addEventListener("click", () => {

    const email = prompt("Enter email:");
    const password = prompt("Enter password:");

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            alert("Account created!");
            console.log(userCredential.user);
        })
        .catch((error) => {
            alert(error.message);
        });

});


// Login
document.getElementById("loginBtn").addEventListener("click", () => {

    const email = prompt("Enter email:");
    const password = prompt("Enter password:");

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            alert("Logged in!");
            console.log(userCredential.user);
        })
        .catch((error) => {
            alert(error.message);
        });

});


// File Upload
document.getElementById("uploadBtn").addEventListener("click", async () => {

    const user = auth.currentUser;

    if (!user) {
        alert("Please log in before uploading a file.");
        return;
    }

    const fileInput = document.getElementById("fileUpload");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file.");
        return;
    }

    try {

        const storageRef = ref(storage, `users/${user.uid}/uploads/${file.name}`);

        await uploadBytes(storageRef, file);

        alert("File uploaded successfully!");

    } catch (error) {

        console.error(error);
        alert(error.message);

    }

});