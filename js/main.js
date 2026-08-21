// Element that opened the modal — focus goes back to it on close.
let lastTrigger = null;

function closePopup() {
    const overlay = document.getElementById("popup-overlay");
    const content = document.getElementById("popup-content");

    overlay.style.display = "none";
    content.innerHTML = "";

    if (lastTrigger) {
        lastTrigger.focus();
        lastTrigger = null;
    }
}

function openPopup(tile) {
    const file = tile.getAttribute("data-file");
    const overlay = document.getElementById("popup-overlay");
    const content = document.getElementById("popup-content");

    lastTrigger = tile;

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
            document.getElementById("popup-close").focus();
        })
        .catch(error => {
            console.error("Error loading content:", error);
            content.innerHTML = "<p style='color:red;'>Failed to load content.</p>";
            overlay.style.display = "flex";
            document.getElementById("popup-close").focus();
        });
}

function setupPopupListeners(selector) {
    document.querySelectorAll(selector).forEach(tile => {
        tile.addEventListener("click", function () {
            openPopup(this);
        });

        // Tiles are divs with role="button" — mirror native button keys.
        tile.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
                e.preventDefault();
                openPopup(this);
            }
        });
    });
}

function setupModalControls() {
    const overlay = document.getElementById("popup-overlay");

    document.getElementById("popup-close").addEventListener("click", closePopup);

    // Click outside modal closes it
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closePopup();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay.style.display !== "none" && overlay.style.display !== "") {
            closePopup();
        }
    });
}

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
    setupModalControls();
    openPopupFromURL(); // 🔁 Check for ?project=... on page load
});
