
/* =========================================================
   TET3RHQ STUDIO
   PUBLIC WEBSITE INTERACTIONS
========================================================= */

const API_BASE_URL = "";

/* 01. GENERAL HELPERS */

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function safeURL(value) {
    if (!value) return "";

    try {
        const url = new URL(String(value), window.location.origin);

        if (!["http:", "https:"].includes(url.protocol)) {
            return "";
        }

        return url.href;
    } catch {
        return "";
    }
}

function extractCollection(payload, collectionName) {
    if (Array.isArray(payload)) return payload;

    if (!payload || typeof payload !== "object") {
        return [];
    }

    if (Array.isArray(payload[collectionName])) {
        return payload[collectionName];
    }

    for (const key of ["data", "results", "items"]) {
        if (Array.isArray(payload[key])) {
            return payload[key];
        }

        if (
            payload[key] &&
            typeof payload[key] === "object" &&
            Array.isArray(payload[key][collectionName])
        ) {
            return payload[key][collectionName];
        }
    }

    return [];
}

async function fetchPublicData(endpoint, collectionName) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
            Accept: "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    const payload = await response.json();

    if (payload && payload.success === false) {
        throw new Error(payload.error || "Unable to load content.");
    }

    return extractCollection(payload, collectionName);
}


/* 02. MOBILE NAVIGATION */

function initialiseNavigation() {
    const menuToggle = document.querySelector(".menu-toggle");
    const mainNav = document.querySelector(".main-nav");
    const navLinks = document.querySelectorAll(".main-nav a");

    if (!menuToggle || !mainNav) return;

    function closeMenu() {
        mainNav.classList.remove("active");

        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
        menuToggle.textContent = "☰";
    }

    function openMenu() {
        mainNav.classList.add("active");

        menuToggle.setAttribute("aria-expanded", "true");
        menuToggle.setAttribute("aria-label", "Close navigation");
        menuToggle.textContent = "✕";
    }

    menuToggle.addEventListener("click", () => {
        const isOpen = mainNav.classList.contains("active");

        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    navLinks.forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 850) {
            closeMenu();
        }
    });
}


/* 03. THEME SWITCHER */

function initialiseTheme() {
    const themeToggle = document.querySelector(".theme-toggle");

    if (!themeToggle) return;

    const storageKey = "tet3rhq-theme";

    function applyTheme(theme) {
        const isLight = theme === "light";

        document.body.classList.toggle("light-mode", isLight);

        themeToggle.textContent = isLight ? "☀" : "◐";

        themeToggle.setAttribute(
            "aria-label",
            isLight ? "Switch to dark theme" : "Switch to light theme"
        );
    }

    let savedTheme = "dark";

    try {
        savedTheme = localStorage.getItem(storageKey) || "dark";
    } catch {
        savedTheme = "dark";
    }

    applyTheme(savedTheme);

    themeToggle.addEventListener("click", () => {
        const nextTheme = document.body.classList.contains("light-mode")
            ? "dark"
            : "light";

        applyTheme(nextTheme);

        try {
            localStorage.setItem(storageKey, nextTheme);
        } catch {
            // Theme still works if browser storage is unavailable.
        }
    });
}


/* 04. HEADER SCROLL EFFECT */

function initialiseHeader() {
    const header = document.querySelector(".site-header");

    if (!header) return;

    function updateHeader() {
        header.classList.toggle("scrolled", window.scrollY > 40);
    }

    updateHeader();

    window.addEventListener("scroll", updateHeader, {
        passive: true
    });
}


/* 05. BACK TO TOP */

function initialiseBackToTop() {
    const backToTop = document.querySelector(".back-to-top");

    if (!backToTop) return;

    function updateVisibility() {
        backToTop.classList.toggle("visible", window.scrollY > 450);
    }

    updateVisibility();

    window.addEventListener("scroll", updateVisibility, {
        passive: true
    });
}


/* 06. FOOTER YEAR */

function initialiseFooterYear() {
    const yearElement = document.querySelector("#current-year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}


/* 07. HERO TEXT ANIMATION */

function initialiseHeroMotion() {
    const heroAccent = document.querySelector(".hero-accent");

    if (!heroAccent) return;

    const phrases = [
        "I engineer digital systems.",
        "I turn ideas into interfaces.",
        "I build for the web.",
        "I create with precision."
    ];

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    let currentPhrase = 0;

    window.setInterval(() => {
        heroAccent.style.opacity = "0";
        heroAccent.style.transform = "translateY(8px)";

        window.setTimeout(() => {
            currentPhrase = (currentPhrase + 1) % phrases.length;

            heroAccent.textContent = phrases[currentPhrase];

            heroAccent.style.opacity = "1";
            heroAccent.style.transform = "translateY(0)";
        }, 250);

    }, 3500);
}


/* 08. PROJECT IMAGE URL */

function getProjectImageURL(imageKey) {
    if (!imageKey) return "";

    const encodedKey = String(imageKey)
        .split("/")
        .map(part => encodeURIComponent(part))
        .join("/");

    return `${API_BASE_URL}/api/images/${encodedKey}`;
}


/* 09. PROJECT CARD */

function createProjectCard(project) {
    const title = escapeHTML(project.title || "Untitled project");
    const description = escapeHTML(
        project.description || "A digital project developed by Tet3rHq Studio."
    );

    const categories = String(project.category || "")
        .split(/[,|]/)
        .map(category => category.trim())
        .filter(Boolean);

    const liveURL = safeURL(project.live_url);
    const githubURL = safeURL(project.github_url);
    const imageURL = getProjectImageURL(project.image_key);

    const tagsHTML = categories.length
        ? categories.map(category => `
            <span>${escapeHTML(category)}</span>
        `).join("")
        : "";

    const linksHTML = [
        liveURL
            ? `<a href="${escapeHTML(liveURL)}" target="_blank" rel="noopener noreferrer">View live project ↗</a>`
            : "",
        githubURL
            ? `<a href="${escapeHTML(githubURL)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>`
            : ""
    ].filter(Boolean).join("");

    const imageHTML = imageURL
        ? `
            <img
                src="${escapeHTML(imageURL)}"
                alt="${title} project preview"
                loading="lazy"
                decoding="async"
            >
        `
        : `
            <div class="project-image-placeholder">
                PROJECT PREVIEW
            </div>
        `;

    return `
        <article class="project-card">

            <div class="project-image">
                ${imageHTML}
            </div>

            <div class="project-info">

                <h3>${title}</h3>

                <p>${description}</p>

                ${tagsHTML ? `
                    <div class="project-tags">
                        ${tagsHTML}
                    </div>
                ` : ""}

                ${linksHTML ? `
                    <div class="project-links">
                        ${linksHTML}
                    </div>
                ` : ""}

            </div>

        </article>
    `;
}


/* 10. LOAD PROJECTS */

async function loadProjects() {
    const container = document.querySelector("#projects-container");

    if (!container) return;

    container.innerHTML = `
        <p class="loading-message">Loading selected projects...</p>
    `;

    try {
        const projects = await fetchPublicData(
            "/api/projects",
            "projects"
        );

        if (!projects.length) {
            container.innerHTML = `
                <p class="empty-message">
                    New projects are currently being prepared.
                </p>
            `;
            return;
        }

        container.innerHTML = projects
            .map(createProjectCard)
            .join("");

        container.querySelectorAll(".project-image img").forEach(image => {
            image.addEventListener("error", () => {
                const placeholder = document.createElement("div");

                placeholder.className = "project-image-placeholder";
                placeholder.textContent = "PREVIEW UNAVAILABLE";

                image.replaceWith(placeholder);
            }, { once: true });
        });

    } catch (error) {
        console.error("Project loading error:", error);

        container.innerHTML = `
            <p class="empty-message">
                Projects are temporarily unavailable.
                Please check back shortly.
            </p>
        `;
    }
}


/* 11. TESTIMONIAL CARD */

function createTestimonialCard(testimonial) {
    const content = escapeHTML(testimonial.content || "");
    const clientName = escapeHTML(
        testimonial.client_name || "Client"
    );

    const role = escapeHTML(testimonial.client_role || "");
    const company = escapeHTML(testimonial.company || "");

    const details = [role, company]
        .filter(Boolean)
        .join(" / ");

    return `
        <article class="testimonial-card">

            <p>“${content}”</p>

            <h3>${clientName}</h3>

            ${details ? `<span>${details}</span>` : ""}

        </article>
    `;
}


/* 12. LOAD TESTIMONIALS */

async function loadTestimonials() {
    const container = document.querySelector(
        "#testimonials-container"
    );

    if (!container) return;

    container.innerHTML = `
        <p class="loading-message">Loading testimonials...</p>
    `;

    try {
        const testimonials = await fetchPublicData(
            "/api/testimonials",
            "testimonials"
        );

        if (!testimonials.length) {
            container.innerHTML = `
                <p class="empty-message">
                    Client experiences will appear here soon.
                </p>
            `;
            return;
        }

        container.innerHTML = testimonials
            .map(createTestimonialCard)
            .join("");

    } catch (error) {
        console.error("Testimonial loading error:", error);

        container.innerHTML = `
            <p class="empty-message">
                Testimonials are temporarily unavailable.
            </p>
        `;
    }
}


/* 13. ACTIVE NAVIGATION */

function initialiseActiveNavigation() {
    const navLinks = document.querySelectorAll(".main-nav a");

    if (!navLinks.length || !("IntersectionObserver" in window)) {
        return;
    }

    const sections = Array.from(navLinks)
        .map(link => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    if (!sections.length) return;

    const observer = new IntersectionObserver(entries => {
        const visibleSections = entries
            .filter(entry => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visibleSections.length) return;

        const activeID = visibleSections[0].target.id;

        navLinks.forEach(link => {
            const isActive = link.getAttribute("href") === `#${activeID}`;

            link.classList.toggle("active", isActive);

            if (isActive) {
                link.setAttribute("aria-current", "location");
            } else {
                link.removeAttribute("aria-current");
            }
        });

    }, {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0, 0.15, 0.35, 0.6]
    });

    sections.forEach(section => observer.observe(section));
}


/* 14. INITIALISE WEBSITE */

document.addEventListener("DOMContentLoaded", () => {
    initialiseNavigation();
    initialiseTheme();
    initialiseHeader();
    initialiseBackToTop();
    initialiseFooterYear();
    initialiseHeroMotion();
    initialiseActiveNavigation();

    loadProjects();
    loadTestimonials();
});
