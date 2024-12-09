// 监听来自 content-script 的消息
chrome.runtime.onMessage.addListener((message) => {
    if (message.data) {
        console.log('Received data from content script:', message.data);

        // 将数据传递给 popup.js
        chrome.action.openPopup();  // 打开弹窗
    }
});
