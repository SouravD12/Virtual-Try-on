let videoStream;
let videoElement;

document.addEventListener('DOMContentLoaded', function() {
  videoElement = document.getElementById('videoFeed');
  const overlayContainer = document.getElementById('overlayContainer');
  const overlayImage = document.getElementById('overlayImage');
  const jewelryItemsContainer = document.getElementById('jewelryItems');
  const tryOnButton = document.getElementById('tryOnButton');

  tryOnButton.addEventListener('click', function() {
    const selectedJewelryItem = getSelectedJewelryItem();
    if (selectedJewelryItem) {
      overlayImage.src = selectedJewelryItem.imageUrl;
      overlayContainer.style.display = 'block';
      startWebcamFeed();
      sendMessageToContentScript({ action: 'overlayJewelryItem', imageUrl: selectedJewelryItem.imageUrl });
    }
  });

  // Fetch the product images from the current website
  fetchProductImages()
    .then(function(productImages) {
      // Create buttons for each product image
      productImages.forEach(function(imageUrl) {
        const button = document.createElement('button');
        const image = document.createElement('img');
        image.src = imageUrl;
        button.appendChild(image);
        button.addEventListener('click', function() {
          selectJewelryItem(imageUrl);
        });
        jewelryItemsContainer.appendChild(button);
      });
    })
    .catch(function(error) {
      console.error('Error fetching product images:', error);
    });
});

// Function to fetch product images from the current website
function fetchProductImages() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const activeTab = tabs[0];
      chrome.scripting.executeScript(
        {
          target: { tabId: activeTab.id },
          function: getProductImages,
        },
        function(result) {
          if (chrome.runtime.lastError || !result || !result[0] || !result[0].result) {
            reject(chrome.runtime.lastError || new Error('Invalid product images'));
          } else {
            const productImages = result[0].result;
            resolve(productImages);
          }
        }
      );
    });
  });
}

// Content script injected into the active tab
function getProductImages() {
  const images = document.querySelectorAll('img'); // Customize the selector based on the website's DOM structure
  const imageUrls = Array.from(images).map(img => img.src);
  return imageUrls;
}

// Function to handle selecting a jewelry item
function selectJewelryItem(imageUrl) {
  const jewelryItems = document.querySelectorAll('#jewelryItems button');
  jewelryItems.forEach(item => {
    item.classList.remove('selected');
  });
  const selectedButton = document.querySelector(`#jewelryItems button img[src="${imageUrl}"]`);
  selectedButton.parentNode.classList.add('selected');
}

// Function to get the selected jewelry item
function getSelectedJewelryItem() {
  const selectedButton = document.querySelector('#jewelryItems button.selected');
  if (selectedButton) {
    const imageUrl = selectedButton.querySelector('img').src;
    return { imageUrl };
  }
  return null;
}

// Function to start the webcam feed
function startWebcamFeed() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(function(stream) {
      videoStream = stream;
      videoElement.srcObject = stream;
      videoElement.play();
    })
    .catch(function(error) {
      console.error('Error accessing webcam:', error);
    });
}

// Function to stop the webcam feed
function stopWebcamFeed() {
  if (videoStream) {
    const tracks = videoStream.getTracks();
    tracks.forEach(function(track) {
      track.stop();
    });
    videoStream = null;
    videoElement.srcObject = null;
  }
}

// Function to send a message to the content script
function sendMessageToContentScript(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, message);
  });
}
