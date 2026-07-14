/**
 * STW shared page behaviors: scroll reveals + hero logo tilt.
 * All motion gates on prefers-reduced-motion.
 */
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// --- Scroll reveals -------------------------------------------------
// Content is visible by default. We only arm the hidden state here,
// right before observing, so no-JS / reduced-motion / headless
// renders always show everything.
const revealables = document.querySelectorAll(".reveal");
if (!REDUCED && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
  );
  revealables.forEach((el) => el.classList.add("reveal-armed"));
  requestAnimationFrame(() => revealables.forEach((el) => io.observe(el)));
}

// --- Hero logo tilt (from the approved mockup) ----------------------
const scene = document.querySelector(".logo-tilt-scene");
const logo = document.getElementById("logoTilt");
if (scene && logo && !REDUCED) {
  scene.addEventListener(
    "pointermove",
    (e) => {
      const rect = scene.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const ry = (x - 0.5) * 12;
      const rx = (0.5 - y) * 10;
      logo.style.transform = `translate3d(0,0,0) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    },
    { passive: true }
  );
  scene.addEventListener("pointerleave", () => {
    logo.style.transform = "";
  });
}

// --- Newsletter signup ------------------------------------------------
function showToast(message, { error = false } = {}) {
  let region = document.querySelector(".toast-region");
  if (!region) {
    region = document.createElement("div");
    region.className = "toast-region";
    region.setAttribute("aria-live", "polite");
    region.setAttribute("aria-atomic", "true");
    document.body.append(region);
  }

  const toast = document.createElement("div");
  toast.className = `toast${error ? " toast--error" : ""}`;
  toast.setAttribute("role", error ? "alert" : "status");

  const icon = document.createElement("span");
  icon.className = "toast-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = error ? "!" : "✓";

  const text = document.createElement("span");
  text.className = "toast-msg";
  text.textContent = message;

  toast.append(icon, text);
  region.append(toast);

  requestAnimationFrame(() => toast.classList.add("is-in"));
  window.setTimeout(() => {
    toast.classList.remove("is-in");
    window.setTimeout(() => toast.remove(), 320);
  }, 4000);
}

const newsletterForm = document.getElementById("newsletter-form");
if (newsletterForm) {
  newsletterForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailInput = newsletterForm.elements.email;
    const honeypotInput = newsletterForm.elements.website;
    const submitButton = newsletterForm.querySelector('button[type="submit"]');
    const email = emailInput.value.trim();
    const website = honeypotInput.value;

    if (website.trim()) return;

    if (!email || !emailInput.validity.valid) {
      showToast("Enter a valid email address.", { error: true });
      emailInput.focus();
      return;
    }

    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Signing up...";

    try {
      const response = await fetch("/newsletter-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "We couldn't sign you up. Please try again.");
      }

      newsletterForm.reset();
      showToast(payload.message || "You're in. Watch your inbox.");
    } catch (error) {
      showToast(error.message || "We couldn't sign you up. Please try again.", { error: true });
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });
}
