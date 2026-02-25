const groupAiButton = document.getElementById("group-ai");
const groupDomainButton = document.getElementById("group-domain");
const openOptionsButton = document.getElementById("open-options");
const statusText = document.getElementById("status");

groupAiButton.addEventListener("click", async () => {
  await runGrouping("ai");
});

groupDomainButton.addEventListener("click", async () => {
  await runGrouping("domain");
});

openOptionsButton.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

async function runGrouping(mode) {
  setStatus("Grouping tabs...");
  groupAiButton.disabled = true;
  groupDomainButton.disabled = true;

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
    groupAiButton.disabled = false;
    groupDomainButton.disabled = false;
  }
}

function setStatus(message) {
  statusText.textContent = message;
}
