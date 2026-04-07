/* checkout.js — creates Stripe checkout session */

document.addEventListener("DOMContentLoaded", () => {
  console.log("checkout.js loaded");

  const checkoutBtn = document.getElementById("checkout-button");
  if (!checkoutBtn) return;

  checkoutBtn.addEventListener("click", async () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    // Send cart to backend
    const response = await fetch("/server/create-checkout-session.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart })
    });

    const data = await response.json();

    if (!data.url) {
      console.error("No checkout URL returned:", data);
      alert("There was an issue creating your checkout session.");
      return;
    }

    // Redirect to Stripe Checkout
    window.location.href = data.url;
  });
});
