const TAB_GROUP_COLORS = ["grey", "blue", "red", "yellow", "green", "pink", "purple", "cyan", "orange"];
const GROUPING_SNAPSHOT_KEY = "lastGroupingSnapshot";
const SECOND_LEVEL_DOMAIN_PARTS = new Set(["co", "com", "net", "org", "gov", "ac"]);

const AI_MIN_SCORE = 4;
const AI_SCORE_MARGIN = 2;

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
    hostPatterns: [
      "openai.com",
      "chat.openai.com",
      "claude.ai",
      "anthropic.com",
      "gemini.google.com",
      "perplexity.ai",
      "huggingface.co",
      "replicate.com",
      "midjourney.com",
      "poe.com"
    ],
    keywords: [
      "llm",
      "prompt",
      "embedding",
      "inference",
      "rag",
      "agent",
      "fine-tuning",
      "foundation model"
    ]
  },
  {
    id: "dev",
    label: "Dev",
    color: "blue",
    hostPatterns: [
      "github.com",
      "gitlab.com",
      "bitbucket.org",
      "stackoverflow.com",
      "dev.to",
      "npmjs.com",
      "pypi.org",
      "docs.rs",
      "go.dev",
      "developer.mozilla.org"
    ],
    keywords: [
      "repository",
      "pull request",
      "commit",
      "build",
      "deploy",
      "package",
      "sdk",
      "api reference",
      "bug",
      "issue"
    ]
  },
  {
    id: "cloud",
    label: "Cloud",
    color: "cyan",
    hostPatterns: [
      "aws.amazon.com",
      "console.cloud.google.com",
      "portal.azure.com",
      "cloudflare.com",
      "vercel.com",
      "netlify.com",
      "render.com",
      "railway.app",
      "digitalocean.com",
      "fly.io"
    ],
    keywords: [
      "kubernetes",
      "lambda",
      "serverless",
      "container",
      "dns",
      "cdn",
      "hosting",
      "infrastructure"
    ]
  },
  {
    id: "work",
    label: "Work",
    color: "orange",
    hostPatterns: [
      "notion.so",
      "atlassian.net",
      "asana.com",
      "clickup.com",
      "monday.com",
      "airtable.com",
      "coda.io",
      "linear.app",
      "trello.com",
      "basecamp.com"
    ],
    keywords: ["task", "roadmap", "project", "sprint", "backlog", "kanban", "timeline", "planning"]
  },
  {
    id: "docs",
    label: "Docs",
    color: "yellow",
    hostPatterns: [
      "docs.google.com",
      "drive.google.com",
      "confluence",
      "readthedocs.io",
      "wikipedia.org",
      "gitbook.io",
      "notion.site"
    ],
    keywords: ["documentation", "guide", "manual", "spec", "how to", "reference", "checklist", "playbook"]
  },
  {
    id: "design",
    label: "Design",
    color: "pink",
    hostPatterns: [
      "figma.com",
      "miro.com",
      "canva.com",
      "dribbble.com",
      "behance.net",
      "framer.com",
      "invisionapp.com"
    ],
    keywords: ["prototype", "wireframe", "ui", "ux", "design system", "mockup", "component"]
  },
  {
    id: "communication",
    label: "Comms",
    color: "green",
    hostPatterns: [
      "mail.google.com",
      "gmail.com",
      "outlook.live.com",
      "slack.com",
      "discord.com",
      "teams.microsoft.com",
      "zoom.us"
    ],
    keywords: ["inbox", "email", "message", "meeting", "calendar", "thread", "notification", "chat"]
  },
  {
    id: "research",
    label: "Research",
    color: "cyan",
    hostPatterns: [
      "arxiv.org",
      "scholar.google.com",
      "paperswithcode.com",
      "researchgate.net",
      "pubmed.ncbi.nlm.nih.gov",
      "openreview.net"
    ],
    keywords: ["paper", "journal", "dataset", "benchmark", "method", "citation", "experiment", "study"]
  },
  {
    id: "learning",
    label: "Learning",
    color: "orange",
    hostPatterns: [
      "coursera.org",
      "udemy.com",
      "edx.org",
      "khanacademy.org",
      "pluralsight.com",
      "leetcode.com",
      "frontendmasters.com"
    ],
    keywords: ["course", "tutorial", "lesson", "bootcamp", "practice", "exercise", "training"]
  },
  {
    id: "news",
    label: "News",
    color: "yellow",
    hostPatterns: [
      "nytimes.com",
      "bbc.com",
      "cnn.com",
      "reuters.com",
      "wsj.com",
      "theguardian.com",
      "bloomberg.com",
      "news.ycombinator.com"
    ],
    keywords: ["breaking", "headline", "opinion", "report", "newsletter", "politics", "economy"]
  },
  {
    id: "social",
    label: "Social",
    color: "pink",
    hostPatterns: [
      "x.com",
      "twitter.com",
      "instagram.com",
      "facebook.com",
      "linkedin.com",
      "reddit.com",
      "threads.net",
      "tiktok.com"
    ],
    keywords: ["feed", "post", "comment", "community", "profile", "followers", "trend"]
  },
  {
    id: "video",
    label: "Video",
    color: "red",
    hostPatterns: [
      "youtube.com",
      "youtu.be",
      "netflix.com",
      "twitch.tv",
      "vimeo.com",
      "disneyplus.com",
      "primevideo.com"
    ],
    keywords: ["watch", "stream", "playlist", "channel", "episode", "trailer", "live"]
  },
  {
    id: "shopping",
    label: "Shopping",
    color: "green",
    hostPatterns: [
      "amazon.com",
      "ebay.com",
      "aliexpress.com",
      "etsy.com",
      "walmart.com",
      "target.com",
      "coupang.com"
    ],
    keywords: ["buy", "price", "deal", "product", "cart", "checkout", "review"]
  },
  {
    id: "finance",
    label: "Finance",
    color: "grey",
    hostPatterns: [
      "coinbase.com",
      "binance.com",
      "upbit.com",
      "tradingview.com",
      "investing.com",
      "finance.yahoo.com",
      "fidelity.com",
      "schwab.com"
    ],
    keywords: ["stock", "crypto", "portfolio", "market", "trade", "yield", "etf", "budget"]
  },
  {
    id: "marketing",
    label: "Marketing",
    color: "orange",
    hostPatterns: [
      "producthunt.com",
      "hubspot.com",
      "mailchimp.com",
      "ahrefs.com",
      "semrush.com",
      "analytics.google.com"
    ],
    keywords: ["seo", "campaign", "growth", "acquisition", "funnel", "conversion", "retention"]
  },
  {
    id: "travel",
    label: "Travel",
    color: "blue",
    hostPatterns: [
      "maps.google.com",
      "booking.com",
      "airbnb.com",
      "tripadvisor.com",
      "skyscanner.com",
      "kayak.com"
    ],
    keywords: ["flight", "hotel", "map", "path:/maps", "route", "trip", "reservation", "itinerary"]
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
  const messageType = String(message?.type || "");
  if (!messageType) {
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

  if (messageType === "GROUP_SIMILAR_TABS") {
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
  }

  if (messageType === "UNDO_LAST_GROUPING") {
    restoreLastGrouping(windowId, message.source || "message")
      .then((result) => sendResponse(result))
      .catch((error) =>
        sendResponse({
          ok: false,
          error: error?.message || "Unknown error"
        })
      );

    return true;
  }
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

  try {
    const snapshot = await captureWindowSnapshot(windowId, tabs);
    await saveLastGroupingSnapshot(snapshot);
  } catch (_error) {
    // Grouping should continue even if snapshot persistence fails.
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
  const tabMeta = buildTabMeta(tab);
  if (!tabMeta.corpus) {
    return null;
  }

  let best = null;
  let second = null;

  for (const category of aiCategories) {
    const score = scoreCategory(tabMeta, category);
    if (!best || score > best.score) {
      second = best;
      best = { category, score };
    } else if (!second || score > second.score) {
      second = { category, score };
    }
  }

  if (!best || best.score < AI_MIN_SCORE) {
    return null;
  }

  if (second && second.score > 0 && best.score - second.score < AI_SCORE_MARGIN && best.score < 11) {
    return null;
  }

  return {
    id: best.category.id,
    label: best.category.label,
    color: best.category.color
  };
}

function scoreCategory(tabMeta, category) {
  let score = 0;

  for (const hostPattern of category.hostPatterns || []) {
    if (!hostPattern) {
      continue;
    }

    if (matchesHostPattern(tabMeta.host, hostPattern)) {
      score += hostPattern.startsWith("*.") ? 8 : 10;

      const cleaned = hostPattern.replace(/^\*\./, "");
      const patternDomain = getRegistrableDomain(cleaned);
      if (patternDomain && patternDomain === tabMeta.registrableDomain) {
        score += 3;
      }
    }
  }

  for (const rawKeyword of category.keywords || []) {
    const keyword = normalizeKeywordToken(rawKeyword);
    if (!keyword) {
      continue;
    }

    if (keyword.startsWith("host:")) {
      const hostPattern = keyword.slice(5).trim();
      if (hostPattern && matchesHostPattern(tabMeta.host, hostPattern)) {
        score += 8;
      }
      continue;
    }

    if (keyword.startsWith("title:")) {
      const titleToken = keyword.slice(6).trim();
      if (titleToken && includesText(tabMeta.title, titleToken)) {
        score += 4;
      }
      continue;
    }

    if (keyword.startsWith("path:")) {
      const pathToken = keyword.slice(5).trim();
      if (pathToken && includesText(`${tabMeta.path} ${tabMeta.query}`, pathToken)) {
        score += 3;
      }
      continue;
    }

    score += scoreGenericKeyword(tabMeta, keyword);
  }

  return score;
}

function scoreGenericKeyword(tabMeta, keyword) {
  let keywordScore = 0;

  if (includesText(tabMeta.title, keyword)) {
    keywordScore = Math.max(keywordScore, 4);
  }
  if (includesText(tabMeta.host, keyword)) {
    keywordScore = Math.max(keywordScore, 3);
  }
  if (includesText(tabMeta.path, keyword) || includesText(tabMeta.query, keyword)) {
    keywordScore = Math.max(keywordScore, 3);
  }
  if (includesText(tabMeta.corpus, keyword)) {
    keywordScore = Math.max(keywordScore, 2);
  }

  return keywordScore;
}

function buildTabMeta(tab) {
  const parsed = safeParseUrl(tab.url);
  const host = String(parsed?.hostname || "").toLowerCase();
  const path = String(parsed?.pathname || "").toLowerCase();
  const query = String(parsed?.search || "").toLowerCase();
  const title = String(tab.title || "").toLowerCase();
  const registrableDomain = getRegistrableDomain(host);

  const corpus = [host, registrableDomain, path, query, title].filter(Boolean).join(" ").trim();

  return {
    host,
    path,
    query,
    title,
    registrableDomain,
    corpus
  };
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

  if (parts.length >= 3) {
    const top = parts[parts.length - 1];
    const second = parts[parts.length - 2];
    if (top.length === 2 && SECOND_LEVEL_DOMAIN_PARTS.has(second)) {
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
  const customCategories = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const [labelRaw, keywordsRaw, colorRaw] = line.split("|").map((value) => String(value || "").trim());
    const label = labelRaw;
    const tokens = String(keywordsRaw || "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    if (!label || tokens.length === 0) {
      continue;
    }

    const hostPatterns = [];
    const keywords = [];

    for (const token of tokens) {
      if (token.startsWith("host:") || token.startsWith("domain:")) {
        const pattern = token.split(":").slice(1).join(":").trim();
        if (pattern) {
          hostPatterns.push(pattern);
        }
        continue;
      }

      if (looksLikeHostToken(token)) {
        hostPatterns.push(token);
      }

      keywords.push(token);
    }

    customCategories.push({
      id: `ai-custom:${slugify(label)}:${index}`,
      label,
      color: normalizeColor(colorRaw) || pickColorFromSeed(label),
      hostPatterns,
      keywords,
      slug: slugify(label)
    });
  }

  if (!customCategories.length) {
    return BUILTIN_AI_CATEGORIES;
  }

  const customSlugs = new Set(customCategories.map((category) => category.slug));
  const remainingBuiltins = BUILTIN_AI_CATEGORIES.filter((category) => !customSlugs.has(slugify(category.label)));

  return [...customCategories, ...remainingBuiltins];
}

function looksLikeHostToken(token) {
  if (!token || token.includes(" ")) {
    return false;
  }

  if (token.includes("/") || token.includes("?")) {
    return false;
  }

  return token.includes(".");
}

function matchesHostPattern(host, rawPattern) {
  const normalizedHost = String(host || "").toLowerCase();
  const pattern = String(rawPattern || "").trim().toLowerCase();

  if (!normalizedHost || !pattern) {
    return false;
  }

  if (pattern.startsWith("*.")) {
    const base = pattern.slice(2);
    return normalizedHost === base || normalizedHost.endsWith(`.${base}`);
  }

  return normalizedHost === pattern || normalizedHost.endsWith(`.${pattern}`);
}

function includesText(haystack, needle) {
  const source = String(haystack || "").toLowerCase();
  const token = String(needle || "").toLowerCase();
  if (!source || !token) {
    return false;
  }
  return source.includes(token);
}

function normalizeKeywordToken(keyword) {
  return String(keyword || "").trim().toLowerCase();
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

async function captureWindowSnapshot(windowId, existingTabs) {
  const tabs = Array.isArray(existingTabs) ? existingTabs : await chrome.tabs.query({ windowId });

  let groups = [];
  try {
    groups = await chrome.tabGroups.query({ windowId });
  } catch (_error) {
    groups = [];
  }

  return {
    windowId,
    capturedAt: Date.now(),
    tabs: tabs
      .filter((tab) => Number.isInteger(tab.id))
      .map((tab) => ({
        id: tab.id,
        index: Number.isInteger(tab.index) ? tab.index : 0,
        pinned: Boolean(tab.pinned),
        groupId: Number.isInteger(tab.groupId) ? tab.groupId : -1
      })),
    groups: groups
      .filter((group) => Number.isInteger(group.id))
      .map((group) => ({
        id: group.id,
        title: String(group.title || ""),
        color: normalizeColor(group.color) || "grey",
        collapsed: Boolean(group.collapsed)
      }))
  };
}

async function saveLastGroupingSnapshot(snapshot) {
  await chrome.storage.local.set({
    [GROUPING_SNAPSHOT_KEY]: snapshot
  });
}

async function loadLastGroupingSnapshot() {
  const stored = await chrome.storage.local.get(GROUPING_SNAPSHOT_KEY);
  return stored?.[GROUPING_SNAPSHOT_KEY] || null;
}

async function clearLastGroupingSnapshot() {
  await chrome.storage.local.remove(GROUPING_SNAPSHOT_KEY);
}

async function restoreLastGrouping(windowId, source) {
  const snapshot = await loadLastGroupingSnapshot();
  if (!snapshot || !Array.isArray(snapshot.tabs) || snapshot.windowId !== windowId) {
    return {
      ok: false,
      source,
      error: "No previous grouping snapshot found for this window."
    };
  }

  const currentTabs = await chrome.tabs.query({ windowId });
  const currentTabIds = new Set(currentTabs.map((tab) => tab.id).filter(Number.isInteger));
  if (!currentTabIds.size) {
    return {
      ok: false,
      source,
      error: "No tabs available to restore."
    };
  }

  const snapshotTabs = snapshot.tabs.filter((tab) => currentTabIds.has(tab.id));
  if (!snapshotTabs.length) {
    return {
      ok: false,
      source,
      error: "Saved snapshot tabs are no longer available."
    };
  }

  await restorePinnedState(snapshotTabs);
  await restoreTabOrder(snapshotTabs, currentTabs.length);

  const snapshotTabIds = snapshotTabs.map((tab) => tab.id).filter(Number.isInteger);
  await ungroupAll(snapshotTabIds);

  const tabStateByOldGroup = new Map();
  for (const tabState of [...snapshotTabs].sort((a, b) => a.index - b.index)) {
    if (!Number.isInteger(tabState.groupId) || tabState.groupId < 0) {
      continue;
    }

    if (!tabStateByOldGroup.has(tabState.groupId)) {
      tabStateByOldGroup.set(tabState.groupId, []);
    }
    tabStateByOldGroup.get(tabState.groupId).push(tabState.id);
  }

  const groupMetaById = new Map(
    (snapshot.groups || [])
      .filter((group) => Number.isInteger(group.id))
      .map((group) => [group.id, group])
  );

  let restoredTabs = 0;
  let restoredGroups = 0;

  for (const [oldGroupId, tabIds] of tabStateByOldGroup) {
    if (!tabIds.length) {
      continue;
    }

    try {
      const newGroupId = await chrome.tabs.group({
        createProperties: { windowId },
        tabIds
      });

      const oldGroupMeta = groupMetaById.get(oldGroupId);
      if (oldGroupMeta) {
        await chrome.tabGroups.update(newGroupId, {
          title: String(oldGroupMeta.title || ""),
          color: normalizeColor(oldGroupMeta.color) || "grey",
          collapsed: Boolean(oldGroupMeta.collapsed)
        });
      }

      restoredGroups += 1;
      restoredTabs += tabIds.length;
    } catch (_error) {
      // Skip if tabs are no longer groupable and continue.
    }
  }

  await clearLastGroupingSnapshot();

  return {
    ok: true,
    source,
    restoredTabs,
    restoredGroups,
    totalTabs: currentTabs.length,
    message:
      restoredGroups > 0
        ? `Restored previous state: ${restoredTabs} tabs across ${restoredGroups} groups.`
        : "Restored previous state: tabs are ungrouped."
  };
}

async function restorePinnedState(snapshotTabs) {
  for (const tabState of snapshotTabs) {
    try {
      await chrome.tabs.update(tabState.id, { pinned: Boolean(tabState.pinned) });
    } catch (_error) {
      // Ignore tabs that cannot be updated.
    }
  }
}

async function restoreTabOrder(snapshotTabs, totalTabsInWindow) {
  const ordered = [...snapshotTabs].sort((a, b) => a.index - b.index);
  const safeUpperIndex = Math.max(0, Number(totalTabsInWindow || 0) - 1);

  for (const tabState of ordered) {
    try {
      const targetIndex = Math.min(Math.max(0, tabState.index), safeUpperIndex);
      await chrome.tabs.move(tabState.id, { index: targetIndex });
    } catch (_error) {
      // Ignore non-movable tabs.
    }
  }
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
