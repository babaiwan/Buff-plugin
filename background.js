let currentIndex = 0;
let idArray = [];
let timer = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'start') {
        // 验证并初始化 ID 数组
        idArray = message.goodsIds;
        if (idArray.length === 0) {
            sendResponse({ status: 'error', message: 'No valid IDs found.' });
            return;
        }

        // 检查当前是否正在运行，如果没有则开始任务
        chrome.storage.local.get({ isRunning: false }, (result) => {
            if (!result.isRunning) {
                // 在启动任务之前，将 isRunning 设置为 true
                chrome.storage.local.set({ isRunning: true }, () => {
                    currentIndex = 0;
                    // 开始执行任务
                    startProcessing();
                    sendResponse({ status: 'started', message: 'Started successfully.' });
                });
            } else {
                sendResponse({ status: 'error', message: 'Already running.' });
            }
        });
    } else if (message.action === 'stop') {
        // 停止任务
        stopProcessing(() => {
            sendResponse({ status: 'stopped', message: 'Timer stopped.' });
        });
    }
    return true; // 异步响应
});

// 启动处理任务
function startProcessing() {
    if (currentIndex < idArray.length) {
        const targetUrl = `https://buff.163.com/goods/${idArray[currentIndex]}?from=market#tab=selling&page_num=1&min_paintwear=0.00&max_paintwear=0.01`;

        // 更新当前标签页的 URL
        chrome.tabs.query({}, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.update(tabs[0].id, { url: targetUrl });
            }
        });

        console.log(`Navigated to: ${targetUrl}`);
        currentIndex++;

        // 设置下一次执行的时间间隔
        timer = setTimeout(startProcessing, 10 * 1000); // 每10秒执行一次
    } else {
        // 如果处理完所有ID，停止任务
        stopProcessing(() => {
            console.log('All IDs processed, task stopped.');
        });
    }
}

// 停止处理任务
function stopProcessing(callback) {
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
    chrome.storage.local.set({ isRunning: false }, () => {
        currentIndex = 0; // 重置索引
        if (callback) callback();
    });
}
