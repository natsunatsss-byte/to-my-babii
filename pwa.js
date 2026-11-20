// Registers the app and shows a small "Install" prompt.
// The install bar is built here, so index.html needs no extra markup.

(function () {
  const css = document.createElement("style");
  css.textContent = `
  #installBar{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:99999;
    display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:18px;color:#fff;
    background:rgba(40,6,24,.82);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
    border:1px solid rgba(255,255,255,.18);box-shadow:0 10px 30px rgba(0,0,0,.4);font:500 14px/1.3 system-ui,sans-serif}
  #installBar[hidden]{display:none}
  #installText{flex:1}
  #installBar button{border:0;border-radius:12px;padding:8px 12px;font:600 13px system-ui,sans-serif;cursor:pointer}
  #installYes{background:linear-gradient(135deg,#ff5f8d,#ff2d6f);color:#fff}
  #installNo{background:rgba(255,255,255,.14);color:#fff}`;
  document.head.appendChild(css);
  const bar = document.createElement("div");
  bar.id = "installBar";
  bar.hidden = true;
  bar.innerHTML = '<span id="installText"></span><button id="installYes" hidden>Install</button><button id="installNo">Later</button>';
  document.body.appendChild(bar);
})();


if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

(function () {
  const bar = document.getElementById("installBar");
  const text = document.getElementById("installText");
  const yes = document.getElementById("installYes");
  const no = document.getElementById("installNo");
  if (!bar) return;

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  if (isStandalone) return; // already installed

  let dismissed = false;
  try { dismissed = localStorage.getItem("installDismissed") === "yes"; } catch (e) {}
  if (dismissed) return;

  let deferred = null;

  function show(msg, showButton) {
    text.textContent = msg;
    yes.hidden = !showButton;
    bar.hidden = false;
  }

  // Android / Chrome
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e;
    show("Install this as an app on your phone 💗", true);
  });

  yes.addEventListener("click", async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice.catch(() => {});
    deferred = null;
    bar.hidden = true;
  });

  no.addEventListener("click", () => {
    bar.hidden = true;
    try { localStorage.setItem("installDismissed", "yes"); } catch (e) {}
  });

  // iPhone / iPad (Safari has no install prompt, so show the steps)
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios|chrome/i.test(ua);

  if (isIOS) {
    setTimeout(() => {
      if (isSafari) {
        show("To install: tap Share ⬆️ then “Add to Home Screen” 💗", false);
      } else {
        show("To install on iPhone, open this link in Safari 💗", false);
      }
    }, 4000);
  }
})();