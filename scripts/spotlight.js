document.addEventListener("DOMContentLoaded", () => {
  const spotlight = document.createElement("div");
  spotlight.className = "spotlight-overlay";
  document.body.appendChild(spotlight);

  let fadeTimeout;
  const resetFade = () => {
    clearTimeout(fadeTimeout);
    fadeTimeout = setTimeout(() => {
      spotlight.style.opacity = "0";
    }, 900);
  };

  document.addEventListener("mousemove", e => {
    spotlight.style.left = `${e.clientX}px`;
    spotlight.style.top = `${e.clientY}px`;
    spotlight.style.opacity = "0.55";
    resetFade();
  });

  document.addEventListener("mouseleave", () => {
    spotlight.style.opacity = "0";
  });

  document.addEventListener("scroll", () => {
    spotlight.style.opacity = "0.45";
    resetFade();
  }, { passive: true });
});
