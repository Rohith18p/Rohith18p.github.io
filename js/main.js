function setupPopupListeners(selector) {
    document.querySelectorAll(selector).forEach(tile => {
        tile.addEventListener("click", function () {
            const file = this.getAttribute("data-file");
            const overlay = document.getElementById("popup-overlay");
            const content = document.getElementById("popup-content");

            fetch(file)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(data => {
                    content.innerHTML = data;
                    overlay.style.display = "flex";
                })
                .catch(error => {
                    console.error("Error loading content:", error);
                    content.innerHTML = "<p style='color:red;'>Failed to load content.</p>";
                    overlay.style.display = "flex";
                });

            // Close button
            const closeBtn = document.getElementById("popup-close");
            closeBtn.onclick = () => {
                overlay.style.display = "none";
                content.innerHTML = "";
            };

            // Click outside modal closes it
            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    overlay.style.display = "none";
                    content.innerHTML = "";
                }
            };
        });
    });
}

// Setup for both Experience and Project tiles
window.addEventListener("DOMContentLoaded", () => {
    setupPopupListeners(".experience-tile");
    setupPopupListeners(".project-tile");
});

function openPopupFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get("project");

    if (projectId) {
        const tile = document.getElementById(projectId);
        if (tile) {
            tile.click(); // simulate click to open popup
        }
    }
}

window.addEventListener("DOMContentLoaded", () => {
    setupPopupListeners(".experience-tile");
    setupPopupListeners(".project-tile");
    openPopupFromURL(); // 🔁 Check for ?project=... on page load
});