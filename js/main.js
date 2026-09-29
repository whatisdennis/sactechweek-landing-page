/**
 * STW shared page behaviors: scroll reveals + hero logo tilt.
 * All motion gates on prefers-reduced-motion.
 */
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// --- Mobile bottom navigation ---------------------------------------
// Links remain in the document and usable without JavaScript. This only
// enhances the home-page navigation after all required controls are present.
(() => {
  const nav = document.querySelector(".bottom-nav");
  const toggle = nav?.querySelector(".nav-toggle");
  const panel = nav?.querySelector("#stw-menu");

  if (!nav || !toggle || !panel) return;

  const mobileQuery = window.matchMedia("(max-width: 900px)");
  const setOpen = (open, { returnFocus = false } = {}) => {
    nav.classList.toggle("bottom-nav--open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");

    if (open) {
      panel.querySelector("a[href]")?.focus();
    } else if (returnFocus) {
      toggle.focus();
    }
  };

  nav.classList.add("nav-enhanced");

  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("bottom-nav--open")));

  panel.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("bottom-nav--open")) {
      setOpen(false, { returnFocus: true });
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (!nav.contains(event.target)) setOpen(false);
  });

  document.addEventListener("focusin", (event) => {
    if (!nav.contains(event.target)) setOpen(false);
  });

  mobileQuery.addEventListener("change", (event) => {
    if (!event.matches) setOpen(false);
  });
})();

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

// --- Tandem Summit cursor smoke -------------------------------------
// This small, local canvas echoes Tandem's point-cloud texture without
// introducing a persistent animation or affecting the dedicated Tandem page.
(() => {
  const card = document.querySelector(".program .event--summit");
  const canvas = card?.querySelector(".tandem-summit-smoke");
  if (!card || !canvas || !canvas.getContext) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");
  const coarsePointer = window.matchMedia("(pointer: coarse)");
  const context = canvas.getContext("2d");
  const particles = [];
  const MAX_PARTICLES = 72;
  const DPR_CAP = 2;
  let width = 1;
  let height = 1;
  let frame = 0;
  let lastTime = 0;
  let lastSpawn = 0;
  let cardVisible = true;

  const canAnimate = () =>
    !reducedMotion.matches && finePointer.matches && !coarsePointer.matches &&
    !document.hidden && cardVisible;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function clear() {
    particles.length = 0;
    lastTime = 0;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    context.clearRect(0, 0, width, height);
  }

  function stopWhenUnavailable() {
    if (!canAnimate()) clear();
  }

  function addParticle(x, y, index) {
    if (particles.length >= MAX_PARTICLES) particles.shift();
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.008 + Math.random() * 0.024;
    particles.push({
      x: x + (Math.random() - 0.5) * 12,
      y: y + (Math.random() - 0.5) * 12,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.006,
      age: 0,
      life: 520 + Math.random() * 480,
      size: 0.7 + Math.random() * 1.65,
      color: index % 3 ? "211, 242, 76" : "240, 237, 226",
    });
  }

  function render(now) {
    frame = 0;
    if (!canAnimate()) return clear();

    const elapsed = Math.min(32, now - (lastTime || now));
    lastTime = now;
    context.clearRect(0, 0, width, height);

    for (let index = particles.length - 1; index >= 0; index -= 1) {
      const particle = particles[index];
      particle.age += elapsed;
      if (particle.age >= particle.life) {
        particles.splice(index, 1);
        continue;
      }

      const drift = elapsed / 16.67;
      particle.vx += Math.sin((now + index * 71) * 0.003) * 0.0009 * drift;
      particle.vy += Math.cos((now + index * 47) * 0.0025) * 0.0007 * drift;
      particle.vx *= 0.985;
      particle.vy *= 0.985;
      particle.x += particle.vx * elapsed;
      particle.y += particle.vy * elapsed;

      const progress = particle.age / particle.life;
      const opacity = Math.sin(progress * Math.PI) * 0.44;
      context.fillStyle = `rgba(${particle.color}, ${opacity.toFixed(3)})`;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size * (0.8 + progress * 0.55), 0, Math.PI * 2);
      context.fill();
    }

    if (particles.length) frame = requestAnimationFrame(render);
  }

  function start() {
    if (!frame && particles.length && canAnimate()) frame = requestAnimationFrame(render);
  }

  card.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || !canAnimate()) return;
    const now = performance.now();
    if (now - lastSpawn < 22) return;
    lastSpawn = now;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    addParticle(x, y, particles.length);
    addParticle(x, y, particles.length + 1);
    start();
  }, { passive: true });

  card.addEventListener("pointerleave", () => { lastSpawn = 0; });
  new ResizeObserver(resize).observe(card);
  resize();

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      cardVisible = entry.isIntersecting;
      stopWhenUnavailable();
    }, { threshold: 0.01 }).observe(card);
  }

  document.addEventListener("visibilitychange", stopWhenUnavailable);
  [reducedMotion, finePointer, coarsePointer].forEach((query) => {
    query.addEventListener("change", stopWhenUnavailable);
  });
})();

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

document.querySelectorAll("[data-newsletter-form]").forEach((newsletterForm) => {
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
});
