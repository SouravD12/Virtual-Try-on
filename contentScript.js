// Listen for messages from the extension
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "overlayJewelryItem") {
    const jewelryItemUrl = message.imageUrl;

    // Create and position the jewelry item element
    const jewelryItem = document.createElement("img");
    jewelryItem.src = jewelryItemUrl;
    jewelryItem.style.position = "absolute";
    jewelryItem.style.top = "50%";
    jewelryItem.style.left = "50%";
    jewelryItem.style.transform = "translate(-50%, -50%)";
    jewelryItem.style.pointerEvents = "none";

    // Append the jewelry item to the body
    document.body.appendChild(jewelryItem);
  }
});
