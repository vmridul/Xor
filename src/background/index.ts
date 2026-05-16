chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: "dashboard.html" });
});

chrome.runtime.onMessage.addListener(
  (message: any, sender: chrome.runtime.MessageSender) => {
    if (message.action === "xor_data_changed") {
      chrome.tabs.query(
        { url: ["https://x.com/*", "https://twitter.com/*"] },
        (tabs) => {
          tabs.forEach((tab) => {
            if (tab.id && tab.id !== sender.tab?.id) {
              chrome.tabs.sendMessage(tab.id, message).catch(() => {});
            }
          });
        },
      );
    }

    if (message.action === "xor_open_dashboard") {
      chrome.tabs.create({ url: "dashboard.html" });
    }
  },
);

chrome.commands.onCommand.addListener((command: string) => {
  if (command === "save-tweet") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "xor_trigger_save" });
      }
    });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("xor_folders", (result: any) => {
    if (!result.xor_folders || result.xor_folders.length === 0) {
      const defaultFolder = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36),
        name: "Saved Posts",
        color: "#1d9bf0",
        icon: "",
        createdAt: new Date().toISOString(),
        order: 0,
      };
      chrome.storage.local.set({ xor_folders: [defaultFolder] });
    }
  });
});

export {};
