document.addEventListener("DOMContentLoaded", () => {
  console.log("app.js loaded");

  const grid = document.getElementById("product-grid");
  const searchInput = document.getElementById("search-input");
  const filterButtons = document.querySelectorAll(".filter-btn");

  // Inline products data (fetch issue workaround)
  const products = [
    {
      "id": "sample-001",
      "name": "Sample Project",
      "price": 25.00,
      "stock": 5,
      "image": "images/products/sample-001.jpg",
      "category": "Digital Projects",
"description": "Marionette's featured digital project.",
      "sale": true,
      "compareAt": 50
    },
    {
      "id": "sample-002",
      "name": "Karate Chicken",
      "price": 300.00,
      "stock": 5,
      "image": "images/products/sample-002.png",
      "category": "Services",
      "description": "Chicken kick against the force of wind.",
      "sale": false
    }
  ];
  console.log("Loaded", products.length, "products from inline data");

  let activeCategory = "all";
  let searchQuery = "";

  function renderProducts() {
    let filtered = products.filter(p => true);

    if (activeCategory !== "all") {
      filtered = filtered.filter(p => p.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
    }

    grid.innerHTML = "";

    if (!filtered.length) {
      grid.innerHTML = "<p>No products found.</p>";
      return;
    }

    filtered.forEach(p => {
      const card = document.createElement("a");
      card.href = `product.html?id=${p.id}`;
      card.className = "product-card";
      card.innerHTML = `
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <h3>${p.name}</h3>
        <p class="price">${p.sale && p.compareAt ? `<span class="sale-price">$${p.price.toFixed(2)}</span><span class="original-price">$${p.compareAt.toFixed(2)}</span>` : `$${p.price.toFixed(2)}`}</p>
        <span class="tag ${p.stock === 0 ? 'sold-out' : ''}">${p.stock === 0 ? 'Sold Out' : 'In Stock'}</span>
      `;
      grid.appendChild(card);
    });
  }

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.dataset.category;
      renderProducts();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });
  }

  renderProducts();
});
