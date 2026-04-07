/* utils.js — shared helper functions */

console.log("utils.js loaded");

/* ------------------------------
   FORMAT PRICE
   Converts cents → $X.XX
--------------------------------*/
export function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

/* ------------------------------
   GET PRODUCT BY ID
   Safe lookup helper
--------------------------------*/
export function getProduct(products, id) {
  return products.find(p => p.id === id) || null;
}

/* ------------------------------
   LOAD JSON FILE
   Reusable fetch wrapper
--------------------------------*/
export async function loadJSON(path) {
  try {
    const res = await fetch(path);
    return await res.json();
  } catch (err) {
    console.error(`Error loading ${path}`, err);
    return null;
  }
}

/* ------------------------------
   SAVE CART
--------------------------------*/
export function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/* ------------------------------
   LOAD CART
--------------------------------*/
export function loadCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}
