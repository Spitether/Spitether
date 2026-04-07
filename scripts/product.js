/* product.js — loads single product page */

document.addEventListener("DOMContentLoaded", async () => {
  console.log("product.js loaded");

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (!productId) {
    console.error("No product ID found in URL");
    return;
  }

  const product = await fetch(`/api/products?id=${productId}`)
    .then(res => res.json())
    .catch(err => {
      console.error("Error loading product", err);
      return null;
    });

  if (!product) {
    console.error("Product not found or load error:", productId);
    return;
  }

  // Fill in page content
  document.getElementById("product-image").src = product.image;
  document.getElementById("product-title").textContent = product.name;
  document.getElementById("product-price").textContent = `$${(product.price / 100).toFixed(2)}`;
  document.getElementById("product-description").textContent = product.description;

  const stockEl = document.getElementById("product-stock");
  stockEl.textContent = product.stock > 0 ? `In stock: ${product.stock}` : "Sold Out";

  const addBtn = document.getElementById("add-to-cart");

  // Disable button if sold out
  if (product.stock === 0) {
    addBtn.disabled = true;
    addBtn.textContent = "Sold Out";
  }

  // Add to cart logic
  addBtn.addEventListener("click", () => {
    addToCart(product);
  });
});


/* ------------------------------
   ADD TO CART FUNCTION
--------------------------------*/
function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existing = cart.find(item => item.id === product.id);

  // Prevent overselling
  if (existing && existing.quantity >= product.stock) {
    alert("No more stock available.");
    return;
  }

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id: product.id, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  alert("Added to cart!");
}
