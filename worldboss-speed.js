(() => {
  "use strict";

  const OFFSET_KEY = "qoo.worldBossClockOffsets.v1";
  const SPEED_KEY = "qoo.worldBossSpeed.v1";
  const ALLOWED_SPEEDS = [1, 3, 5];

  function readOffsets() {
    try {
      const parsed = JSON.parse(localStorage.getItem(OFFSET_KEY) || "{}");
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  let offsets = new Map(
    Object.entries(readOffsets()).map(([key, value]) => [key, Math.max(0, Number(value) || 0)])
  );
  let lastPersistAt = 0;

  function saveOffsets() {
    try {
      localStorage.setItem(OFFSET_KEY, JSON.stringify(Object.fromEntries(offsets)));
      lastPersistAt = Date.now();
    } catch (_) {
      // Keep the in-memory offsets if storage is unavailable.
    }
  }

  function characterKey(character) {
    if (!character || typeof character !== "object") return "";
    const value = character.name || character.id || character.uid || "";
    return String(value).trim();
  }

  function cleanSpeed(value) {
    const speed = Number(value);
    return ALLOWED_SPEEDS.includes(speed) ? speed : 1;
  }

  let selectedSpeed = 1;
  try {
    selectedSpeed = cleanSpeed(localStorage.getItem(SPEED_KEY));
  } catch (_) {}
  window.__wbSpeedMultiplier = selectedSpeed;

  window.__wbTimeOffsetForChar = function(character) {
    const key = characterKey(character);
    return key ? Math.max(0, offsets.get(key) || 0) : 0;
  };

  window.__wbSpeedTick = function(character, speed) {
    const key = characterKey(character);
    const multiplier = cleanSpeed(speed);
    if (!key || multiplier <= 1) return;

    offsets.set(key, Math.max(0, offsets.get(key) || 0) + 100 * (multiplier - 1));
    const now = Date.now();
    if (now - lastPersistAt >= 1000) saveOffsets();
  };

  function setSpeed(speed, persist = true) {
    selectedSpeed = cleanSpeed(speed);
    window.__wbSpeedMultiplier = selectedSpeed;
    if (persist) {
      try {
        localStorage.setItem(SPEED_KEY, String(selectedSpeed));
      } catch (_) {}
    }
    updateButtons();
  }

  let speedBar = null;
  const speedButtons = [];

  function updateButtons() {
    for (const button of speedButtons) {
      const active = Number(button.dataset.speed) === selectedSpeed;
      button.setAttribute("aria-pressed", active ? "true" : "false");
      button.style.background = active ? "#8a6d2e" : "rgba(24,18,12,.92)";
      button.style.borderColor = active ? "#f5c451" : "#6b552f";
      button.style.color = active ? "#fff4cc" : "#e8dcc0";
      button.style.fontWeight = active ? "700" : "500";
    }
  }

  let wasInCombat = false;
  let speedBeforeCombat = selectedSpeed;

  function updateVisibility() {
    if (!speedBar) return;
    const area = document.getElementById("boss-area");
    const stop = document.getElementById("btn-stop");
    const inCombat = !!stop && !stop.classList.contains("hidden");
    const inBossCombat = inCombat && !!area && !area.classList.contains("hidden");

    // Automatically use 5x during every combat, including normal hunting.
    // Restore the player's previously selected speed when combat ends.
    if (inCombat && !wasInCombat) {
      speedBeforeCombat = selectedSpeed;
      setSpeed(5, false);
    } else if (!inCombat && wasInCombat) {
      setSpeed(speedBeforeCombat);
    }
    wasInCombat = inCombat;

    // Keep the existing speed controls visible only in the world-boss panel.
    speedBar.style.display = inBossCombat ? "flex" : "none";
  }

  function buildControls() {
    const area = document.getElementById("boss-area");
    if (!area || document.getElementById("wb-speed-bar")) return;

    speedBar = document.createElement("div");
    speedBar.id = "wb-speed-bar";
    speedBar.style.cssText =
      "display:none;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;" +
      "width:100%;margin:2px 0 4px;padding:6px 8px;box-sizing:border-box;" +
      "border:1px solid rgba(193,154,74,.55);border-radius:9px;" +
      "background:rgba(20,14,9,.82);color:#e8dcc0;font-size:12px;z-index:5;";

    const label = document.createElement("span");
    label.textContent = "戰鬥速度";
    label.style.cssText = "font-weight:700;color:#f5c451;margin-right:2px;";
    speedBar.appendChild(label);

    for (const speed of ALLOWED_SPEEDS) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.speed = String(speed);
      button.textContent = speed === 1 ? "1× 正常" : speed + "×";
      button.style.cssText =
        "min-width:48px;padding:5px 10px;border:1px solid #6b552f;border-radius:7px;" +
        "background:rgba(24,18,12,.92);color:#e8dcc0;font-size:12px;cursor:pointer;";
      button.addEventListener("click", () => setSpeed(speed));
      speedButtons.push(button);
      speedBar.appendChild(button);
    }

    const note = document.createElement("span");
    note.textContent = "戰鬥中自動使用 5×";
    note.style.cssText = "color:#b6a684;font-size:11px;margin-left:2px;";
    speedBar.appendChild(note);

    const grid = document.getElementById("boss-grid");
    if (grid && grid.parentElement === area) grid.insertAdjacentElement("afterend", speedBar);
    else area.appendChild(speedBar);

    updateButtons();
    updateVisibility();

    const stop = document.getElementById("btn-stop");
    if (typeof MutationObserver !== "undefined") {
      const observer = new MutationObserver(updateVisibility);
      observer.observe(area, { attributes: true, attributeFilter: ["class"] });
      if (stop) observer.observe(stop, { attributes: true, attributeFilter: ["class"] });
    }
    setInterval(updateVisibility, 500);
  }

  window.addEventListener("pagehide", saveOffsets);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") saveOffsets();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildControls, { once: true });
  } else {
    buildControls();
  }
})();