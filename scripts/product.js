document.addEventListener("DOMContentLoaded", () => {
  console.log("product.js loaded");

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (!productId || productId.length > 20 || !/^[a-z0-9-]+$/.test(productId)) {
    alert("Invalid product");
    window.location.href = "index.html";
    return;
  }

  // Inline products data
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

  const product = products.find(p => p.id === productId);
  if (!product) {
    alert("Product not found");
    window.location.href = "index.html";
    return;
  }

  // Render
  document.getElementById("product-title").textContent = product.name;
  
  const priceEl = document.getElementById("product-price");
  if (product.sale && product.compareAt) {
    priceEl.innerHTML = `<span class="sale-price">$${product.price.toFixed(2)}</span><span class="original-price">$${product.compareAt.toFixed(2)}</span>`;
  } else {
    priceEl.textContent = `$${product.price.toFixed(2)}`;
  }

  document.getElementById("product-description").textContent = product.description;
  document.getElementById("product-stock").textContent = product.stock > 0 ? `In stock: ${product.stock}` : "Sold Out";

  // Badge
  const badge = document.getElementById("product-badge");
  if (product.stock <= 2 && product.stock > 0) {
    badge.textContent = `Only ${product.stock} left`;
    badge.className = "badge low-stock";
  } else if (product.sale) {
    badge.textContent = "On Sale";
    badge.className = "badge sale";
  }

  // Tags
  const tagsContainer = document.getElementById("product-tags");
  const tags = [];
  if (product.category) tags.push(product.category);
  if (product.stock === 0) tags.push("Sold Out");
  if (product.stock <= 2) tags.push("Low Stock");

  tags.forEach(tag => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = tag;
    tagsContainer.appendChild(span);
  });

  // Gallery
  const galleryTrack = document.getElementById("gallery-track");
  galleryTrack.innerHTML = `<img src="${product.image}" alt="${product.name}">`;
  
  document.querySelector(".gallery-arrow.left").onclick = () => {}; // Single image
  document.querySelector(".gallery-arrow.right").onclick = () => {}; 

  // Add to cart
  const addBtn = document.getElementById("add-to-cart");
  if (product.stock === 0) {
    addBtn.disabled = true;
    addBtn.textContent = "Sold Out";
  } else {
    addBtn.onclick = () => {
      let cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existing = cart.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert("No more stock");
          return;
        }
        existing.quantity++;
      } else {
        cart.push({id: product.id, quantity: 1});
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      alert("Added to cart!");
    };
  }

  // Mobile bar
  document.getElementById("mobile-cart-title").textContent = product.name;
  document.getElementById("mobile-cart-price").textContent = `$${product.price.toFixed(2)}`;
  document.getElementById("mobile-add-to-cart").onclick = addBtn.onclick;

  // Share buttons
  document.querySelectorAll(".share-btn[data-type='copy']").forEach(btn => {
    btn.onclick = () => {
      navigator.clipboard.writeText(window.location.href);
      alert("Copied!");
    };
  });

  // Recommended (same category)
  const recGrid = document.getElementById("recommended-grid");
  const rec = products.filter(p => p.id !== product.id && p.category === product.category);
  rec.slice(0,3).forEach(p => {
    const a = document.createElement("a");
    a.href = `product.html?id=${p.id}`;
    a.innerHTML = `<img src="${p.image}" alt="${p.name}"><h4>${p.name}</h4><p>$${p.price.toFixed(2)}</p>`;
    recGrid.appendChild(a);
  });

  console.log("Product loaded:", product.name);
});
