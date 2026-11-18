console.log("script loaded ✅");

// ============ SETTINGS (edit these) ============
// Special word for the lock screen. Use "" to turn the lock off.
const PASSWORD = "yemen";

// Date of your first picture, as YYYY-MM-DD. Use "" to hide this counter.
const START_DATE = "2026-07-12";

// Date you started courting her, as YYYY-MM-DD. Use "" to hide this counter.
const COURT_START_DATE = "2026-04-04";
// ===============================================

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover)").matches;
const isSmallScreen = window.matchMedia("(max-width: 600px)").matches;

// ---------- Music ----------
const picker = document.getElementById("picker");
const bgm = document.getElementById("bgm");
const musicBar = document.getElementById("musicBar");
const musicToggle = document.getElementById("musicToggle");
const musicTitle = document.getElementById("musicTitle");
const musicChange = document.getElementById("musicChange");
const TARGET_VOLUME = 0.7;
let fadeTimer = null;

function fadeVolumeTo(target, ms = 1500) {
  clearInterval(fadeTimer);
  const steps = 30;
  const delta = (target - bgm.volume) / steps;
  let n = 0;
  fadeTimer = setInterval(() => {
    n++;
    bgm.volume = Math.min(1, Math.max(0, bgm.volume + delta));
    if (n >= steps) clearInterval(fadeTimer);
  }, ms / steps);
}

function showPicker() {
  picker.hidden = false;
  document.body.classList.add("locked");
}

function pickSong(src, title) {
  if (src) {
    if (!bgm.src.endsWith(src)) bgm.src = src;
    bgm.volume = 0;
    bgm.play().then(() => fadeVolumeTo(TARGET_VOLUME)).catch(() => {});
    musicTitle.textContent = title;
    musicToggle.textContent = "❚❚";
    musicBar.hidden = false;
  } else {
    bgm.pause();
    musicBar.hidden = true;
  }
  picker.hidden = true;
  document.body.classList.remove("locked");
  startIntro();
}

document.querySelectorAll(".song").forEach((btn) => {
  btn.addEventListener("click", () => pickSong(btn.dataset.src, btn.dataset.title));
});
document.getElementById("skipMusic").addEventListener("click", () => pickSong(null));

musicToggle.addEventListener("click", () => {
  if (bgm.paused) {
    bgm.play();
    musicToggle.textContent = "❚❚";
  } else {
    bgm.pause();
    musicToggle.textContent = "▶";
  }
});

musicChange.addEventListener("click", showPicker);

// ---------- Lock screen ----------
const lock = document.getElementById("lock");
const lockForm = document.getElementById("lockForm");
const lockInput = document.getElementById("lockInput");
const lockError = document.getElementById("lockError");

function unlock() {
  lock.hidden = true;
  document.body.classList.remove("locked");
  try { sessionStorage.setItem("unlocked", "yes"); } catch (e) {}
  showPicker();
}

let alreadyUnlocked = false;
try { alreadyUnlocked = sessionStorage.getItem("unlocked") === "yes"; } catch (e) {}

lockForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (lockInput.value.trim().toLowerCase() === PASSWORD.toLowerCase()) {
    unlock();
  } else {
    lockError.textContent = "Not quite, try again 💭";
    lockInput.value = "";
  }
});

// ---------- Typewriter intro + day counters ----------
const typedEl = document.getElementById("typed");
const TEXT = "A little corner of the internet made only for you.";
let introStarted = false;

function runCounter(dateStr, boxId, outId) {
  if (!dateStr) return;

  const start = new Date(dateStr + "T00:00:00");
  const total = Math.floor((Date.now() - start) / 86400000);
  if (isNaN(total) || total < 0) return;

  document.getElementById(boxId).hidden = false;
  const out = document.getElementById(outId);

  if (reduceMotion) {
    out.textContent = total;
    return;
  }

  let n = 0;
  const step = Math.max(1, Math.ceil(total / 60));
  const c = setInterval(() => {
    n = Math.min(total, n + step);
    out.textContent = n;
    if (n >= total) clearInterval(c);
  }, 25);
}

function startIntro() {
  if (introStarted) return;
  introStarted = true;

  if (reduceMotion) {
    typedEl.textContent = TEXT;
  } else {
    let i = 0;
    const t = setInterval(() => {
      typedEl.textContent = TEXT.slice(0, ++i);
      if (i >= TEXT.length) clearInterval(t);
    }, 45);
  }

  runCounter(START_DATE, "counter", "days");
  runCounter(COURT_START_DATE, "courtCounter", "courtDays");
}

if (!PASSWORD || alreadyUnlocked) {
  lock.hidden = true;
  document.body.classList.remove("locked");
  showPicker();
} else {
  lockInput.focus();
}

// ---------- Scroll progress ----------
const progress = document.getElementById("progress");
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.setProperty("--p", max > 0 ? window.scrollY / max : 0);
}
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

// ---------- Cursor glow (laptops only) ----------
const glow = document.getElementById("cursorGlow");
if (canHover) {
  window.addEventListener("pointermove", (e) => {
    glow.style.opacity = 1;
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });
}

// ---------- Falling petals ----------
function createPetal() {
  const petal = document.createElement("div");
  petal.classList.add("petal");

  const size = Math.random() * 10 + 8;
  petal.style.left = Math.random() * window.innerWidth + "px";
  petal.style.width = size + "px";
  petal.style.height = size + "px";
  petal.style.animationDuration = Math.random() * 5 + 6 + "s";
  petal.style.setProperty("--sway", Math.random() * 120 - 60 + "px");

  petal.addEventListener("animationend", () => petal.remove());
  document.body.appendChild(petal);
}

let petalTimer = null;
function startPetals() {
  if (reduceMotion || petalTimer) return;
  petalTimer = setInterval(createPetal, isSmallScreen ? 600 : 350);
}
function stopPetals() {
  clearInterval(petalTimer);
  petalTimer = null;
}
document.addEventListener("visibilitychange", () => {
  document.hidden ? stopPetals() : startPetals();
});
startPetals();

// ---------- Heart burst on tap ----------
const HEARTS = ["❤️", "💗", "💖", "🤍", "💕"];
document.addEventListener("pointerdown", (e) => {
  if (reduceMotion || e.target.closest("input")) return;
  for (let i = 0; i < 7; i++) {
    const h = document.createElement("span");
    h.className = "burst";
    h.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
    h.style.left = e.clientX + "px";
    h.style.top = e.clientY + "px";
    h.style.fontSize = Math.random() * 12 + 14 + "px";
    h.style.setProperty("--dx", Math.random() * 120 - 60 + "px");
    h.style.setProperty("--dy", -(Math.random() * 90 + 30) + "px");
    h.addEventListener("animationend", () => h.remove());
    document.body.appendChild(h);
  }
});

// ---------- Smooth scroll (eased) ----------
let scrollRaf = null;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothScrollTo(targetY) {
  cancelAnimationFrame(scrollRaf);

  if (reduceMotion) {
    window.scrollTo({ top: targetY, behavior: "instant" });
    return;
  }

  const startY = window.scrollY;
  const distance = targetY - startY;
  const duration = Math.min(2200, Math.max(1300, Math.abs(distance) * 0.9));
  let startTime = null;

  function step(now) {
    if (startTime === null) startTime = now;
    const t = Math.min((now - startTime) / duration, 1);
    window.scrollTo({ top: startY + distance * easeInOutCubic(t), behavior: "instant" });
    if (t < 1) scrollRaf = requestAnimationFrame(step);
  }

  scrollRaf = requestAnimationFrame(step);
}

// Stop the animation if she scrolls or touches the screen herself
["wheel", "touchstart"].forEach((ev) =>
  window.addEventListener(ev, () => cancelAnimationFrame(scrollRaf), { passive: true })
);

// ---------- Open button ----------
const openBtn = document.getElementById("openBtn");

openBtn.addEventListener("click", () => {
  openBtn.classList.remove("pop");
  void openBtn.offsetWidth; // restarts the animation
  openBtn.classList.add("pop");

  const target = document.getElementById("story");
  const y = target.getBoundingClientRect().top + window.scrollY - 20;
  setTimeout(() => smoothScrollTo(y), 220);
});

// ---------- Reveal on scroll ----------
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// ---------- 3D tilt + glare ----------
document.querySelectorAll(".tilt").forEach((el) => {
  el.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", (x - 0.5) * 14 + "deg");
    el.style.setProperty("--rx", (0.5 - y) * 14 + "deg");
    el.style.setProperty("--mx", x * 100 + "%");
    el.style.setProperty("--my", y * 100 + "%");
  });
  el.addEventListener("pointerleave", () => {
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  });
});

// ---------- Photo stack ----------
const deck = document.getElementById("deck");

function layoutDeck() {
  [...deck.children].forEach((card, i) => {
    card.style.setProperty("--i", i);
    card.style.setProperty("--r", i === 0 ? 0 : i % 2 ? -4 : 4);
  });
}
layoutDeck();

function nextCard() {
  const top = deck.children[0];
  if (top.classList.contains("out")) return;
  top.classList.add("out");
  setTimeout(() => {
    top.style.transition = "none";
    top.classList.remove("out");
    deck.appendChild(top);
    layoutDeck();
    void top.offsetWidth;
    top.style.transition = "";
  }, 450);
}

deck.addEventListener("click", nextCard);
deck.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    nextCard();
  }
});

// ---------- Flip cards ----------
document.querySelectorAll(".flip").forEach((btn) => {
  btn.addEventListener("click", () => btn.classList.toggle("flipped"));
});

// ---------- Photo viewer ----------
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbCap = document.getElementById("lbCap");
const lbItems = [...document.querySelectorAll("img[data-lb]")];
let lbIndex = 0;

function showPhoto(i) {
  lbIndex = (i + lbItems.length) % lbItems.length;
  const img = lbItems[lbIndex];
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  const cap = img.closest("figure").querySelector("figcaption");
  lbCap.textContent = cap ? cap.textContent : "";
}

function openLightbox(i) {
  showPhoto(i);
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  lightbox.querySelector(".lb-close").focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.style.overflow = "";
}

lbItems.forEach((img, i) => img.addEventListener("click", () => openLightbox(i)));
lightbox.querySelector(".lb-close").addEventListener("click", closeLightbox);
lightbox.querySelector(".prev").addEventListener("click", () => showPhoto(lbIndex - 1));
lightbox.querySelector(".next").addEventListener("click", () => showPhoto(lbIndex + 1));
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

let touchX = null;
lightbox.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) showPhoto(lbIndex + (dx < 0 ? 1 : -1));
  touchX = null;
});

// ---------- Letter popups ----------
let activePopup = null;
let lastButton = null;

function openPopup(popup, button) {
  activePopup = popup;
  lastButton = button;
  popup.querySelectorAll("p").forEach((p, i) => p.style.setProperty("--d", i * 0.18 + "s"));
  popup.scrollTop = 0;
  popup.classList.add("open");
  document.body.style.overflow = "hidden";
  popup.querySelector(".close").focus();
}

function closePopup() {
  if (!activePopup) return;
  activePopup.classList.remove("open");
  document.body.style.overflow = "";
  if (lastButton) lastButton.focus();
  activePopup = null;
}

document.querySelectorAll("[data-open]").forEach((btn) => {
  btn.addEventListener("click", () => openPopup(document.getElementById(btn.dataset.open), btn));
});

document.querySelectorAll(".popup").forEach((popup) => {
  popup.addEventListener("click", (e) => {
    if (e.target === popup) closePopup();
  });
  popup.querySelector(".close").addEventListener("click", closePopup);
});

// ---------- Keyboard ----------
document.addEventListener("keydown", (e) => {
  if (!lightbox.hidden) {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showPhoto(lbIndex - 1);
    if (e.key === "ArrowRight") showPhoto(lbIndex + 1);
    return;
  }
  if (e.key === "Escape") closePopup();
});