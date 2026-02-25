const TAB_GROUP_COLORS = ["grey", "blue", "red", "yellow", "green", "pink", "purple", "cyan", "orange"];

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

const BUILTIN_AI_CATEGORIES = [
  {
    id: "ai",
    label: "AI",
    color: "purple",
    keywords: ["openai", "chatgpt", "claude", "anthropic", "gemini", "perplexity", "midjourney", "stability"]
  },
  {
    id: "dev",
    label: "Dev",
    color: "blue",
    keywords: ["github", "gitlab", "bitbucket", "stackoverflow", "docs", "vercel", "netlify", "npm"]
  },
  {
    id: "work",
    label: "Work",
    color: "orange",
    keywords: ["notion", "confluence", "jira", "asana", "trello", "figma", "miro", "slack"]
  },
  {
    id: "research",
    label: "Research",
    color: "cyan",
    keywords: ["arxiv", "scholar", "paper", "journal", "ieee", "acm"]
  },
  {
    id: "news",
    label: "News",
    color: "yellow",
    keywords: ["news", "times", "bbc", "cnn", "post", "hacker news"]
  },
  {
    id: "social",
    label: "Social",
    color: "pink",
    keywords: ["x.com", "twitter", "instagram", "facebook", "linkedin", "reddit"]
  },
  {
    id: "video",
    label: "Video",
    color: "red",
    keywords: ["youtube", "netflix", "twitch", "vimeo"]
  },
  {
    id: "shopping",
    label: "Shopping",
    color: "green",
    keywords: ["amazon", "coupang", "ebay", "aliexpress", "shopping"]
  },
  {
    id: "finance",
    label: "Finance",
    color: "grey",
    keywords: ["bank", "invest", "trading", "coinbase", "finance"]
  }
];

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  const merged = mergeSettings(DEFAULT_SETTINGS, existing);
  await chrome.storage.sync.set(merged);
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "group-similar-tabs") {
    return;
  }

  const currentWindow = await chrome.windows.getCurrent();
  await groupTabs(currentWindow.id, "command", null);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "GROUP_SIMILAR_TABS") {
    return;
  }

  const fallbackWindowId = sender?.tab?.windowId;
  const windowId = message.windowId ?? fallbackWindowId;
  if (!Number.isInteger(windowId)) {
    sendResponse({
      ok: false,
      error: "Could not resolve target window."
    });
    return;
  }

  const modeOverride = normalizeGroupingMode(message.mode);
  groupTabs(windowId, message.source || "message", modeOverride)
    .then((result) => sendResponse(result))
    .catch((error) =>
      sendResponse({
        ok: false,
        error: error?.message || "Unknown error"
      })
    );

  return true;
});

async function groupTabs(windowId, source, modeOverride) {
  const settings = await loadSettings();
  const mode = normalizeGroupingMode(modeOverride || settings.groupingMode) || "ai";
  const guardRules = parseGroupGuardRules(settings.groupGuardRulesText);
  const aiCategories = parseAiCategories(settings.aiCategoriesText);
  const tabs = await chrome.tabs.query({ windowId });

  if (tabs.length < 2) {
    return {
      ok: true,
      source,
      mode,
      grouped: 0,
      totalTabs: tabs.length,
      groupCount: 0,
      message: "Need at least 2 tabs to group."
    };
  }

  const tabIds = tabs.map((tab) => tab.id).filter(Number.isInteger);
  await ungroupAll(tabIds);

  const ruleMatches = indexRuleMatchesByTabId(tabs, guardRules);
  const buckets =
    mode === "domain"
      ? buildDomainBuckets(tabs, ruleMatches)
      : buildAiBuckets(tabs, ruleMatches, aiCategories, settings.filterOutRuleMatchedTabs);

  const { groupedCount, createdGroupCount } = await createTabGroups(windowId, buckets, settings.groupSinglesAsOthers);
  const modeLabel = mode === "domain" ? "Domain" : "AI";

  return {
    ok: true,
    source,
    mode,
    grouped: groupedCount,
    totalTabs: tabs.length,
    groupCount: createdGroupCount,
    message:
      groupedCount > 0
        ? `${modeLabel} grouped ${groupedCount} tabs into ${createdGroupCount} groups.`
        : `${modeLabel} mode found no group candidates.`
  };
}

function buildDomainBuckets(tabs, ruleMatches) {
  const buckets = new Map();

  for (const tab of tabs) {
    if (!Number.isInteger(tab.id)) {
      continue;
    }

    const ruleMatch = ruleMatches.get(tab.id);
    const category = ruleMatch || buildDomainCategory(tab);
    pushToBucket(buckets, category, tab.id);
  }

  return buckets;
}

function buildAiBuckets(tabs, ruleMatches, aiCategories, filterOutRuleMatchedTabs) {
  const buckets = new Map();

  for (const tab of tabs) {
    if (!Number.isInteger(tab.id)) {
      continue;
    }

    const ruleMatch = ruleMatches.get(tab.id);
    if (ruleMatch && filterOutRuleMatchedTabs) {
      pushToBucket(buckets, ruleMatch, tab.id);
      continue;
    }

    const aiCategory = detectAiCategory(tab, aiCategories);
    const category = aiCategory || buildDomainCategory(tab);
    pushToBucket(buckets, category, tab.id);
  }

  return buckets;
}

function detectAiCategory(tab, aiCategories) {
  const corpus = buildCorpus(tab);
  if (!corpus) {
    return null;
  }

  let bestCategory = null;
  let bestScore = 0;

  for (const category of aiCategories) {
    const score = scoreCategory(corpus, category.keywords);
    if (score > bestScore) {
      bestCategory = category;
      bestScore = score;
    }
  }

  if (!bestCategory || bestScore <= 0) {
    return null;
  }

  return {
    id: bestCategory.id,
    label: bestCategory.label,
    color: bestCategory.color
  };
}

function scoreCategory(corpus, keywords) {
  let score = 0;
  for (const rawKeyword of keywords) {
    const keyword = String(rawKeyword || "").trim().toLowerCase();
    if (!keyword) {
      continue;
    }

    if (corpus.includes(keyword)) {
      score += keyword.includes(".") || keyword.includes("/") ? 3 : 2;
      continue;
    }

    const normalizedKeyword = keyword.replace(/[^a-z0-9]+/g, " ").trim();
    if (normalizedKeyword && corpus.includes(normalizedKeyword)) {
      score += 1;
    }
  }
  return score;
}

function buildCorpus(tab) {
  const title = String(tab.title || "").toLowerCase();
  const parsed = safeParseUrl(tab.url);
  const host = String(parsed?.hostname || "").toLowerCase();
  const path = String(parsed?.pathname || "").toLowerCase();
  const query = String(parsed?.search || "").toLowerCase();
  return `${host} ${path} ${query} ${title}`.trim();
}

function buildDomainCategory(tab) {
  const parsed = safeParseUrl(tab.url);
  const host = String(parsed?.hostname || "").toLowerCase();
  const registrable = getRegistrableDomain(host);
  const label = registrable || "Unsorted";
  return {
    id: `domain:${label}`,
    label,
    color: pickColorFromSeed(label)
  };
}

function getRegistrableDomain(hostname) {
  if (!hostname) {
    return "";
  }

  const clean = hostname.replace(/^www\./, "");
  const parts = clean.split(".").filter(Boolean);
  if (parts.length <= 1) {
    return clean;
  }

  const secondLevelSet = new Set(["co", "com", "net", "org", "gov", "ac"]);
  if (parts.length >= 3) {
    const top = parts[parts.length - 1];
    const second = parts[parts.length - 2];
    if (top.length === 2 && secondLevelSet.has(second)) {
      return `${parts[parts.length - 3]}.${second}.${top}`;
    }
  }

  return `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
}

function indexRuleMatchesByTabId(tabs, guardRules) {
  const byTab = new Map();

  for (const tab of tabs) {
    if (!Number.isInteger(tab.id)) {
      continue;
    }
    const url = String(tab.url || "");
    const match = findFirstMatchingRule(url, guardRules);
    if (match) {
      byTab.set(tab.id, match);
    }
  }

  return byTab;
}

function findFirstMatchingRule(url, guardRules) {
  if (!url) {
    return null;
  }

  for (const rule of guardRules) {
    if (rule.compiledPatterns.some((regex) => regex.test(url))) {
      return {
        id: rule.id,
        label: rule.label,
        color: rule.color
      };
    }
  }
  return null;
}

function parseGroupGuardRules(text) {
  const lines = String(text || "").split(/\r?\n/);
  const rules = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const [labelRaw, patternsRaw, colorRaw] = line.split("|").map((value) => String(value || "").trim());
    const label = labelRaw;
    const rawPatterns = String(patternsRaw || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (!label || rawPatterns.length === 0) {
      continue;
    }

    const compiledPatterns = rawPatterns
      .map((rawPattern) => compileRulePattern(rawPattern))
      .filter((regex) => regex instanceof RegExp);

    if (compiledPatterns.length === 0) {
      continue;
    }

    rules.push({
      id: `guard:${slugify(label)}:${index}`,
      label,
      color: normalizeColor(colorRaw) || pickColorFromSeed(label),
      compiledPatterns
    });
  }

  return rules;
}

function compileRulePattern(rawPattern) {
  const pattern = String(rawPattern || "").trim();
  if (!pattern) {
    return null;
  }

  const matchPatternRegex = compileChromeMatchPattern(pattern);
  if (matchPatternRegex) {
    return matchPatternRegex;
  }

  return compileGlobPattern(pattern);
}

function compileChromeMatchPattern(pattern) {
  const match = pattern.match(/^(\*|https?|file|ftp):\/\/([^/]*)?(\/.*)$/i);
  if (!match) {
    return null;
  }

  const scheme = match[1].toLowerCase();
  const host = String(match[2] || "").toLowerCase();
  const path = match[3];

  const schemePart = scheme === "*" ? "(?:http|https)" : escapeRegex(scheme);
  const pathPart = wildcardToRegex(path);

  let hostPart = "";
  if (scheme === "file") {
    hostPart = host === "*" ? "[^/]*" : escapeRegex(host);
  } else if (host === "*") {
    hostPart = "[^/]+";
  } else if (host.startsWith("*.")) {
    const bare = escapeRegex(host.slice(2));
    hostPart = `(?:[^/.]+\\.)*${bare}`;
  } else if (host) {
    hostPart = escapeRegex(host);
  } else {
    return null;
  }

  return new RegExp(`^${schemePart}:\\/\\/${hostPart}${pathPart}$`, "i");
}

function compileGlobPattern(pattern) {
  if (!pattern.includes("*")) {
    const escaped = escapeRegex(pattern);
    return new RegExp(escaped, "i");
  }
  return new RegExp(wildcardToRegex(pattern), "i");
}

function wildcardToRegex(value) {
  return escapeRegex(String(value || "")).replace(/\\\*/g, ".*");
}

function parseAiCategories(text) {
  const lines = String(text || "").split(/\r?\n/);
  const categories = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const [labelRaw, keywordsRaw, colorRaw] = line.split("|").map((value) => String(value || "").trim());
    const label = labelRaw;
    const keywords = String(keywordsRaw || "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    if (!label || keywords.length === 0) {
      continue;
    }

    categories.push({
      id: `ai-custom:${slugify(label)}:${index}`,
      label,
      color: normalizeColor(colorRaw) || pickColorFromSeed(label),
      keywords
    });
  }

  if (!categories.length) {
    return BUILTIN_AI_CATEGORIES;
  }

  return categories;
}

function pushToBucket(buckets, category, tabId) {
  if (!buckets.has(category.id)) {
    buckets.set(category.id, {
      ...category,
      tabIds: []
    });
  }
  buckets.get(category.id).tabIds.push(tabId);
}

async function createTabGroups(windowId, buckets, groupSinglesAsOthers) {
  const groupsToCreate = [];
  const singles = [];

  for (const bucket of buckets.values()) {
    if (bucket.tabIds.length >= 2) {
      groupsToCreate.push(bucket);
    } else {
      singles.push(...bucket.tabIds);
    }
  }

  if (groupSinglesAsOthers && singles.length >= 2) {
    groupsToCreate.push({
      id: "others",
      label: "Others",
      color: "grey",
      tabIds: singles
    });
  }

  groupsToCreate.sort((a, b) => b.tabIds.length - a.tabIds.length);

  let groupedCount = 0;
  let createdGroupCount = 0;

  for (const groupData of groupsToCreate) {
    try {
      const groupId = await chrome.tabs.group({
        createProperties: { windowId },
        tabIds: groupData.tabIds
      });

      await chrome.tabGroups.update(groupId, {
        title: groupData.label,
        color: groupData.color
      });

      groupedCount += groupData.tabIds.length;
      createdGroupCount += 1;
    } catch (_error) {
      // Skip invalid groups and continue processing remaining groups.
    }
  }

  return { groupedCount, createdGroupCount };
}

async function ungroupAll(tabIds) {
  if (!tabIds.length) {
    return;
  }

  try {
    await chrome.tabs.ungroup(tabIds);
  } catch (_error) {
    // Ignore when there are no grouped tabs.
  }
}

function safeParseUrl(value) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value);
  } catch (_error) {
    return null;
  }
}

async function loadSettings() {
  const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  return mergeSettings(DEFAULT_SETTINGS, stored);
}

function normalizeGroupingMode(mode) {
  const normalized = String(mode || "").trim().toLowerCase();
  if (!normalized) {
    return "";
  }
  return normalized === "domain" ? "domain" : "ai";
}

function normalizeColor(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) {
    return "";
  }
  return TAB_GROUP_COLORS.includes(normalized) ? normalized : "";
}

function pickColorFromSeed(seed) {
  const normalized = String(seed || "seed");
  let hash = 0;
  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash * 31 + normalized.charCodeAt(index)) >>> 0;
  }
  return TAB_GROUP_COLORS[hash % TAB_GROUP_COLORS.length];
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
