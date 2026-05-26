// Automatic greeting
const greetingText = document.getElementById("greetingText");

if (greetingText) {
    const hour = new Date().getHours();

    if (hour < 12) {
        greetingText.textContent = "Good Morning";
    } else if (hour < 18) {
        greetingText.textContent = "Good Afternoon";
    } else {
        greetingText.textContent = "Good Evening";
    }
}


// Highlight active sidebar link when clicked
const sidebarLinks = document.querySelectorAll(".sidebar-nav a");

sidebarLinks.forEach(link => {
    link.addEventListener("click", () => {
        sidebarLinks.forEach(item => item.classList.remove("active-link"));
        link.classList.add("active-link");
    });
});


// Profit/Loss color logic
const profitLossAmount = document.getElementById("profitLossAmount");

if (profitLossAmount) {
    const value = parseFloat(profitLossAmount.textContent.replace(/[$,]/g, ""));

    profitLossAmount.classList.remove("profit", "loss", "neutral");

    if (value > 0) {
        profitLossAmount.classList.add("profit");
    } else if (value < 0) {
        profitLossAmount.classList.add("loss");
    } else {
        profitLossAmount.classList.add("neutral");
    }
}


// Upload button placeholder
const uploadButton = document.querySelector(".upload-box button");

if (uploadButton) {
    uploadButton.addEventListener("click", () => {
        alert("Upload feature coming soon.");
    });
}