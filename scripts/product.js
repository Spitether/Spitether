document.addEventListener("DOMContentLoaded", async () => {
  console.log("product.js loaded");

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (!productId) {
    console.error("No product ID found in URL");
    return;
  }

  // Load all products
  const products = await fetch("./data/products.json")
    .then(res => res.json())
    .catch(err => {
      console.error("Error loading products.json", err);
      return [];
    });

  // Find the matching product
  const product = products.find(p => p.id === productId);

  if (!product) {
    console.error("Product not found:", productId);
    return;
  }

  // Fill in page content
  document.getElementById("product-image").src = product.image;
  document.getElementById("product-title").textContent = product.name;
  document.getElementById("product-price").textContent = `$${product.price.toFixed(2)}`;
  document.getElementById("product-description").textContent = product.description;

  const stockEl = document.getElementById("product-stock");
  stockEl.textContent = product.stock > 0 ? `In stock: ${product.stock}` : "Sold Out";

  const addBtn = document.getElementById("add-to-cart");

  if (product.stock === 0) {
    addBtn.disabled = true;
    addBtn.textContent = "Sold Out";
  }

  addBtn.addEventListener("click", () => {
    addToCart(product);
  });
});

// MOBILE CART BAR SETUP
function setupMobileCartBar(product) {
  const bar = document.getElementById("mobile-cart-bar");
  const title = document.getElementById("mobile-cart-title");
  const price = document.getElementById("mobile-cart-price");
  const btn = document.getElementById("mobile-add-to-cart");

  title.textContent = product.name;
  price.textContent = `$${product.price.toFixed(2)}`;

  btn.addEventListener("click", () => addToCart(product));

  // Show bar only after scrolling
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      bar.style.transform = "translateY(0)";
      bar.style.opacity = "1";
    } else {
      bar.style.transform = "translateY(100%)";
      bar.style.opacity = "0";
    }
  });
}


function setupImageGallery(product) {
  const mainImage = document.getElementById("product-image");
  const row = document.getElementById("thumbnail-row");

  // If product has no gallery, skip
  if (!product.images || product.images.length <= 1) return;

  product.images.forEach((imgSrc, index) => {
    const thumb = document.createElement("img");
    thumb.src = imgSrc;

    if (index === 0) thumb.classList.add("active-thumb");

    thumb.addEventListener("click", () => {
      mainImage.src = imgSrc;

      // Update active state
      document.querySelectorAll(".thumbnail-row img")
        .forEach(t => t.classList.remove("active-thumb"));

      thumb.classList.add("active-thumb");
    });

    row.appendChild(thumb);
  });
}

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
