/* app.js — loads products + builds homepage grid */

document.addEventListener("DOMContentLoaded", async () => {
  console.log("app.js loaded");

  const grid = document.getElementById("product-grid");

  // Load products
  const products = await fetch("data/products.json")
    .then(res => res.json())
    .catch(err => {
      console.error("Error loading products.json", err);
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
});


/* ------------------------------
   RENDER PRODUCT CARDS
--------------------------------*/
function renderProducts(products, container) {
  container.innerHTML = ""; // clear grid

  products.forEach(p => {
    const card = document.createElement("a");
    card.href = `product.html?id=${p.id}`;
    card.className = "product-card";

    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>$${(p.price / 100).toFixed(2)}</p>
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