/* app.js — loads products + builds homepage grid */

document.addEventListener("DOMContentLoaded", async () => {
  console.log("app.js loaded");

  const grid = document.getElementById("product-grid");

  // Load products
  const products = await fetch("/data/products.json")
    .then(res => res.json())
    .catch(err => {
      console.error("Error loading products", err);
      return [];
    });

  // Load categories (optional)
  let categories = [];
  try {
    categories = await fetch("data/categories.json").then(res => res.json());
  } catch (e) {
    console.warn("No categories.json found");
  }

  // Render category filters if available
  if (categories.length > 0) {
    renderCategoryFilters(categories, products);
  }

  // Render search bar
  renderSearchBar(products);

  // Render product cards
  renderProducts(products, grid);

  // Start the scroll and cursor effects
  initSpotlight();
  initScrollReveal();
});

function buildPageUrl(file, query = "") {
  let base = window.location.pathname;

  if (base.endsWith("/")) {
    return `${base}${file}${query}`;
  }

  if (base.endsWith(".html")) {
    base = base.substring(0, base.lastIndexOf("/") + 1);
    return `${base}${file}${query}`;
  }

  return `${base}/${file}${query}`;
}


/* ------------------------------
   RENDER PRODUCT CARDS
--------------------------------*/
function renderProducts(products, container) {
  container.innerHTML = ""; // clear grid

  products.forEach(p => {
    const card = document.createElement("a");
    card.href = buildPageUrl("product.html", `?id=${p.id}`);
    card.className = "product-card reveal-on-scroll";

    card.innerHTML = `
    <img src="${p.image}" alt="${p.name}">
    <h3>${p.name}</h3>
    <p>$${p.price.toFixed(2)}</p>
    <span class="tag ${p.stock === 0 ? "sold-out" : ""}">
    ${p.stock === 0 ? "Sold Out" : "In Stock"}
  </span>
`;

    container.appendChild(card);
  });
}


/* ------------------------------
   CATEGORY FILTERS
--------------------------------*/
function renderCategoryFilters(categories, products) {
  const filterContainer = document.getElementById("category-filters");
  if (!filterContainer) return;

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat.name;

    btn.addEventListener("click", () => {
      const filtered = products.filter(p => p.category === cat.id);
      const grid = document.getElementById("product-grid");
      renderProducts(filtered, grid);
    });

    filterContainer.appendChild(btn);
  });
}


/* ------------------------------
   SEARCH BAR
--------------------------------*/
function renderSearchBar(products) {
  const searchContainer = document.getElementById("search-bar");
  if (!searchContainer) return;

  const input = document.createElement("input");
  input.placeholder = "Search…";

  input.addEventListener("input", () => {
    const query = input.value.toLowerCase();
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
    const grid = document.getElementById("product-grid");
    renderProducts(filtered, grid);
  });

  searchContainer.appendChild(input);
}

function initSpotlight() {
  const spotlight = document.createElement("div");
  spotlight.className = "spotlight-overlay";
  document.body.appendChild(spotlight);

  let fadeTimeout;
  const resetFade = () => {
    clearTimeout(fadeTimeout);
    fadeTimeout = setTimeout(() => {
      spotlight.style.opacity = "0";
    }, 1500);
  };

  document.addEventListener("mousemove", e => {
    spotlight.style.left = `${e.clientX}px`;
    spotlight.style.top = `${e.clientY}px`;
    spotlight.style.opacity = "0.65";
    spotlight.style.transform = `translate(-50%, -50%) scale(1)`;
    resetFade();
  });

  document.addEventListener("mouseleave", () => {
    spotlight.style.opacity = "0";
  });

  document.addEventListener("scroll", () => {
    spotlight.style.opacity = "0.45";
    resetFade();
  }, { passive: true });
}

function initScrollReveal() {
  const revealTargets = document.querySelectorAll("section, .product-card");
  revealTargets.forEach(el => el.classList.add("reveal-on-scroll"));

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-visible");
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.18,
    rootMargin: "0px 0px -80px 0px"
  });

  revealTargets.forEach(el => observer.observe(el));
}
