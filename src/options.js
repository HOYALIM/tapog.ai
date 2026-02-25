const DEFAULT_SETTINGS = {
  trigger: {
    key: "g",
    altKey: true,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false
  },
  armTimeoutMs: 4000,
  groupingMode: "ai",
  groupSinglesAsOthers: true,
  groupGuardRulesText: "",
  aiCategoriesText: "",
  filterOutRuleMatchedTabs: true
};

const keyInput = document.getElementById("key");
const altKeyInput = document.getElementById("altKey");
const ctrlKeyInput = document.getElementById("ctrlKey");
const metaKeyInput = document.getElementById("metaKey");
const shiftKeyInput = document.getElementById("shiftKey");
const groupingModeInput = document.getElementById("groupingMode");
const timeoutInput = document.getElementById("armTimeoutMs");
const groupSinglesInput = document.getElementById("groupSinglesAsOthers");
const filterOutRuleMatchedTabsInput = document.getElementById("filterOutRuleMatchedTabs");
const groupGuardRulesTextInput = document.getElementById("groupGuardRulesText");
const aiCategoriesTextInput = document.getElementById("aiCategoriesText");
const saveButton = document.getElementById("save");
const statusText = document.getElementById("status");

init();

async function init() {
  const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  const settings = mergeSettings(DEFAULT_SETTINGS, stored);
  render(settings);
}

saveButton.addEventListener("click", async () => {
  const key = normalizeKeyInput(keyInput.value);
  if (!key) {
    setStatus("Key is required.");
    keyInput.focus();
    return;
  }

  const payload = {
    trigger: {
      key,
      altKey: altKeyInput.checked,
      ctrlKey: ctrlKeyInput.checked,
      metaKey: metaKeyInput.checked,
      shiftKey: shiftKeyInput.checked
    },
    groupingMode: normalizeGroupingMode(groupingModeInput.value),
    armTimeoutMs: clampTimeout(timeoutInput.value),
    groupSinglesAsOthers: groupSinglesInput.checked,
    filterOutRuleMatchedTabs: filterOutRuleMatchedTabsInput.checked,
    groupGuardRulesText: String(groupGuardRulesTextInput.value || "").trim(),
    aiCategoriesText: String(aiCategoriesTextInput.value || "").trim()
  };

  await chrome.storage.sync.set(payload);
  setStatus("Saved.");
});

function render(settings) {
  keyInput.value = settings.trigger.key;
  altKeyInput.checked = Boolean(settings.trigger.altKey);
  ctrlKeyInput.checked = Boolean(settings.trigger.ctrlKey);
  metaKeyInput.checked = Boolean(settings.trigger.metaKey);
  shiftKeyInput.checked = Boolean(settings.trigger.shiftKey);
  groupingModeInput.value = normalizeGroupingMode(settings.groupingMode);
  timeoutInput.value = clampTimeout(settings.armTimeoutMs);
  groupSinglesInput.checked = Boolean(settings.groupSinglesAsOthers);
  filterOutRuleMatchedTabsInput.checked = Boolean(settings.filterOutRuleMatchedTabs);
  groupGuardRulesTextInput.value = String(settings.groupGuardRulesText || "");
  aiCategoriesTextInput.value = String(settings.aiCategoriesText || "");
}

function normalizeKeyInput(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.length === 1) {
    return trimmed.toLowerCase();
  }

  return trimmed;
}

function clampTimeout(value) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return DEFAULT_SETTINGS.armTimeoutMs;
  }

  return Math.min(10000, Math.max(1000, Math.round(numberValue)));
}

function normalizeGroupingMode(value) {
  return String(value || "").toLowerCase() === "domain" ? "domain" : "ai";
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

function setStatus(message) {
  statusText.textContent = message;
  setTimeout(() => {
    statusText.textContent = "";
  }, 1400);
}
