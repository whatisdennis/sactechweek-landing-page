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

// --- Home-page week calendar -----------------------------------------
const weekEvents = {
  "mon-kickoff": ["STW Kick Off @ G1", "Monday, October 19", "PWRD BY VERIZON", "The official opening of Sac Tech Week at Golden 1 Center, powered by Verizon."],
  "mon-women-in-tech": ["Women in Tech: An Evening Discussion", "Monday, October 19", "TIFFANI M. & SOPHIA K.", "An evening conversation with women leaders shaping Sacramento's technology community."],
  "mon-suno-101": ["Suno 101: AI Music Production", "Monday, October 19", "DPT OF SOUND", "Explore the creative possibilities of AI-assisted music production in this hands-on introduction to Suno."],
  "mon-ecosystem-dinner": ["Ecosystem Dinner", "Monday, October 19", "SAC TECH CONSORTIUM", "A welcoming dinner for the people and organizations building Sacramento's innovation ecosystem."],
  "tue-n8n-at-noon": ["N8N at Noon", "Tuesday, October 20", "SIMPLE 10 / N8N AMBASSADOR", "A lunchtime session on designing useful workflows and automations with n8n."],
  "tue-ai-career-pathways": ["AI Career Pathways + Workshop / Digital Ready", "Tuesday, October 20", "PWRD BY VERIZON", "Learn about emerging AI career pathways, then put practical digital skills to work in a guided workshop."],
  "tue-sac-tech-connect": ["Sac Tech Connect", "Tuesday, October 20", "START UP SAC", "Meet founders, builders, and community members making new connections across Sacramento tech."],
  "tue-govt-ai": ["Govt & AI", "Tuesday, October 20", "STARTUP FOLSOM", "A community conversation on how Government and AI can support better public-sector services and civic innovation."],
  "wed-common-knowledge": ["Common Knowledge @ UH", "Wednesday, October 21", "URBAN HIVE", "A Common Knowledge gathering at Urban Hive, bringing curious people together for ideas, conversation, and connection."],
  "wed-ai-small-business": ["AI for Small Business", "Wednesday, October 21", "SAC TECH WEEK", "Practical tools and ideas to help small-business owners use AI in their everyday work."],
  "wed-byob": ["Bring Your Own Beamer", "Wednesday, October 21", "BYOB", "A projection-art showcase where artists turn shared space into a living canvas of light and motion."],
  "wed-certified-aws": ["Certified with AWS", "Wednesday, October 21", "AWS", "Discover AWS learning and certification pathways for people ready to build their cloud skills."],
  "thur-curiosity-nights": ["Curiosity Nights @ MOSAC", "Thursday, October 22", "MOSAC", "An after-hours night of science, technology, and hands-on curiosity at MOSAC."],
  "thur-simply-lovable": ["Simply Lovable", "Thursday, October 22", "MATT L., CRAFTSMAN AI", "A thoughtful session on making AI products people genuinely want to use."],
  "thur-byob-sofar": ["BYOB + SoFar", "Thursday, October 22", "BYOB / SOFAR", "Projection art meets an intimate live-music experience for a night of immersive creative work."],
  "thur-granite-city": ["Granite City Coworking Space", "Thursday, October 22", "MEDSTART", "Connect with the people building the next chapter of health, science, and startup work in Sacramento at Granite City Coworking."],
  "fri-byob": ["BYOB", "Friday, October 23", "BRING YOUR OWN BEAMER", "A Friday edition of the projection-art showcase, with a fresh field of light and movement."],
  "fri-coffee-claude": ["Coffee & Claude", "Friday, October 23", "SAC TECH WEEK", "Bring your questions for a casual coffee conversation about working with Claude, Anthropic AI assistant."],
  "fri-amazon-pitch": ["Amazon Pitch Competition", "Friday, October 23", "AMAZON + SF", "Watch ambitious founders present their ideas and compete for an opportunity to move their ventures forward."],
  "fri-make-made": ["Make & Made", "Friday, October 23", "MADE STUDIOS & MAKER USA", "A celebration of making, design, and the people turning creative ideas into tangible work."],
  "sat-innovation-summit": ["Innovation Summit", "Saturday, October 24", "SAC TECH CONSORTIUM", "A full-day gathering of workshops, conversations, demonstrations, and big ideas for the Sacramento region."],
  "sat-byob": ["BYOB", "Saturday, October 24", "BRING YOUR OWN BEAMER", "The final night of projection art, built for wandering, watching, and seeing the city differently."],
  "sat-sustainability": ["Sustainability Event", "Saturday, October 24", "SAC TECH WEEK", "A community event focused on sustainable ideas, technologies, and actions for the Sacramento region."],
};

Object.entries(weekEvents).forEach(([id, [title, day, org, description]]) => {
  const images = {
    "wed-byob": "assets/event-byob.webp",
    "thur-byob-sofar": "assets/event-byob.webp",
    "fri-byob": "assets/event-byob.webp",
    "sat-byob": "assets/event-byob.webp",
    "sat-innovation-summit": "assets/event-marketplace.webp",
  };
  weekEvents[id] = { title, day, org, description, image: images[id] || null };
});

const eventModal = document.getElementById("event-modal");
if (eventModal) {
  const modalTitle = document.getElementById("modal-title");
  const modalMeta = document.getElementById("modal-meta");
  const modalBlurb = document.getElementById("modal-blurb");
  const modalImage = document.getElementById("modal-image");
  const modalRsvp = document.getElementById("modal-rsvp");
  const closeButton = eventModal.querySelector(".ev-dialog-close");

  const openEventModal = (eventId) => {
    const event = weekEvents[eventId];
    if (!event) return;
    modalTitle.textContent = event.title;
    modalMeta.textContent = `${event.day} / ${event.org}`;
    modalBlurb.textContent = event.description;
    if (event.image) {
      modalImage.innerHTML = `<img src="${event.image}" alt="${event.title}" loading="lazy" decoding="async" />`;
    } else {
      modalImage.textContent = "Event photo coming soon";
    }
    modalRsvp.textContent = "RSVP opens soon. Get email updates.";
    eventModal.showModal();
  };

  document.querySelectorAll(".week-cal-event").forEach((item) => {
    item.addEventListener("click", () => openEventModal(item.dataset.eventId));
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openEventModal(item.dataset.eventId);
      }
    });
  });

  closeButton.addEventListener("click", () => eventModal.close());
  eventModal.addEventListener("click", (event) => {
    if (event.target === eventModal) eventModal.close();
  });
  eventModal.addEventListener("cancel", () => eventModal.close());
}
