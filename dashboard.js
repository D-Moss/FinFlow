// Highlight active sidebar link when clicked
const sidebarLinks = document.querySelectorAll(".sidebar-nav a");

sidebarLinks.forEach(link => {
    link.addEventListener("click", () => {
        sidebarLinks.forEach(item => item.classList.remove("active-link"));
        link.classList.add("active-link");
    });
});


// Upload button placeholder
const uploadButton = document.querySelector(".upload-box button");

if (uploadButton) {
    uploadButton.addEventListener("click", () => {
        alert("Upload feature coming soon.");
    });
}