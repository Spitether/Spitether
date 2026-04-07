/* cart.js — handles cart display + totals */

document.addEventListener("DOMContentLoaded", async () => {
  console.log("cart.js loaded");

  const cartContainer = document.getElementById("cart-items");

  // Load cart from localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Load products
  const products = await fetch("/data/products.json")
    .then(res => res.json())
    .catch(err => {
      console.error("Error loading products.json", err);
      return [];
    });

  // Render cart items
  renderCart(cart, products, cartContainer);

  // Calculate totals
  updateTotals(cart, products);
});


/* ------------------------------
   RENDER CART ITEMS
--------------------------------*/
function renderCart(cart, products, container) {
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    if (!product) return;

    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <div class="cart-item-info">
        <h3>${product.name}</h3>
        <p>Price: $${(product.price / 100).toFixed(2)}</p>
        <p>Stock: ${product.stock}</p>

        <div class="qty-controls">
          <button class="qty-minus">-</button>
          <span class="qty-number">${item.quantity}</span>
          <button class="qty-plus">+</button>
        </div>

        <button class="remove-item">Remove</button>
      </div>
    `;

    /* Quantity + button */
    div.querySelector(".qty-plus").addEventListener("click", () => {
      if (item.quantity < product.stock) {
        item.quantity++;
        saveCart(cart);
        renderCart(cart, products, container);
        updateTotals(cart, products);
      } else {
        alert("No more stock available.");
      }
    });

    /* Quantity – button */
    div.querySelector(".qty-minus").addEventListener("click", () => {
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        cart = cart.filter(c => c.id !== item.id);
      }
      saveCart(cart);
      renderCart(cart, products, container);
      updateTotals(cart, products);
    });

    /* Remove item */
    div.querySelector(".remove-item").addEventListener("click", () => {
      cart = cart.filter(c => c.id !== item.id);
      saveCart(cart);
      renderCart(cart, products, container);
      updateTotals(cart, products);
    });

    container.appendChild(div);
  });
}


/* ------------------------------
   SAVE CART
--------------------------------*/
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/* ------------------------------
   CALCULATE TOTALS
--------------------------------*/
function updateTotals(cart, products) {
  const subtotalEl = document.getElementById("summary-subtotal");
  const feesEl = document.getElementById("summary-fees");
  const taxEl = document.getElementById("summary-tax");
  const totalEl = document.getElementById("summary-total");

  let subtotal = 0;

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    if (product) {
      subtotal += product.price * item.quantity;
    }
  });

  const FEES_RATE = 0.05;     // 5% platform fee
  const TAX_RATE = 0.0825;    // 8.25% Houston tax

  const fees = Math.round(subtotal * FEES_RATE);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + fees + tax;

  subtotalEl.textContent = `$${(subtotal / 100).toFixed(2)}`;
  feesEl.textContent = `$${(fees / 100).toFixed(2)}`;
  taxEl.textContent = `$${(tax / 100).toFixed(2)}`;
  totalEl.textContent = `$${(total / 100).toFixed(2)}`;
}
