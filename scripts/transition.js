document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("transition-overlay");
  const ANIMATION_TIME = 600; // match your CSS timing

  // --- 1. OPENING ANIMATION (when page loads) ---
  overlay.className = "curtain"; // start closed
  setTimeout(() => {
    overlay.classList.add("opening");
    overlay.classList.remove("curtain");
  }, 50);

  // --- 2. LINK HANDLING ---
  document.querySelectorAll("a[href]").forEach(link => {
    const url = link.getAttribute("href");

    // Skip non-navigation links
    if (
      !url ||
      url.startsWith("#") ||
      url.startsWith("mailto:") ||
      url.startsWith("tel:") ||
      link.target === "_blank" ||
      link.hasAttribute("download") ||
      url.includes("http") && !url.includes(location.host)
    ) {
      return;
    }

    link.addEventListener("click", e => {
      e.preventDefault();

      // Prevent double clicks
      if (overlay.classList.contains("active")) return;
      overlay.classList.add("active");

      // Choose your transition:
      overlay.className = "curtain"; 
       //overlay.className = "fade";
       //overlay.className = "spotlight";

      setTimeout(() => {
        window.location = url;
      }, ANIMATION_TIME);
    });
  });
});
