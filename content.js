// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'overlayJewelryItem') {
      // Get the active tab
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const activeTab = tabs[0];
  
        // Send a message to the active tab with the selected jewelry item URL
        chrome.tabs.sendMessage(activeTab.id, { action: 'overlayJewelryItem', imageUrl: message.imageUrl });
      });
    }
  });
  