document.querySelectorAll(".experience-tile").forEach(tile => {
    tile.addEventListener("click", function () {
        const dropdown = this.querySelector(".dropdown-content");

        // Toggle visibility of the dropdown content
        if (dropdown.style.display === "none" || dropdown.style.display === "") {
            const file = this.getAttribute("data-file");

            // Fetch and display the content
            fetch(file)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.text();
                })
                .then(data => {
                    dropdown.innerHTML = data;
                    dropdown.style.display = "block"; // Show the content
                })
                .catch(error => {
                    console.error("Error loading the content:", error);
                    dropdown.innerHTML = "<p style='color: red;'>Failed to load content. Please try again.</p>";
                    dropdown.style.display = "block"; // Show error message
                });
        } else {
            dropdown.style.display = "none"; // Hide the content
        }
    });
});