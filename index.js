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

import {
    getFirestore,
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";


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
const db = getFirestore(app);


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

        // Parse CSV and display transactions
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,

            complete: async function(results) {

                const tableBody = document.getElementById("transactionsBody");
                tableBody.innerHTML = "";

                let totalIncome = 0;
                let totalExpenses = 0;

                for (const transaction of results.data) {

                    const row = document.createElement("tr");

                    let category = "Other";

                    const description = (transaction.Description || "").toLowerCase();
                    const amount = parseFloat(transaction.Amount) || 0;

                    if (amount > 0) {
                        totalIncome += amount;
                    } else if (amount < 0) {
                        totalExpenses += Math.abs(amount);
                    }

                    if (amount > 0) {
                        category = "Income";
                    } 
                    else if (
                        description.includes("mcdonalds") ||
                        description.includes("popeyes") ||
                        description.includes("7-eleven")
                    ) {
                        category = "Meals/Food";
                    } 
                    else if (
                        description.includes("shell") && Math.abs(amount) >= 25
                    ) {
                        category = "Gas";
                    }
                    else if (
                        description.includes("disney") ||
                        description.includes("netflix") ||
                        description.includes("hulu")
                    ) {
                        category = "Entertainment";
                    }

                    row.innerHTML = `
                        <td>${transaction.Date || ""}</td>
                        <td>${category}</td>
                        <td>${transaction.Vendor || ""}</td>
                        <td>${transaction.Description || ""}</td>
                        <td>${transaction.Amount || ""}</td>
                        <td>${transaction["Payment Method"] || ""}</td>
                    `;

                    tableBody.appendChild(row);

                    // Save transaction to Firestore
                    await addDoc(
                        collection(db, "users", user.uid, "transactions"),
                        {
                            date: transaction.Date || "",
                            category: category,
                            vendor: transaction.Vendor || "",
                            description: transaction.Description || "",
                            amount: amount,
                            paymentMethod: transaction["Payment Method"] || "",
                            sourceFile: file.name,
                            createdAt: new Date()
                        }
                    );

                }

                const profit = totalIncome - totalExpenses;
                const estimatedTax = profit > 0 ? profit * 0.15 : 0;

                document.getElementById("total-income").innerText = `$${totalIncome.toFixed(2)}`;
                document.getElementById("total-expenses").innerText = `$${totalExpenses.toFixed(2)}`;
                document.getElementById("est-tax").innerText = `$${estimatedTax.toFixed(2)}`;

                alert("Transactions saved to database!");

            }

        });

    } catch (error) {

        console.error(error);
        alert(error.message);

    }

});