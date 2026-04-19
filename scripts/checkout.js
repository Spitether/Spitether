/* checkout.js - Standalone Stripe checkout button (no imports) */

document.addEventListener("DOMContentLoaded", () => {
  console.log("checkout.js loaded");

  const checkoutBtn = document.getElementById("checkout-button");
  if (!checkoutBtn) return;

  checkoutBtn.addEventListener("click", async () => {
    // Simple cart load (no validation)
    let cart = [];
    try {
      const raw = localStorage.getItem("cart");
      if (raw) cart = JSON.parse(raw);
    } catch (e) {
      console.error("Cart parse error", e);
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    // Basic validation
    if (!cart.every(item => item.id && typeof item.quantity === 'number' && item.quantity > 0)) {
      alert("Invalid cart items.");
      return;
    }

    try {
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        alert("Checkout failed - server error. Try again.");
        return;
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("No payment URL received.");
      }
    } catch (err) {
      console.error("Checkout network error", err);
      alert("Network error. Check connection and try again.");
    }
  });
});

