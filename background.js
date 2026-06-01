const api = typeof browser !== "undefined" ? browser : chrome;

api.action.onClicked.addListener((tab) => {
  if (!tab?.id || !tab.url) {
    return;
  }

  // Matches https://notion.so, https://www.notion.so, https://app.notion.com, etc.
  const isValidNotionUrl = /^https:\/\/(.*\.)?notion\.(so|com)(\/|$)/.test(tab.url);

  if (!isValidNotionUrl) {
    return;
  }

  api.tabs.sendMessage(tab.id, { action: "convert" }, () => {
    if (api.runtime.lastError) {
      console.warn("Failed to send convert message:", api.runtime.lastError.message);
    }
  });
});
