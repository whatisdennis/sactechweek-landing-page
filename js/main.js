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

// --- Home-page live calendar -----------------------------------------
const weekEvents = [
  { date: "2026-10-19", day: "Monday, October 19", time: "9:00 AM–12:00 PM", title: "State of Innovaiton Kickoff Breakfast - STW", url: "https://luma.com/j9jspm0p" },
  { date: "2026-10-19", day: "Monday, October 19", time: "12:00 PM–2:00 PM PDT", title: "N8N at Noon - N8N", url: "https://luma.com/118fsgex" },
  { date: "2026-10-19", day: "Monday, October 19", time: "6:00 PM–8:00 PM PDT", title: "Woman in Tech Panel - Woman Business Center", url: "https://luma.com/fp7x1by6" },
  { date: "2026-10-20", day: "Tuesday, October 20", time: "3:00–6:00 PM", title: "AI Programming Bootcamp - Playful Programming", url: "https://luma.com/d184kjg7" },
  { date: "2026-10-20", day: "Tuesday, October 20", time: "4:00–8:00 PM", title: "Startup World Cup - STW", description: "Global startup conference and competition connecting startups, VCs, entrepreneurs, and tech CEOs.", url: "https://luma.com/kbji68lz" },
  { date: "2026-10-20", day: "Tuesday, October 20", time: "5:00–9:00 PM", title: "Advanced AI Workshop - AIAJ Academy", description: "Practical advanced-AI workshop, panel, and networking for professionals implementing AI in real business workflows.", url: "https://luma.com/r1q71j09" },
  { date: "2026-10-20", day: "Tuesday, October 20", time: "6:00–9:00 PM", title: "SacTech Social - SacTech Inc.", description: "Inclusive networking social for technology professionals to connect, collaborate, hire, and find jobs.", url: "https://luma.com/s0xemi9e" },
  { date: "2026-10-20", day: "Tuesday, October 20", time: "6:00–8:00 PM", title: "AI Meet Up featuring AWS Partner Initiatives Manager Robby Gill - Startup Folsom", description: "Monthly AI meetup with pizza, discussion, networking, and a featured AWS speaker.", url: "https://luma.com/6stv67gu" },
  { date: "2026-10-21", day: "Wednesday, October 21", time: "9:00–10:00 AM", title: "Virtual Pitch Feedback - 1 Million Cups", url: "https://luma.com/f8cqy3sw" },
  { date: "2026-10-21", day: "Wednesday, October 21", time: "11:00 AM–3:00 PM PDT", title: "AI for Small Business - SVP", description: "Norcal SBDC & CA Capital; co-host The AI Collective.", url: "https://luma.com/rbhk3qa7" },
  { date: "2026-10-21", day: "Wednesday, October 21", time: "5:30–8:30 PM", title: "Build for Impact in Gov & Civic Tech - Koi Studios", description: "Panel on designing responsible, high-impact AI-era technology for government and civic users.", url: "https://luma.com/bemj37kv" },
  { date: "2026-10-21", day: "Wednesday, October 21", time: "6:00–9:00 PM", title: "Circular Manufacturing Exhibit - EcoPress", description: "Interactive exhibit and demos on turning local plastic waste into products, art, and sustainable materials.", url: "https://luma.com/9a9zt1u7" },
  { date: "2026-10-21", day: "Wednesday, October 21", time: "6:00–9:00 PM", title: "The Future of Autonomous Vehicles - Common Knowledge", description: "UC Davis lecture examining real-world autonomous-vehicle safety, deployment, and civic impacts.", url: "https://luma.com/o2mwnzzk" },
  { date: "2026-10-22", day: "Thursday, October 22", time: "11:00 AM–2:00 PM PDT", title: "Sustainability Event - Atrium", url: "https://luma.com/xbjdrc7k" },
  { date: "2026-10-22", day: "Thursday, October 22", time: "5:00–8:00 PM", title: "AI Town Hall - AI for Good SVP", description: "Talk on the Creative Economy Entrepreneurship Initiative with Sacramento Venture Philanthropy’s AI for Good.", url: "https://luma.com/x00pc859" },
  { date: "2026-10-22", day: "Thursday, October 22", time: "6:00 PM–8:00 PM PDT", title: "Simply Lovable - Craftsman AI", url: "https://luma.com/bnm4g7rg" },
  { date: "2026-10-23", day: "Friday, October 23", time: "6:30–9:00 PM", title: "Amazon Pitch Competition - AWS", url: "https://luma.com/dtzaajd3" },
  { date: "2026-10-24", day: "Saturday, October 24", time: "9:00 AM–5:00 PM", title: "Tandem Summit - STW", description: "Tandem Summit is SacTech Week’s capstone event: a gathering for the people building, questioning, experiencing, and imagining the future of technology.", url: "https://luma.com/qerdn7wo" },
];

document.querySelectorAll("[data-calendar-date]").forEach((list) => {
  const eventsForDay = weekEvents.filter((event) => event.date === list.dataset.calendarDate);

  eventsForDay.forEach((event) => {
    const item = document.createElement("li");
    item.className = "week-cal-event";

    const title = document.createElement("span");
    title.className = "week-cal-event-name";
    title.textContent = event.title;

    item.append(title);

    const link = document.createElement("a");
    link.className = "week-cal-event-link";
    link.href = event.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `View ${event.title} on Luma (opens in a new tab)`);
    link.textContent = "View event on Luma ↗";
    item.append(link);
    list.append(item);
  });
});
