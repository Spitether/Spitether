document.addEventListener("DOMContentLoaded", async () => {
  console.log("app.js loaded");

  const grid = document.getElementById("product-grid");
  const searchInput = document.getElementById("search-input");
  const filterButtons = document.querySelectorAll(".filter-btn");

  // Load products
  let products = [];
  try {
    products = await fetch("./data/products.json").then(res => res.json());
  } catch (err) {
    console.error("Error loading products", err);
    products = [];
  }

  let activeCategory = "all";
  let searchQuery = "";

  /* ------------------------------
     RENDER PRODUCT CARDS
  --------------------------------*/
  function renderProducts() {
    let filtered = products;

    // CATEGORY FILTER
    if (activeCategory !== "all") {
      filtered = filtered.filter(p => p.category === activeCategory);
    }

    // SEARCH FILTER
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery) ||
        p.description.toLowerCase().includes(searchQuery)
      );
    }

    // RENDER
    grid.innerHTML = "";

    if (filtered.length === 0) {
      grid.innerHTML = `<p>No products found.</p>`;
      return;
    }

    filtered.forEach(p => {
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

      grid.appendChild(card);
    });

    initScrollReveal();
  }

  /* ------------------------------
     CATEGORY BUTTONS
  --------------------------------*/
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      activeCategory = btn.dataset.category; // "all", "digital services", etc.
      renderProducts();
    });
  });

  /* ------------------------------
     SEARCH INPUT
  --------------------------------*/
  if (searchInput) {
    searchInput.addEventListener("input", e => {
      searchQuery = e.target.value.toLowerCase();
      renderProducts();
    });
  }

  /* ------------------------------
     INITIAL RENDER
  --------------------------------*/
  renderProducts();

  /* ------------------------------
     EFFECTS
  --------------------------------*/
  initSpotlight();
  initScrollReveal();
});


/* ------------------------------
   BUILD PAGE URL
--------------------------------*/
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
   SPOTLIGHT EFFECT
--------------------------------*/
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


/* ------------------------------
   SCROLL REVEAL
--------------------------------*/
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
