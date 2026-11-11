
/* =====================================================
   TET3RHQ STUDIO — FRONTEND INTERACTIONS
   Public API / Navigation / Theme / Motion
===================================================== */

const API_BASE_URL = "";

/* 01. HELPERS */

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

function safeURL(value) {
    if (!value) return "";

    try {
        const url = new URL(String(value), window.location.origin);

        if (url.protocol === "http:" || url.protocol === "https:") {
            return url.href;
        }

        return "";
    } catch {
        return "";
    }
}

function extractCollection(payload, collectionName) {
    if (Array.isArray(payload)) return payload;

    if (!payload || typeof payload !== "object") return [];

    if (Array.isArray(payload[collectionName])) {
        return payload[collectionName];
    }

    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.results)) return payload.results;
    if (Array.isArray(payload.items)) return payload.items;

    return [];
}

async function fetchPublicData(endpoint, collectionName) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
            "Accept": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    const payload = await response.json();

    if (payload && payload.success === false) {
        throw new Error(payload.message || "Unable to load data.");
    }

    return extractCollection(payload, collectionName);
}


/* 02. MOBILE NAVIGATION */

function initialiseNavigation() {
    const menuToggle = document.querySelector(".menu-toggle");
    const mainNav = document.querySelector(".main-nav");

    if (!menuToggle || !mainNav) return;

    function closeMenu() {
        mainNav.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
        menuToggle.textContent = "☰";
    }

    function toggleMenu() {
        const isOpen = mainNav.classList.toggle("active");

        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation" : "Open navigation"
        );

        menuToggle.textContent = isOpen ? "✕" : "☰";
    }

    menuToggle.addEventListener("click", toggleMenu);

    mainNav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 850) closeMenu();
    });
}


/* 03. THEME SYSTEM */

function initialiseTheme() {
    const themeToggle = document.querySelector(".theme-toggle");

    if (!themeToggle) return;

    const savedTheme = localStorage.getItem("tet3rhq-theme");

    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
    }

    function updateThemeButton() {
        const isLight = document.body.classList.contains("light-mode");

        themeToggle.textContent = isLight ? "☀" : "◐";

        themeToggle.setAttribute(
            "aria-label",
            isLight ? "Switch to dark theme" : "Switch to light theme"
        );
    }

    updateThemeButton();

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");

        const isLight = document.body.classList.contains("light-mode");

        localStorage.setItem(
            "tet3rhq-theme",
            isLight ? "light" : "dark"
        );

        updateThemeButton();
    });
}


/* 04. HEADER SCROLL EFFECT */

function initialiseHeader() {
    const header = document.querySelector(".site-header");

    if (!header) return;

    function updateHeader() {
        header.classList.toggle("scrolled", window.scrollY > 40);
    }

    window.addEventListener("scroll", updateHeader, {
        passive: true
    });

    updateHeader();
}


/* 05. BACK TO TOP */

function initialiseBackToTop() {
    const backToTop = document.querySelector(".back-to-top");

    if (!backToTop) return;

    function updateButton() {
        backToTop.classList.toggle("visible", window.scrollY > 450);
    }

    window.addEventListener("scroll", updateButton, {
        passive: true
    });

    backToTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    updateButton();
}


/* 06. FOOTER YEAR */

function initialiseFooter() {
    const yearElement = document.getElementById("current-year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}


/* 07. HERO TEXT MOTION */

function initialiseHeroMotion() {
    const heroAccent = document.querySelector(".hero-accent");

    if (!heroAccent) return;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) return;

    const phrases = [
        "I build for the web.",
        "I engineer digital systems.",
        "I turn ideas into interfaces.",
        "I create with precision."
    ];

    let currentPhrase = 0;

    window.setInterval(() => {
        currentPhrase = (currentPhrase + 1) % phrases.length;

        heroAccent.style.transition =
            "opacity 0.3s ease, transform 0.3s ease";

        heroAccent.style.opacity = "0";
        heroAccent.style.transform = "translateY(7px)";

        window.setTimeout(() => {
            heroAccent.textContent = phrases[currentPhrase];

            heroAccent.style.opacity = "1";
            heroAccent.style.transform = "translateY(0)";
        }, 300);

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
        project.description || "Project details coming soon."
    );

    const category = String(project.category || "")
        .split(/[,|]/)
        .map(item => item.trim())
        .filter(Boolean);

    const liveURL = safeURL(project.live_url);
    const githubURL = safeURL(project.github_url);
    const imageURL = getProjectImageURL(project.image_key);

    const tagsHTML = category
        .map(tag => `<span>${escapeHTML(tag)}</span>`)
        .join("");

    const linksHTML = [
        liveURL
            ? `<a href="${escapeHTML(liveURL)}" target="_blank" rel="noopener noreferrer">View live project ↗</a>`
            : "",

        githubURL
            ? `<a href="${escapeHTML(githubURL)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>`
            : ""
    ].filter(Boolean).join("");

    const imageHTML = imageURL
        ? `<img src="${escapeHTML(imageURL)}" alt="${title} project preview" loading="lazy">`
        : `<div class="project-image-placeholder">PROJECT PREVIEW</div>`;

    return `
        <article class="project-card">

            <div class="project-image">
                ${imageHTML}
            </div>

            <div class="project-info">

                <h3>${title}</h3>

                <p>${description}</p>

                ${tagsHTML
                    ? `<div class="project-tags">${tagsHTML}</div>`
                    : ""
                }

                ${linksHTML
                    ? `<div class="project-links">${linksHTML}</div>`
                    : ""
                }

            </div>

        </article>
    `;
}


/* 10. LOAD PROJECTS */

async function loadProjects() {
    const container = document.getElementById("projects-container");

    if (!container) return;

    container.innerHTML = `
        <p class="projects-loading">
            <span class="loading-marker"></span>
            Loading selected work...
        </p>
    `;

    try {
        const projects = await fetchPublicData(
            "/api/projects",
            "projects"
        );

        if (!projects.length) {
            container.innerHTML = `
                <p class="projects-loading">
                    New projects are being prepared.
                </p>
            `;

            return;
        }

        container.innerHTML = projects
            .map(createProjectCard)
            .join("");

        container.querySelectorAll(".project-image img").forEach(image => {
            image.addEventListener("error", () => {
                const wrapper = image.closest(".project-image");

                if (wrapper) {
                    wrapper.innerHTML = `
                        <div class="project-image-placeholder">
                            PREVIEW UNAVAILABLE
                        </div>
                    `;
                }
            }, { once: true });
        });

    } catch (error) {
        console.error("Project loading error:", error);

        container.innerHTML = `
            <p class="projects-loading">
                Projects are temporarily unavailable.
                Please check back shortly.
            </p>
        `;
    }
}


/* 11. TESTIMONIAL CARD */

function createTestimonialCard(testimonial) {
    const content = escapeHTML(
        testimonial.content || testimonial.message || ""
    );

    const clientName = escapeHTML(
        testimonial.client_name || "Client"
    );

    const clientRole = escapeHTML(
        testimonial.client_role || ""
    );

    const company = escapeHTML(
        testimonial.company || ""
    );

    const details = [clientRole, company]
        .filter(Boolean)
        .join(" / ");

    return `
        <article class="testimonial-card">

            <p>${content}</p>

            <div class="testimonial-author">
                <strong>${clientName}</strong>
                ${details ? `<span> — ${details}</span>` : ""}
            </div>

        </article>
    `;
}


/* 12. LOAD TESTIMONIALS */

async function loadTestimonials() {
    const container = document.getElementById("testimonials-container");

    if (!container) return;

    container.innerHTML = `
        <p class="testimonials-loading">
            Loading client feedback...
        </p>
    `;

    try {
        const testimonials = await fetchPublicData(
            "/api/testimonials",
            "testimonials"
        );

        if (!testimonials.length) {
            container.innerHTML = `
                <p class="testimonials-loading">
                    Client feedback will appear here soon.
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
            <p class="testimonials-loading">
                Client feedback is temporarily unavailable.
            </p>
        `;
    }
}


/* 13. ACTIVE NAVIGATION */

function initialiseActiveNavigation() {
    const sections = document.querySelectorAll(
        "main section[id]"
    );

    const navLinks = document.querySelectorAll(
        ".main-nav a[href^='#']"
    );

    if (!sections.length || !navLinks.length) return;

    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            navLinks.forEach(link => {
                const isActive =
                    link.getAttribute("href") === `#${entry.target.id}`;

                link.classList.toggle("active", isActive);
            });
        });
    }, {
        rootMargin: "-30% 0px -60% 0px"
    });

    sections.forEach(section => observer.observe(section));
}


/* 14. INITIALISE WEBSITE */

document.addEventListener("DOMContentLoaded", () => {
    initialiseNavigation();
    initialiseTheme();
    initialiseHeader();
    initialiseBackToTop();
    initialiseFooter();
    initialiseHeroMotion();
    initialiseActiveNavigation();

    loadProjects();
    loadTestimonials();
});
