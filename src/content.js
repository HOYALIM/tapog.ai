const DEFAULT_SETTINGS = {
  trigger: {
    key: "g",
    altKey: true,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false
  },
  armTimeoutMs: 4000,
  groupSinglesAsOthers: true
};

let settings = { ...DEFAULT_SETTINGS };
let armedUntil = 0;
let toastTimer = null;
let disarmTimer = null;
let clickListenerAttached = false;

init();

async function init() {
  const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  settings = mergeSettings(DEFAULT_SETTINGS, stored);

  document.addEventListener("keydown", onKeyDown, true);

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync") {
      return;
    }

    const next = {};
    for (const [key, value] of Object.entries(changes)) {
      next[key] = value.newValue;
    }
    settings = mergeSettings(settings, next);
  });
}

function onKeyDown(event) {
  if (event.repeat) {
    return;
  }

  if (isEditable(event.target)) {
    return;
  }

  if (!matchesTrigger(event, settings.trigger)) {
    return;
  }

  const armDurationMs = clampTimeout(settings.armTimeoutMs);
  armForClickGrouping(armDurationMs);
  event.preventDefault();
  event.stopPropagation();

  const seconds = Math.round(armDurationMs / 1000);
  showToast(`tapog.ai armed: click once in ${seconds}s to group tabs`);
}

function onClickWhileArmed(event) {
  if (Date.now() > armedUntil) {
    disarmGrouping();
    return;
  }

  disarmGrouping();
  event.preventDefault();
  event.stopImmediatePropagation();

  chrome.runtime.sendMessage({ type: "GROUP_SIMILAR_TABS", source: "content" }, (response) => {
    if (chrome.runtime.lastError) {
      showToast("tapog.ai: failed to group tabs.");
      return;
    }

    if (!response?.ok) {
      showToast(`tapog.ai: ${response?.error || "failed"}`);
      return;
    }

    showToast(`tapog.ai: ${response.message}`);
  });
}

function armForClickGrouping(durationMs) {
  armedUntil = Date.now() + durationMs;
  ensureClickListenerAttached(true);

  if (disarmTimer) {
    clearTimeout(disarmTimer);
  }

  disarmTimer = setTimeout(() => {
    if (Date.now() > armedUntil) {
      disarmGrouping();
    }
  }, durationMs + 50);
}

function disarmGrouping() {
  armedUntil = 0;
  ensureClickListenerAttached(false);

  if (!disarmTimer) {
    return;
  }

  clearTimeout(disarmTimer);
  disarmTimer = null;
}

function ensureClickListenerAttached(shouldAttach) {
  if (shouldAttach && !clickListenerAttached) {
    document.addEventListener("click", onClickWhileArmed, true);
    clickListenerAttached = true;
    return;
  }

  if (!shouldAttach && clickListenerAttached) {
    document.removeEventListener("click", onClickWhileArmed, true);
    clickListenerAttached = false;
  }
}

function matchesTrigger(event, trigger) {
  const expectedKey = normalizeKey(trigger.key);
  const actualKey = normalizeKey(event.key);

  return (
    expectedKey === actualKey &&
    Boolean(trigger.altKey) === event.altKey &&
    Boolean(trigger.ctrlKey) === event.ctrlKey &&
    Boolean(trigger.metaKey) === event.metaKey &&
    Boolean(trigger.shiftKey) === event.shiftKey
  );
}

function normalizeKey(key) {
  if (!key) {
    return "";
  }

  if (key === " ") {
    return "space";
  }

  if (key.length === 1) {
    return key.toLowerCase();
  }

  return key.toLowerCase();
}

function isEditable(target) {
  if (!target) {
    return false;
  }

  const tag = target.tagName;
  if (!tag) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function clampTimeout(value) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return DEFAULT_SETTINGS.armTimeoutMs;
  }
  return Math.min(10000, Math.max(1000, numberValue));
}

function showToast(message) {
  let toast = document.getElementById("tapog-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "tapog-toast";
    toast.style.position = "fixed";
    toast.style.zIndex = "2147483647";
    toast.style.right = "16px";
    toast.style.bottom = "16px";
    toast.style.padding = "10px 14px";
    toast.style.borderRadius = "8px";
    toast.style.background = "rgba(0,0,0,0.85)";
    toast.style.color = "#fff";
    toast.style.fontSize = "13px";
    toast.style.fontFamily = "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
    toast.style.maxWidth = "280px";
    toast.style.lineHeight = "1.35";
    toast.style.boxShadow = "0 6px 20px rgba(0,0,0,0.25)";
    document.documentElement.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = "1";

  if (toastTimer) {
    clearTimeout(toastTimer);
  }
  toastTimer = setTimeout(() => {
    toast.style.opacity = "0";
  }, 2200);
}

function mergeSettings(defaults, stored) {
  return {
    ...defaults,
    ...stored,
    trigger: {
      ...defaults.trigger,
      ...(stored.trigger || {})
    }
  };
}
