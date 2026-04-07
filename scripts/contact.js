document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  const toast = document.getElementById("toast");
  const btn = document.getElementById("submit-btn");
  const btnText = btn.querySelector(".btn-text");
  const btnLoader = btn.querySelector(".btn-loader");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Show loading animation
    btnText.classList.add("hidden");
    btnLoader.classList.remove("hidden");

    const formData = new FormData(form);

    const response = await fetch(form.action, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" }
    });

    // Hide loader
    btnLoader.classList.add("hidden");
    btnText.classList.remove("hidden");

    if (response.ok) {
      form.reset();

      // Show toast
      toast.classList.remove("hidden");
      toast.classList.add("show");

      setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.classList.add("hidden"), 300);
      }, 2500);
    }
  });
});
