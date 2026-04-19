// cart.js - Renders cart with localStorage + products merge (non-module fallback)
console.log("cart.js loaded (fallback mode)");

const FALLBACK_PRODUCTS = [
  {"id":"sample-001","name":"Sample Project","price":25,"stock":5,"image":"images/products/sample-001.jpg","category":"Digital Projects","sale":true,"compareAt":50},
  {"id":"sample-002","name":"Karate Chicken","price":300,"stock":5,"image":"images/products/sample-002.png","category":"Services","sale":false}
];

document.addEventListener("DOMContentLoaded", async () => {
  const cartContainer = document.getElementById("cart-items");

  // Simple localStorage read (no validation)
  let storedCart = [];
  try {
    const raw = localStorage.getItem("cart");
    if (raw) storedCart = JSON.parse(raw);
  } catch (e) {
    console.warn("Cart parse error, starting empty");
  }

  // Load products with fallback
  let products = FALLBACK_PRODUCTS;
  try {
    const res = await fetch("./data/products.json");
    products = await res.json();
  } catch (e) {
    console.warn("products.json failed, using fallback", e);
  }

  // Merge (only valid IDs)
  const merged = storedCart
    .filter(item => item && item.id && FALLBACK_PRODUCTS.some(p => p.id === item.id))
    .map(item => {
      const product = products.find(p => p.id === item.id) || FALLBACK_PRODUCTS.find(p => p.id === item.id);
      return product ? {...product, quantity: Math.max(1, parseInt(item.quantity) || 1)} : null;
    })
    .filter(Boolean);

  renderCart(merged, cartContainer);
  updateTotals(merged);
});

/* RENDER CART */
function renderCart(items, container) {
  container.innerHTML = "";
  if (items.length === 0) {
    container.innerHTML = "<p>Your cart is empty. <a href='index.html'>Continue shopping</a></p>";
    return;
  }

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" width="80">
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <p>$${item.price.toFixed(2)} x <span class="qty-display">${item.quantity}</span></p>
        <div class="qty-controls">
          <button onclick="changeQty('${item.id}', -1)">-</button>
          <button onclick="changeQty('${item.id}', 1)">+</button>
        </div>
        <button onclick="removeItem('${item.id}')">Remove</button>
      </div>
    `;
    container.appendChild(div);
  });
}

/* GLOBALS FOR INLINE ONCLICK */
window.changeQty = function(id, delta) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const i = cart.findIndex(item => item.id === id);
  if (i > -1) {
    cart[i].quantity = Math.max(1, (cart[i].quantity || 1) + delta);
    localStorage.setItem("cart", JSON.stringify(cart));
    location.reload();
  }
};

window.removeItem = function(id) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart = cart.filter(item => item.id !== id);
  localStorage.setItem("cart", JSON.stringify(cart));
  location.reload();
};

/* TOTALS */
function updateTotals(items) {
  const subtotalEl = document.getElementById("summary-subtotal");
  const feesEl = document.getElementById("summary-fees");
  const taxEl = document.getElementById("summary-tax");
  const totalEl = document.getElementById("summary-total");

  let subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const fees = subtotal * 0.05;
  const tax = subtotal * 0.0825;
  const total = subtotal + fees + tax;

  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  feesEl.textContent = `$${fees.toFixed(2)}`;
  taxEl.textContent = `$${tax.toFixed(2)}`;
  totalEl.textContent = `$${total.toFixed(2)}`;
}

