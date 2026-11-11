
/* =========================================
   TET3RHQ STUDIO
   WEBSITE FUNCTIONALITY
   CLOUDFLARE API INTEGRATION
========================================= */


/* ---------- 1. API CONFIGURATION ---------- */

const API_BASE_URL =
    "https://tet3rhq-studio-api.calabeugene.workers.dev";


/* ---------- 2. SHARED HELPERS ---------- */

// Escape database content before inserting it into HTML.

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];

    });

}


// Accept only HTTP and HTTPS links.

function safeURL(value) {

    if (!value) return "";

    try {

        const url = new URL(value, window.location.href);

        if (url.protocol !== "https:" && url.protocol !== "http:") {
            return "";
        }

        return url.href;

    } catch {

        return "";

    }

}


// Support different collection response formats.

function extractCollection(payload, collectionName) {

    if (Array.isArray(payload)) {
        return payload;
    }

    if (!payload || typeof payload !== "object") {
        throw new Error("Invalid API response.");
    }

    const possibleCollections = [
        payload[collectionName],
        payload.data,
        payload.results,
        payload.items
    ];

    for (const collection of possibleCollections) {

        if (Array.isArray(collection)) {
            return collection;
        }

    }

    throw new Error("Could not find the requested collection.");

}


// Fetch public information from Cloudflare.

async function fetchPublicData(endpoint, collectionName) {

    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: {
                "Accept": "application/json"
            }
        }
    );

    if (!response.ok) {

        throw new Error(
            `API request failed with status ${response.status}.`
        );

    }

    const payload = await response.json();

    return extractCollection(payload, collectionName);

}


/* ---------- 3. MOBILE NAVIGATION ---------- */

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav) {

    menuToggle.addEventListener("click", () => {

        mainNav.classList.toggle("active");

        const isOpen = mainNav.classList.contains("active");

        menuToggle.setAttribute("aria-expanded", isOpen);

        menuToggle.textContent = isOpen ? "✕" : "☰";

    });


    // Close menu after clicking a navigation link.

    mainNav.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            mainNav.classList.remove("active");

            menuToggle.setAttribute("aria-expanded", "false");

            menuToggle.textContent = "☰";

        });

    });

}


/* ---------- 4. DARK / LIGHT MODE ---------- */

const themeToggle = document.querySelector(".theme-toggle");

const savedTheme = localStorage.getItem("tet3rhq-theme");

if (savedTheme === "light") {

    document.body.classList.add("light-mode");

}

function updateThemeButton() {

    if (!themeToggle) return;

    const isLight = document.body.classList.contains("light-mode");

    themeToggle.textContent = isLight ? "☾" : "☀";

    themeToggle.setAttribute(
        "aria-label",
        isLight ? "Switch to dark mode" : "Switch to light mode"
    );

}

updateThemeButton();

if (themeToggle) {

    themeToggle.addEventListener("click", () => {

        document.body.classList.toggle("light-mode");

        const currentTheme = document.body.classList.contains("light-mode")
            ? "light"
            : "dark";

        localStorage.setItem("tet3rhq-theme", currentTheme);

        updateThemeButton();

    });

}


/* ---------- 5. HEADER SCROLL EFFECT ---------- */

const siteHeader = document.querySelector(".site-header");

function handleHeaderScroll() {

    if (!siteHeader) return;

    if (window.scrollY > 50) {

        siteHeader.classList.add("scrolled");

    } else {

        siteHeader.classList.remove("scrolled");

    }

}

window.addEventListener("scroll", handleHeaderScroll);

handleHeaderScroll();


/* ---------- 6. BACK TO TOP BUTTON ---------- */

const backToTop = document.querySelector(".back-to-top");

function handleBackToTop() {

    if (!backToTop) return;

    if (window.scrollY > 400) {

        backToTop.classList.add("visible");

    } else {

        backToTop.classList.remove("visible");

    }

}

window.addEventListener("scroll", handleBackToTop);

handleBackToTop();

if (backToTop) {

    backToTop.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

}


/* ---------- 7. AUTOMATIC FOOTER YEAR ---------- */

const currentYear = document.querySelector("#current-year");

if (currentYear) {

    currentYear.textContent = new Date().getFullYear();

}


/* ---------- 8. PROJECT IMAGE URL ---------- */

function getProjectImageURL(imageKey) {

    if (!imageKey) return "";

    const encodedKey = String(imageKey)
        .split("/")
        .map(part => encodeURIComponent(part))
        .join("/");

    return `${API_BASE_URL}/api/images/${encodedKey}`;

}


/* ---------- 9. PROJECT CARD ---------- */

function createProjectCard(project) {

    const title = escapeHTML(project.title);

    const description = escapeHTML(project.description);

    const category = String(project.category ?? "")
        .split(/[,|]/)
        .map(item => item.trim())
        .filter(Boolean);

    const tagsHTML = category.length
        ? `
            <div class="project-tags">
                ${category.map(tag => `<span>${escapeHTML(tag)}</span>`).join("")}
            </div>
        `
        : "";

    const liveURL = safeURL(project.live_url);

    const githubURL = safeURL(project.github_url);

    const linksHTML = `
        ${liveURL
            ? `<a href="${escapeHTML(liveURL)}" target="_blank" rel="noopener noreferrer">View Live Project ↗</a>`
            : ""
        }

        ${githubURL
            ? `<a href="${escapeHTML(githubURL)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>`
            : ""
        }
    `;

    const imageURL = getProjectImageURL(project.image_key);

    const imageHTML = imageURL
        ? `
            <div class="project-image">
                <img
                    src="${escapeHTML(imageURL)}"
                    alt="${title} project preview"
                    loading="lazy"
                >
            </div>
        `
        : `
            <div class="project-image">
                <div class="project-image-placeholder">
                    Project Preview
                </div>
            </div>
        `;

    return `
        <article class="project-card">

            ${imageHTML}

            <div class="project-info">

                <h3>${title}</h3>

                <p>${description}</p>

                ${tagsHTML}

                ${linksHTML
                    ? `<div class="project-links">${linksHTML}</div>`
                    : ""
                }

            </div>

        </article>
    `;

}


/* ---------- 10. LOAD PUBLIC PROJECTS ---------- */

async function loadProjects() {

    const projectsContainer =
        document.querySelector("#projects-container");

    if (!projectsContainer) return;

    projectsContainer.innerHTML = `
        <p class="empty-projects">
            Loading projects...
        </p>
    `;

    try {

        const projects = await fetchPublicData(
            "/api/projects",
            "projects"
        );

        if (projects.length === 0) {

            projectsContainer.innerHTML = `
                <p class="empty-projects">
                    Our featured projects will appear here soon.
                </p>
            `;

            return;

        }

        projectsContainer.innerHTML = projects
            .map(createProjectCard)
            .join("");


        // Show a fallback if an uploaded image cannot load.

        projectsContainer.querySelectorAll(".project-image img")
            .forEach(image => {

                image.addEventListener("error", () => {

                    const placeholder =
                        document.createElement("div");

                    placeholder.className =
                        "project-image-placeholder";

                    placeholder.textContent = "Project Preview";

                    image.replaceWith(placeholder);

                });

            });


    } catch (error) {

        console.error("Projects loading error:", error);

        projectsContainer.innerHTML = `
            <p class="empty-projects">
                Projects are temporarily unavailable.
                Please check back soon.
            </p>
        `;

    }

}


/* ---------- 11. TESTIMONIAL CARD ---------- */

function createTestimonialCard(testimonial) {

    const content = escapeHTML(testimonial.content);

    const clientName = escapeHTML(testimonial.client_name);

    const clientRole = escapeHTML(testimonial.client_role);

    const company = escapeHTML(testimonial.company);

    const details = [clientRole, company]
        .filter(Boolean)
        .join(" · ");

    return `
        <article class="testimonial-card">

            <p>"${content}"</p>

            <div class="testimonial-author">

                <strong>${clientName}</strong>

                ${details
                    ? `<span> — ${details}</span>`
                    : ""
                }

            </div>

        </article>
    `;

}


/* ---------- 12. LOAD PUBLIC TESTIMONIALS ---------- */

async function loadTestimonials() {

    const testimonialsContainer =
        document.querySelector("#testimonials-container");

    if (!testimonialsContainer) return;

    testimonialsContainer.innerHTML = `
        <p class="empty-testimonials">
            Loading testimonials...
        </p>
    `;

    try {

        const testimonials = await fetchPublicData(
            "/api/testimonials",
            "testimonials"
        );

        if (testimonials.length === 0) {

            testimonialsContainer.innerHTML = `
                <p class="empty-testimonials">
                    Client testimonials will appear here soon.
                </p>
            `;

            return;

        }

        testimonialsContainer.innerHTML = testimonials
            .map(createTestimonialCard)
            .join("");

    } catch (error) {

        console.error("Testimonials loading error:", error);

        testimonialsContainer.innerHTML = `
            <p class="empty-testimonials">
                Testimonials are temporarily unavailable.
                Please check back soon.
            </p>
        `;

    }

}


/* ---------- 13. START PUBLIC CONTENT ---------- */

document.addEventListener("DOMContentLoaded", () => {

    loadProjects();

    loadTestimonials();

});


/* =========================================
   END OF TET3RHQ STUDIO WEBSITE SCRIPT
========================================= */
