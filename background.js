chrome.tabs.onUpdated.addListener(async function(tab_id, change_info, tab) {
    chrome.tabs.sendMessage(tab.id, { sender: "init"});
});