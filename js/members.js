/**
 * Members-only year-round calendar: password gate + client-side decryption
 * + interactive rhythm grid. The page ships only ciphertext (js/members-data.js);
 * nothing readable until the right password decrypts it via Web Crypto.
 */

const DAYS = [
  ["monday", "Mon", "Monday"],
  ["tuesday", "Tue", "Tuesday"],
  ["wednesday", "Wed", "Wednesday"],
  ["thursday", "Thu", "Thursday"],
  ["friday", "Fri", "Friday"],
  ["saturday", "Sat", "Saturday"],
  ["sunday", "Sun", "Sunday"]
];
const ORDINALS = { 1: "1st", 2: "2nd", 3: "3rd", 4: "4th", 5: "5th" };
const CACHE_KEY = "stw_members_cache_v1";
const MOBILE_MQ = window.matchMedia("(max-width: 720px)");

const gate = document.getElementById("gate");
const form = document.getElementById("gate-form");
const input = document.getElementById("gate-password");
const root = document.getElementById("calendar-root");

// --- crypto ---------------------------------------------------------
function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function decrypt(password, payload) {
  const salt = b64ToBytes(payload.salt);
  const iv = b64ToBytes(payload.iv);
  const ct = b64ToBytes(payload.ct);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: payload.kdf.iterations, hash: payload.kdf.hash },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
  const buf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return new TextDecoder().decode(buf); // throws on wrong password (GCM auth fail)
}

// --- helpers --------------------------------------------------------
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

// --- toast notifications --------------------------------------------
function toast(message, type = "success") {
  let region = document.getElementById("toast-region");
  if (!region) {
    region = el("div", "toast-region");
    region.id = "toast-region";
    document.body.appendChild(region);
  }
  const t = el("div", `toast toast--${type}`);
  t.setAttribute("role", type === "error" ? "alert" : "status");
  t.append(el("span", "toast-icon", type === "error" ? "!" : "✓"), el("span", "toast-msg", message));
  region.appendChild(t);
  requestAnimationFrame(() => t.classList.add("is-in"));
  setTimeout(() => {
    t.classList.remove("is-in");
    t.addEventListener("transitionend", () => t.remove(), { once: true });
    setTimeout(() => t.remove(), 500); // fallback if no transition fires
  }, 3600);
}

function scrollToCalendar() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  requestAnimationFrame(() => {
    (document.querySelector(".rhythm-section") || root).scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start"
    });
  });
}

function cadenceLine(ev) {
  if (ev.dateLabel) return `${ev.dateLabel} · Annual`;
  return `${ORDINALS[ev.week]} ${cap(ev.day)} · Monthly`;
}

// --- detail dialog --------------------------------------------------
let dialog;
function ensureDialog() {
  if (dialog) return dialog;
  dialog = document.createElement("dialog");
  dialog.className = "ev-dialog";
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });
  document.body.appendChild(dialog);
  return dialog;
}

function openDetail(ev) {
  const d = ensureDialog();
  d.innerHTML = "";
  const close = el("button", "ev-dialog-close", "✕");
  close.setAttribute("aria-label", "Close");
  close.addEventListener("click", () => d.close());

  const zone = el("span", "zone zone--lavender", ev.dateLabel ? "Annual event" : "Monthly · recurring");
  const h = el("h3", "ev-dialog-title", ev.name);
  const meta = el("p", "ev-dialog-meta", cadenceLine(ev));

  d.append(close, zone, h, meta);

  const facts = el("ul", "ev-facts");
  if (ev.time) facts.append(fact("Time", ev.time));
  if (ev.venue) facts.append(fact("Venue", ev.venue));
  if (facts.children.length) d.append(facts);

  if (ev.blurb) d.append(el("p", "ev-dialog-blurb", ev.blurb));

  if (ev.link) {
    const a = el("a", "btn-white ev-dialog-cta", "Details ↗");
    a.href = ev.link;
    if (/^https?:/i.test(ev.link)) {
      a.target = "_blank";
      a.rel = "noopener";
    }
    d.append(a);
  }

  d.showModal();
}

function fact(label, value) {
  const li = el("li");
  li.append(el("span", "ev-fact-label", label), el("span", "ev-fact-value", value));
  return li;
}

function eventCard(ev, { ordinal } = {}) {
  const btn = el("button", "ev-card");
  btn.type = "button";
  if (ordinal) btn.append(el("span", "ev-card-ord", ORDINALS[ev.week]));
  btn.append(el("span", "ev-card-name", ev.name));
  if (ev.venue) btn.append(el("span", "ev-card-venue", ev.venue));
  btn.addEventListener("click", () => openDetail(ev));
  return btn;
}

// --- rhythm grid: desktop matrix ------------------------------------
function renderMatrix(recurring) {
  const grid = el("div", "rhythm-grid");
  grid.append(el("div", "rhythm-corner")); // top-left corner
  for (const [, abbr] of DAYS) grid.append(el("div", "rhythm-dayhead", abbr));

  for (let week = 1; week <= 4; week++) {
    grid.append(el("div", "rhythm-weeklabel", ORDINALS[week]));
    for (const [key] of DAYS) {
      const cell = el("div", "rhythm-cell");
      const events = recurring.filter((e) => e.day === key && e.week === week);
      if (events.length) {
        for (const ev of events) cell.append(eventCard(ev));
      } else {
        cell.classList.add("is-empty");
      }
      grid.append(cell);
    }
  }
  return grid;
}

// --- rhythm grid: mobile, grouped by day ----------------------------
function renderStacked(recurring) {
  const wrap = el("div", "rhythm-stack");
  for (const [key, , full] of DAYS) {
    const events = recurring
      .filter((e) => e.day === key)
      .sort((a, b) => a.week - b.week);
    if (!events.length) continue;
    const group = el("section", "rhythm-daygroup");
    group.append(el("h3", "rhythm-dayname", full));
    const list = el("div", "rhythm-daylist");
    for (const ev of events) list.append(eventCard(ev, { ordinal: true }));
    group.append(list);
    wrap.append(group);
  }
  return wrap;
}

// --- annual strip ---------------------------------------------------
function renderAnnual(annual) {
  if (!annual || !annual.length) return null;
  const section = el("section", "annual-section");
  const head = el("div", "annual-head");
  head.append(el("span", "zone", "> Anchored / Annual"));
  head.append(el("h2", "annual-title", "Marquee moments"));
  section.append(head);

  const list = el("div", "annual-list");
  for (const ev of [...annual].sort((a, b) => (a.month || 0) - (b.month || 0))) {
    const card = el("button", "annual-card");
    card.type = "button";
    card.append(el("span", "annual-date", ev.dateLabel || ""));
    card.append(el("span", "annual-name", ev.name));
    if (ev.venue) card.append(el("span", "annual-venue", ev.venue));
    card.addEventListener("click", () => openDetail(ev));
    list.append(card);
  }
  section.append(list);
  return section;
}

// --- top-level render -----------------------------------------------
let currentData = null;

function renderCalendar() {
  if (!currentData) return;
  root.innerHTML = "";

  const header = el("header", "cal-head");
  header.append(el("span", "zone", "> STW / Members_Calendar"));
  header.append(el("h1", "cal-title", currentData.meta?.title || "Year-round calendar"));
  if (currentData.meta?.intro) header.append(el("p", "cal-intro", currentData.meta.intro));
  root.append(header);

  const rhythm = el("section", "rhythm-section");
  const rhead = el("div", "rhythm-head");
  rhead.append(el("span", "zone zone--lavender", "Every month, on repeat"));
  rhead.append(el("h2", "rhythm-title", "The monthly rhythm"));
  rhythm.append(rhead);
  rhythm.append(MOBILE_MQ.matches ? renderStacked(currentData.recurring) : renderMatrix(currentData.recurring));
  root.append(rhythm);

  const annual = renderAnnual(currentData.annual);
  if (annual) root.append(annual);
}

// Re-render on breakpoint change (matrix <-> stacked).
MOBILE_MQ.addEventListener("change", renderCalendar);

function unlock(jsonString, { cache } = {}) {
  currentData = JSON.parse(jsonString);
  if (cache) sessionStorage.setItem(CACHE_KEY, jsonString);
  gate.hidden = true;
  root.hidden = false;
  renderCalendar();
}

// --- gate -----------------------------------------------------------
form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = window.__STW_MEMBERS__;
  if (!payload) {
    toast("Calendar failed to load. Refresh and try again.", "error");
    return;
  }
  const btn = form.querySelector("button[type=submit]");
  btn.disabled = true;
  btn.dataset.label = btn.textContent;
  btn.textContent = "Unlocking…";
  try {
    const json = await decrypt(input.value, payload);
    unlock(json, { cache: true });
    toast("Access granted — welcome in.", "success");
    scrollToCalendar();
  } catch {
    toast("That password didn't work. Try again.", "error");
    input.select();
  } finally {
    btn.disabled = false;
    btn.textContent = btn.dataset.label || "Unlock";
  }
});

// Auto-unlock within the same tab session if already decrypted (silent).
const cached = sessionStorage.getItem(CACHE_KEY);
if (cached) {
  try {
    unlock(cached);
  } catch {
    sessionStorage.removeItem(CACHE_KEY);
  }
}
