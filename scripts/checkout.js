/* checkout.js — creates Stripe checkout session */

import { loadCart, validateCart } from "./utils.js";
import { ERRORS } from "../lib/sanitizer.js";
import { isValidId } from "../lib/sanitizer.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("checkout.js loaded");

  const checkoutBtn = document.getElementById("checkout-button");
  if (!checkoutBtn) return;

  checkoutBtn.addEventListener("click", async () => {
    const cart = loadCart();

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const validation = validateCart(cart);
    if (!validation.valid) {
      alert(`Invalid cart: ${validation.error}`);
      return;
    }

    try {
      // Send cart to backend
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart })
      });

      if (!response.ok) {
        const body = await response.text();
        console.error("Checkout request failed", response.status, body);
        alert("There was an issue creating your checkout session.");
        return;
      }

      const data = await response.json();

      if (!data.url) {
        console.error("No checkout URL returned:", data);
        alert("There was an issue creating your checkout session.");
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout request failed", err);
      alert("There was an issue creating your checkout session.");
    }
  });
});
