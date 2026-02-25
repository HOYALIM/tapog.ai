const groupAiButton = document.getElementById("group-ai");
const groupDomainButton = document.getElementById("group-domain");
const undoGroupingButton = document.getElementById("undo-grouping");
const openOptionsButton = document.getElementById("open-options");
const statusText = document.getElementById("status");

groupAiButton.addEventListener("click", async () => {
  await runGrouping("ai");
});

groupDomainButton.addEventListener("click", async () => {
  await runGrouping("domain");
});

undoGroupingButton.addEventListener("click", async () => {
  await runUndo();
});

openOptionsButton.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

async function runGrouping(mode) {
  setStatus("Grouping tabs...");
  setBusy(true);

  try {
    const currentWindow = await chrome.windows.getCurrent();
    const response = await chrome.runtime.sendMessage({
      type: "GROUP_SIMILAR_TABS",
      source: "popup",
      windowId: currentWindow.id,
      mode
    });

    if (!response?.ok) {
      setStatus(`Failed: ${response?.error || "unknown error"}`);
      return;
    }

    setStatus(response.message);
  } catch (error) {
    setStatus(`Failed: ${error?.message || "unknown error"}`);
  } finally {
    setBusy(false);
  }
}

async function runUndo() {
  setStatus("Restoring previous tab state...");
  setBusy(true);

  try {
    const currentWindow = await chrome.windows.getCurrent();
    const response = await chrome.runtime.sendMessage({
      type: "UNDO_LAST_GROUPING",
      source: "popup",
      windowId: currentWindow.id
    });

    if (!response?.ok) {
      setStatus(`Failed: ${response?.error || "no snapshot found"}`);
      return;
    }

    setStatus(response.message);
  } catch (error) {
    setStatus(`Failed: ${error?.message || "unknown error"}`);
  } finally {
    setBusy(false);
  }
}

function setBusy(isBusy) {
  groupAiButton.disabled = isBusy;
  groupDomainButton.disabled = isBusy;
  undoGroupingButton.disabled = isBusy;
}

function setStatus(message) {
  statusText.textContent = message;
}
