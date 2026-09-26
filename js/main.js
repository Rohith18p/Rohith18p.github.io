// Element that opened the modal — focus returns to it on close.
let lastTrigger = null;
let activeRequest = null;

const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "iframe",
    "[tabindex]:not([tabindex='-1'])"
].join(",");

function modalIsOpen() {
    return document.getElementById("popup-overlay").getAttribute("aria-hidden") === "false";
}

function setPageInert(isInert) {
    document.querySelectorAll("body > :not(#popup-overlay):not(script)")
        .forEach(element => { element.inert = isInert; });
}

function closePopup() {
    const overlay = document.getElementById("popup-overlay");
    const modal = document.getElementById("popup-modal");
    const content = document.getElementById("popup-content");

    if (activeRequest) {
        activeRequest.abort();
        activeRequest = null;
    }

    overlay.style.display = "none";
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    setPageInert(false);
    content.innerHTML = "";
    modal.classList.remove("experience-modal", "project-modal");

    if (lastTrigger) {
        lastTrigger.focus();
        lastTrigger = null;
    }
}

function openPopup(tile) {
    const file = tile.getAttribute("data-file");
    const overlay = document.getElementById("popup-overlay");
    const modal = document.getElementById("popup-modal");
    const content = document.getElementById("popup-content");
    const closeButton = document.getElementById("popup-close");

    if (activeRequest) activeRequest.abort();
    activeRequest = new AbortController();
    const request = activeRequest;

    lastTrigger = tile;
    const isExperience = tile.classList.contains("experience-tile");
    const isProject = tile.classList.contains("project-tile");
    modal.classList.toggle("experience-modal", isExperience);
    modal.classList.toggle("project-modal", isProject);
    content.innerHTML = '<p class="popup-status">Loading details…</p>';
    overlay.style.display = "flex";
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    setPageInert(true);
    closeButton.focus();

    fetch(file, { signal: request.signal })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            if (activeRequest !== request) return;
            content.innerHTML = data;

            activeRequest = null;
        })
        .catch(error => {
            if (error.name === "AbortError") return;
            console.error("Error loading content:", error);
            content.innerHTML = '<p class="popup-status popup-status-error">Failed to load details. Please try again.</p>';
            activeRequest = null;
        });
}

function setupPopupListeners(selector) {
    document.querySelectorAll(selector).forEach(tile => {
        tile.addEventListener("click", function () {
            openPopup(this);
        });

        // Tiles are divs with role="button" — mirror native button keys.
        tile.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openPopup(this);
            }
        });
    });
}

function setupProjectFilters() {
    const selectedGrid = document.getElementById("project-selected-grid");
    const archiveGrid = document.getElementById("project-archive-grid");
    const buttons = [...document.querySelectorAll(".project-filter")];
    const projects = [...document.querySelectorAll(".project-tile[data-domains]")];
    const label = document.getElementById("project-view-label");
    const description = document.getElementById("project-view-description");

    if (!selectedGrid || !archiveGrid || buttons.length === 0 || projects.length === 0) return;

    // Domain-specific editorial order. Any future matching projects that are
    // not listed here are appended automatically, so the filters stay robust.
    const domainOrder = {
        featured: ["project36", "project38", "project35", "project23", "project15"],
        planning: ["project36", "project34", "project31", "project14"],
        perception: ["project38", "project37", "project35", "project33", "project15", "project12"],
        manipulation: ["project23", "project32", "project34", "project21", "project15", "project22"],
        control: ["project36", "project32", "project31", "project23", "project21", "project13", "project14", "project12"],
        systems: ["project38", "project15", "project35", "project23", "project21", "project33", "project13", "project14", "project12", "project22", "project11"]
    };
    const projectById = new Map(projects.map(project => [project.id, project]));

    function showFilter(button) {
        const filter = button.dataset.filter;

        buttons.forEach(filterButton => {
            const selected = filterButton === button;
            filterButton.classList.toggle("is-active", selected);
            filterButton.setAttribute("aria-pressed", String(selected));
        });

        const matchesFilter = project => project.dataset.domains.split(/\s+/).includes(filter);
        const orderedMatches = (domainOrder[filter] || [])
            .map(projectId => projectById.get(projectId))
            .filter(project => project && matchesFilter(project));
        const orderedSet = new Set(orderedMatches);
        const selectedProjects = [
            ...orderedMatches,
            ...projects.filter(project => matchesFilter(project) && !orderedSet.has(project))
        ];
        const selectedSet = new Set(selectedProjects);
        const remainingProjects = projects.filter(project => !selectedSet.has(project));

        projects.forEach(project => project.classList.remove("project-lead"));
        if (selectedProjects[0]) selectedProjects[0].classList.add("project-lead");

        selectedProjects.forEach(project => selectedGrid.append(project));
        remainingProjects.forEach(project => archiveGrid.append(project));

        const filterName = button.textContent.trim();
        label.textContent = filter === "featured" ? "Featured projects" : filterName;
        description.textContent = button.dataset.description;

    }

    buttons.forEach(button => {
        button.addEventListener("click", () => showFilter(button));
    });

    showFilter(buttons.find(button => button.classList.contains("is-active")) || buttons[0]);
}

function trapModalFocus(event) {
    if (event.key !== "Tab" || !modalIsOpen()) return;

    const modal = document.getElementById("popup-modal");
    const focusable = [...modal.querySelectorAll(focusableSelector)]
        .filter(element => element.getClientRects().length > 0);

    if (focusable.length === 0) {
        event.preventDefault();
        modal.focus();
        return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

function setupModalControls() {
    const overlay = document.getElementById("popup-overlay");

    document.getElementById("popup-close").addEventListener("click", closePopup);

    overlay.addEventListener("click", event => {
        if (event.target === overlay) closePopup();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && modalIsOpen()) closePopup();
        trapModalFocus(event);
    });
}

function openPopupFromURL() {
    const projectId = new URLSearchParams(window.location.search).get("project");
    const tile = projectId ? document.getElementById(projectId) : null;
    if (tile) openPopup(tile);
}

window.addEventListener("DOMContentLoaded", () => {
    setupProjectFilters();
    setupPopupListeners(".experience-tile");
    setupPopupListeners(".project-tile");
    setupModalControls();
    openPopupFromURL();
});
