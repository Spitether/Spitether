/* utils.js — shared helper functions */

console.log("utils.js loaded");

import { validateCart, isValidId, validateCartItem } from "../lib/sanitizer.js";

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
   SAVE CART (SANITIZED)
--------------------------------*/
export function saveCart(cart) {
  const validation = validateCart(cart);
  if (!validation.valid) {
    console.warn('Invalid cart rejected:', validation.error);
    return;
  }
  localStorage.setItem("cart", JSON.stringify(cart));
}

/* ------------------------------
   LOAD CART (SANITIZED)
--------------------------------*/
export function loadCart() {
  const raw = localStorage.getItem("cart");
  if (!raw) return [];
  
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  
  // Filter valid items only
  const validCart = parsed.filter(validateCartItem);
  const validation = validateCart(validCart);
  
  if (!validation.valid) {
    console.warn('Invalid cart filtered:', validation.error);
    localStorage.removeItem("cart"); // Purge bad data
    return [];
  }
  
  return validCart;
}
