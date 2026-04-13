import { isValidId } from "../lib/sanitizer.js";
import { loadCart, saveCart } from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id")?.trim();

  if (!productId || !isValidId(productId)) {
    alert("Invalid product ID");
    window.location.href = './';
    return;
  }

  // ⭐ Fetch the single product from Supabase
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (productError || !product) {
    console.error("Product not found:", productError);
    return;
  }

  // ⭐ Fetch all products for recommended section
  const { data: allProducts, error: allError } = await supabase
    .from("products")
    .select("*");

  if (allError) {
    console.error("Error loading all products:", allError);
  }

  renderProductInfo(product);
  setupGallery(product);
  renderBadge(product);
  renderTags(product);
  setupAddToCart(product);
  setupMobileCartBar(product);

  if (allProducts) {
    renderRecommended(allProducts, product);
  }

  saveRecentlyViewed(product);
  renderRecentlyViewed(allProducts || [], product);
});

/* ---------- CORE RENDER ---------- */

function renderProductInfo(product) {
  document.getElementById("product-title").textContent = product.name;
  const priceEl = document.getElementById("product-price");

if (product.sale && product.compare_at) {
  priceEl.innerHTML = `
    <span class="sale-price">$${product.price.toFixed(2)}</span>
    <span class="compare-price">$${product.compare_at.toFixed(2)}</span>
  `;
}
 else {
  priceEl.textContent = `$${product.price.toFixed(2)}`;
}

  document.getElementById("product-description").textContent = product.description;

  const stockEl = document.getElementById("product-stock");
  stockEl.textContent = product.stock > 0 ? `In stock: ${product.stock}` : "Sold Out";
}

/* ---------- GALLERY ---------- */

function setupGallery(product) {
  const track = document.getElementById("gallery-track");
  const left = document.querySelector(".gallery-arrow.left");
  const right = document.querySelector(".gallery-arrow.right");

  const images = product.images?.length ? product.images : [product.image_url];


  images.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = product.name;
    track.appendChild(img);
  });

  let index = 0;

  function update() {
    track.style.transform = `translateX(-${index * 100}%)`;
  }

  left.onclick = () => {
    index = Math.max(0, index - 1);
    update();
  };

  right.onclick = () => {
    index = Math.min(images.length - 1, index + 1);
    update();
  };
}

/* ---------- BADGE & TAGS ---------- */

function renderBadge(product) {
  const badge = document.getElementById("product-badge");

  if (product.stock <= 2 && product.stock > 0) {
    badge.textContent = `🔥 Only ${product.stock} left`;
    badge.className = "badge low-stock";
  } else if (product.sale) {
    badge.textContent = "💸 On Sale";
    badge.className = "badge sale";
  } else {
    badge.textContent = "";
    badge.className = "badge";
  }
}

function renderTags(product) {
  const container = document.getElementById("product-tags");
  container.innerHTML = "";

  const tags = [];

  if (product.category) tags.push(product.category);
  if (product.stock === 0) tags.push("Sold Out");
  if (product.stock <= 2 && product.stock > 0) tags.push("Low Stock");
  if (product.price >= 200) tags.push("Premium");

  tags.forEach(t => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = t;
    container.appendChild(span);
  });
}

/* ---------- ADD TO CART ---------- */

function setupAddToCart(product) {
  const addBtn = document.getElementById("add-to-cart");

  if (product.stock === 0) {
    addBtn.disabled = true;
    addBtn.textContent = "Sold Out";
  }

  addBtn.onclick = () => addToCart(product);
}

function addToCart(product) {
  let cart = loadCart();
  const existing = cart.find(item => item.id === product.id);

  if (existing && existing.quantity >= product.stock) {
    alert("No more stock available.");
    return;
  }

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id: product.id, quantity: 1 });
  }

  saveCart(cart);
  alert("Added to cart!");
}

/* ---------- MOBILE CART BAR ---------- */

function setupMobileCartBar(product) {
  const bar = document.getElementById("mobile-cart-bar");
  const title = document.getElementById("mobile-cart-title");
  const price = document.getElementById("mobile-cart-price");
  const btn = document.getElementById("mobile-add-to-cart");

  title.textContent = product.name;
  price.textContent = `$${product.price.toFixed(2)}`;

  btn.onclick = () => addToCart(product);

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

document.addEventListener("click", e => {
  if (!e.target.classList.contains("share-btn")) return;

  const type = e.target.dataset.type;
  const url = window.location.href;

  if (type === "copy") {
    navigator.clipboard.writeText(url);
    alert("Link copied!");
  }

  if (type === "twitter") {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`);
  }

  if (type === "instagram") {
  navigator.clipboard.writeText(url);
  alert("Link copied! Paste it into your Instagram story, bio, or DM.");
  window.open("https://instagram.com");
}
});


/* ---------- RECOMMENDED ---------- */

function renderRecommended(allProducts, currentProduct) {
  const grid = document.getElementById("recommended-grid");
  grid.innerHTML = "";

  const rec = allProducts
    .filter(p =>
      p.id !== currentProduct.id &&
      p.category &&
      currentProduct.category &&
      p.category === currentProduct.category
    )
    .slice(0, 3);

  rec.forEach(p => {
    const card = document.createElement("a");
    card.href = `product.html?id=${p.id}`;
    card.className = "recommended-card";
    card.innerHTML = `
      <img src="${p.image_url}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>$${p.price.toFixed(2)}</p>
    `;
    grid.appendChild(card);
  });

  if (rec.length === 0) {
    grid.innerHTML = `<p>No related items yet.</p>`;
  }
}
