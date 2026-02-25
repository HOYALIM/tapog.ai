"use strict";

const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const BACKGROUND_PATH = path.resolve(__dirname, "../src/background.js");
const BACKGROUND_CODE = fs.readFileSync(BACKGROUND_PATH, "utf8");

function createHarness(options = {}) {
  const state = {
    tabs: cloneArray(options.tabs || defaultTabs()),
    groups: cloneArray(options.groups || []),
    syncStore: { ...(options.syncStore || {}) },
    localStore: { ...(options.localStore || {}) },
    nextGroupId: Number.isInteger(options.nextGroupId) ? options.nextGroupId : 100,
    localSetThrows: Boolean(options.localSetThrows)
  };

  normalizeTabState(state.tabs);
  pruneEmptyGroups(state);

  const runtimeListeners = [];
  const commandListeners = [];

  const chrome = {
    runtime: {
      onInstalled: { addListener() {} },
      onMessage: {
        addListener(listener) {
          runtimeListeners.push(listener);
        }
      }
    },
    commands: {
      onCommand: {
        addListener(listener) {
          commandListeners.push(listener);
        }
      }
    },
    windows: {
      async getCurrent() {
        return { id: 1 };
      }
    },
    storage: {
      sync: {
        async get(keys) {
          return resolveStoreGet(state.syncStore, keys);
        },
        async set(values) {
          Object.assign(state.syncStore, values || {});
        }
      },
      local: {
        async get(keys) {
          return resolveStoreGet(state.localStore, keys);
        },
        async set(values) {
          if (state.localSetThrows) {
            throw new Error("local set failed");
          }
          Object.assign(state.localStore, values || {});
        },
        async remove(keys) {
          for (const key of normalizeToKeyArray(keys)) {
            delete state.localStore[key];
          }
        }
      }
    },
    tabs: {
      async query(queryInfo = {}) {
        return state.tabs
          .filter((tab) => (Number.isInteger(queryInfo.windowId) ? tab.windowId === queryInfo.windowId : true))
          .sort((a, b) => a.index - b.index)
          .map((tab) => ({ ...tab }));
      },
      async update(tabId, updateProperties) {
        const tab = findTab(state, tabId);
        if (!tab) {
          throw new Error(`Tab not found: ${tabId}`);
        }

        if (Object.prototype.hasOwnProperty.call(updateProperties || {}, "pinned")) {
          tab.pinned = Boolean(updateProperties.pinned);
        }

        return { ...tab };
      },
      async move(tabId, moveProperties) {
        const idx = state.tabs.findIndex((tab) => tab.id === tabId);
        if (idx < 0) {
          throw new Error(`Tab not found: ${tabId}`);
        }

        const [tab] = state.tabs.splice(idx, 1);
        const upper = Math.max(0, state.tabs.length);
        const targetIndex = clampNumber(moveProperties?.index, 0, upper);
        state.tabs.splice(targetIndex, 0, tab);
        normalizeTabState(state.tabs);

        return { ...tab };
      },
      async ungroup(tabIds) {
        const idSet = new Set(normalizeToNumberArray(tabIds));
        for (const tab of state.tabs) {
          if (idSet.has(tab.id)) {
            tab.groupId = -1;
          }
        }
        pruneEmptyGroups(state);
      },
      async group(groupOptions) {
        const tabIds = normalizeToNumberArray(groupOptions?.tabIds);
        if (!tabIds.length) {
          throw new Error("No tab ids to group");
        }

        const windowId = Number(groupOptions?.createProperties?.windowId) || 1;
        const newGroupId = state.nextGroupId;
        state.nextGroupId += 1;

        for (const tabId of tabIds) {
          const tab = findTab(state, tabId);
          if (!tab) {
            continue;
          }
          tab.windowId = windowId;
          tab.groupId = newGroupId;
        }

        state.groups.push({
          id: newGroupId,
          windowId,
          title: "",
          color: "grey",
          collapsed: false
        });
        pruneEmptyGroups(state);
        return newGroupId;
      }
    },
    tabGroups: {
      async query(queryInfo = {}) {
        return state.groups
          .filter((group) => (Number.isInteger(queryInfo.windowId) ? group.windowId === queryInfo.windowId : true))
          .map((group) => ({ ...group }));
      },
      async update(groupId, updateProperties) {
        const group = state.groups.find((entry) => entry.id === groupId);
        if (!group) {
          throw new Error(`Group not found: ${groupId}`);
        }
        Object.assign(group, updateProperties || {});
        return { ...group };
      }
    }
  };

  const context = {
    chrome,
    console,
    URL,
    RegExp,
    Map,
    Set,
    String,
    Number,
    Boolean,
    Math,
    Date,
    Object,
    Array,
    Promise
  };

  vm.createContext(context);
  vm.runInContext(BACKGROUND_CODE, context, { filename: "background.js" });

  return { context, chrome, state, runtimeListeners, commandListeners };
}

function cloneArray(value) {
  return JSON.parse(JSON.stringify(value));
}

function defaultTabs() {
  return [
    tab(1, 0, "https://example.com/a", "Example A"),
    tab(2, 1, "https://example.com/b", "Example B")
  ];
}

function tab(id, index, url, title, extra = {}) {
  return {
    id,
    index,
    url,
    title,
    pinned: false,
    groupId: -1,
    windowId: 1,
    ...extra
  };
}

function findTab(state, tabId) {
  return state.tabs.find((entry) => entry.id === tabId) || null;
}

function normalizeTabState(tabs) {
  tabs.sort((a, b) => a.index - b.index);
  tabs.forEach((entry, idx) => {
    entry.index = idx;
    if (!Number.isInteger(entry.groupId)) {
      entry.groupId = -1;
    }
    if (!Number.isInteger(entry.windowId)) {
      entry.windowId = 1;
    }
    entry.pinned = Boolean(entry.pinned);
  });
}

function pruneEmptyGroups(state) {
  const liveGroupIds = new Set(state.tabs.filter((tabEntry) => tabEntry.groupId >= 0).map((tabEntry) => tabEntry.groupId));
  state.groups = state.groups.filter((entry) => liveGroupIds.has(entry.id));
}

function resolveStoreGet(store, keys) {
  if (keys === undefined || keys === null) {
    return { ...store };
  }
  if (typeof keys === "string") {
    return { [keys]: store[keys] };
  }
  if (Array.isArray(keys)) {
    const out = {};
    for (const key of keys) {
      out[key] = store[key];
    }
    return out;
  }
  if (typeof keys === "object") {
    const out = { ...keys };
    for (const key of Object.keys(keys)) {
      if (Object.prototype.hasOwnProperty.call(store, key)) {
        out[key] = store[key];
      }
    }
    return out;
  }
  return {};
}

function normalizeToNumberArray(value) {
  if (Array.isArray(value)) {
    return value.filter(Number.isInteger);
  }
  if (Number.isInteger(value)) {
    return [value];
  }
  return [];
}

function normalizeToKeyArray(keys) {
  if (Array.isArray(keys)) {
    return keys;
  }
  if (typeof keys === "string") {
    return [keys];
  }
  return [];
}

function clampNumber(value, min, max) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return min;
  }
  return Math.max(min, Math.min(max, Math.round(numeric)));
}

async function testAiCategoryCoverage() {
  const { context } = createHarness();
  const categories = context.parseAiCategories("");

  const cases = [
    { url: "https://platform.openai.com/docs", title: "OpenAI docs", expected: "AI" },
    { url: "https://github.com/openai/openai-node", title: "Repo", expected: "Dev" },
    { url: "https://console.aws.amazon.com/ec2/home", title: "AWS Console", expected: "Cloud" },
    { url: "https://www.figma.com/file/123/Product", title: "Design file", expected: "Design" },
    { url: "https://mail.google.com/mail/u/0/#inbox", title: "Inbox", expected: "Comms" },
    { url: "https://www.coursera.org/learn/llm", title: "Course", expected: "Learning" },
    { url: "https://www.producthunt.com/posts/tapog-ai", title: "Launch post", expected: "Marketing" },
    { url: "https://www.booking.com/hotel/us/sample.html", title: "Hotel", expected: "Travel" }
  ];

  for (const testCase of cases) {
    const result = context.detectAiCategory({ url: testCase.url, title: testCase.title }, categories);
    assert.ok(result, `expected category for ${testCase.url}`);
    assert.equal(result.label, testCase.expected, `unexpected category for ${testCase.url}`);
  }
}

async function testCustomCategoriesMergeWithBuiltins() {
  const { context } = createHarness();
  const customText = "Security|host:cloudflare.com,incident,response|red";
  const categories = context.parseAiCategories(customText);

  const security = context.detectAiCategory(
    { url: "https://dash.cloudflare.com/abc/security", title: "Incident response" },
    categories
  );
  assert.ok(security, "expected security match");
  assert.equal(security.label, "Security");

  const stillBuiltIn = context.detectAiCategory(
    { url: "https://github.com/HOYALIM/tapog.ai", title: "pull request" },
    categories
  );
  assert.ok(stillBuiltIn, "expected built-in category to remain");
  assert.equal(stillBuiltIn.label, "Dev");
}

async function testUndoRestoresPreviousStateAndPreservesUnrelatedGroups() {
  const initialTabs = [
    tab(1, 0, "https://github.com", "GitHub", { groupId: 10 }),
    tab(2, 1, "https://docs.github.com", "Docs", { groupId: 10 }),
    tab(3, 2, "https://news.ycombinator.com", "HN", { groupId: -1 })
  ];

  const initialGroups = [{ id: 10, windowId: 1, title: "Dev", color: "blue", collapsed: true }];
  const { context, chrome, state } = createHarness({ tabs: initialTabs, groups: initialGroups, nextGroupId: 40 });

  const tabsBefore = await chrome.tabs.query({ windowId: 1 });
  const snapshot = await context.captureWindowSnapshot(1, tabsBefore);
  await context.saveLastGroupingSnapshot(snapshot);

  await chrome.tabs.ungroup([1, 2, 3]);
  const tempGroup = await chrome.tabs.group({
    createProperties: { windowId: 1 },
    tabIds: [1, 3]
  });
  await chrome.tabGroups.update(tempGroup, { title: "Mixed", color: "purple", collapsed: false });

  state.tabs.push(tab(9, 3, "https://example.com/new", "New tab"));
  normalizeTabState(state.tabs);
  const unrelatedGroupId = await chrome.tabs.group({
    createProperties: { windowId: 1 },
    tabIds: [9]
  });
  await chrome.tabGroups.update(unrelatedGroupId, { title: "KeepMe", color: "green", collapsed: false });

  const result = await context.restoreLastGrouping(1, "test");
  assert.equal(result.ok, true, "expected undo to succeed");

  const tabsAfter = await chrome.tabs.query({ windowId: 1 });
  const tab1 = tabsAfter.find((entry) => entry.id === 1);
  const tab2 = tabsAfter.find((entry) => entry.id === 2);
  const tab3 = tabsAfter.find((entry) => entry.id === 3);
  const tab9 = tabsAfter.find((entry) => entry.id === 9);

  assert.ok(tab1 && tab2 && tab3 && tab9, "expected all tabs to remain");
  assert.equal(tab1.groupId, tab2.groupId, "snapshot pair should be regrouped together");
  assert.notEqual(tab1.groupId, -1, "snapshot group should exist");
  assert.equal(tab3.groupId, -1, "ungrouped snapshot tab should remain ungrouped");
  assert.equal(tab9.groupId, unrelatedGroupId, "non-snapshot tab group should be preserved");

  const groupsAfter = await chrome.tabGroups.query({ windowId: 1 });
  const restoredGroup = groupsAfter.find((entry) => entry.id === tab1.groupId);
  assert.ok(restoredGroup, "restored group metadata should exist");
  assert.equal(restoredGroup.title, "Dev");
  assert.equal(restoredGroup.color, "blue");
  assert.equal(restoredGroup.collapsed, true);

  const unrelatedGroup = groupsAfter.find((entry) => entry.id === unrelatedGroupId);
  assert.ok(unrelatedGroup, "unrelated group should still exist");
  assert.equal(unrelatedGroup.title, "KeepMe");
}

async function testUndoWithoutSnapshotFailsCleanly() {
  const { context } = createHarness();
  const result = await context.restoreLastGrouping(1, "test");
  assert.equal(result.ok, false);
  assert.match(result.error, /No previous grouping snapshot/i);
}

async function testGroupingContinuesWhenSnapshotSaveFails() {
  const tabs = [
    tab(1, 0, "https://platform.openai.com/docs", "OpenAI Docs"),
    tab(2, 1, "https://github.com/openai/openai-node", "GitHub Repo"),
    tab(3, 2, "https://www.nytimes.com", "News")
  ];

  const { context, state } = createHarness({ tabs, localSetThrows: true });
  const result = await context.groupTabs(1, "test", "ai");

  assert.equal(result.ok, true, "grouping should succeed even if snapshot save fails");
  assert.equal(state.localStore.lastGroupingSnapshot, undefined, "snapshot should not be persisted when set fails");
}

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`PASS ${name}`);
    return true;
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error?.stack || error);
    return false;
  }
}

async function main() {
  const testPlan = [
    ["AI category coverage", testAiCategoryCoverage],
    ["Custom categories merge with built-ins", testCustomCategoriesMergeWithBuiltins],
    ["Undo restores previous state and preserves unrelated groups", testUndoRestoresPreviousStateAndPreservesUnrelatedGroups],
    ["Undo without snapshot fails cleanly", testUndoWithoutSnapshotFailsCleanly],
    ["Grouping continues when snapshot save fails", testGroupingContinuesWhenSnapshotSaveFails]
  ];

  let passed = 0;
  for (const [name, fn] of testPlan) {
    const ok = await runTest(name, fn);
    if (ok) {
      passed += 1;
    }
  }

  const failed = testPlan.length - passed;
  console.log(`RESULT ${passed} passed / ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error?.stack || error);
  process.exit(1);
});
