import { loadCart, saveCart } from "./utils.js";
import { isValidId, validateCartItem } from "../lib/sanitizer.js";

document.addEventListener("DOMContentLoaded", async () => {
  console.log("cart.js loaded");

  const cartContainer = document.getElementById("cart-items");

// Load cart from localStorage (sanitized)
  const storedCart = loadCart();

  // Load products from your JSON file
  const products = await fetch("./data/products.json")
    .then(res => res.json())
    .catch(err => {
      console.error("Error loading products.json", err);
      return [];
    });

  // Merge cart + product data
  const merged = storedCart
    .map(item => {
      const product = products.find(p => p.id === item.id);
      if (!product) return null;
      return { ...product, quantity: item.quantity };
    })
    .filter(Boolean);

  renderCart(merged, cartContainer);
  updateTotals(merged);
});


/* ------------------------------
   RENDER CART ITEMS
--------------------------------*/
function renderCart(items, container) {
  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <p>Price: $${item.price.toFixed(2)}</p>
        <p>Stock: ${item.stock}</p>

        <div class="qty-controls">
          <button class="qty-minus">-</button>
          <span class="qty-number">${item.quantity}</span>
          <button class="qty-plus">+</button>
        </div>

        <button class="remove-item">Remove</button>
      </div>
    `;

    // Quantity +
    div.querySelector(".qty-plus").addEventListener("click", () => {
      if (item.quantity < item.stock) {
        updateCartQuantity(item.id, item.quantity + 1);
      } else {
        alert("No more stock available.");
      }
    });

    // Quantity –
    div.querySelector(".qty-minus").addEventListener("click", () => {
      if (item.quantity > 1) {
        updateCartQuantity(item.id, item.quantity - 1);
      } else {
        removeFromCart(item.id);
      }
    });

    // Remove
    div.querySelector(".remove-item").addEventListener("click", () => {
      removeFromCart(item.id);
    });

    container.appendChild(div);
  });
}


/* ------------------------------
   CART STORAGE HELPERS
--------------------------------*/
function updateCartQuantity(id, qty) {
  if (!isValidId(id) || !Number.isInteger(qty) || qty < 1 || qty > 99) {
    alert("Invalid quantity");
    return;
  }
  let cart = loadCart();
  const itemIndex = cart.findIndex(c => c.id === id);
  if (itemIndex !== -1) {
    cart[itemIndex].quantity = qty;
    saveCart(cart);
  }
  location.reload();
}

function removeFromCart(id) {
  if (!isValidId(id)) return;
  let cart = loadCart();
  cart = cart.filter(c => c.id !== id);
  saveCart(cart);
  location.reload();
}


/* ------------------------------
   TOTALS
--------------------------------*/
function updateTotals(items) {
  const subtotalEl = document.getElementById("summary-subtotal");
  const feesEl = document.getElementById("summary-fees");
  const taxEl = document.getElementById("summary-tax");
  const totalEl = document.getElementById("summary-total");

  let subtotal = 0;

  items.forEach(item => {
    subtotal += item.price * item.quantity;
  });

  const FEES_RATE = 0.05;
  const TAX_RATE = 0.0825;

  const fees = subtotal * FEES_RATE;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + fees + tax;

  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  feesEl.textContent = `$${fees.toFixed(2)}`;
  taxEl.textContent = `$${tax.toFixed(2)}`;
  totalEl.textContent = `$${total.toFixed(2)}`;
}