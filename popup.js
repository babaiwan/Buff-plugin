let timer = null; // 定时器 ID
let currentIndex = 0; // 当前处理的商品索引
let idArray = []; // 商品 ID 数组

// 开始定时器功能
document.getElementById('startButton').addEventListener('click', () => {
    const goodsIds = document.getElementById('goodsIds').value.trim();

    // 验证输入并初始化 ID 数组
    if (!goodsIds) {
        alert('Please enter at least one ID.');
        return;
    }

    idArray = goodsIds.split(',').map(id => id.trim()).filter(Boolean);

    if (idArray.length === 0) {
        alert('No valid IDs found. Please check your input.');
        return;
    }

    // 切换按钮状态
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('stopButton').style.display = 'block';

    // 启动定时器
    timer = setInterval(() => {
        if (currentIndex >= idArray.length) {
            currentIndex = 0; // 循环从头开始
        }

        const targetUrl = `https://buff.163.com/goods/${idArray[currentIndex]}?from=market`;

        // 在当前标签页跳转到目标 URL
        chrome.tabs.query({  }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.update(tabs[0].id, { url: targetUrl });
            }
        });

        console.log(`Navigated to: ${targetUrl}`);
        currentIndex++;
    }, 10 * 1000);
});

// 停止定时器功能
document.getElementById('stopButton').addEventListener('click', () => {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }

    // 切换按钮状态
    document.getElementById('startButton').style.display = 'block';
    document.getElementById('stopButton').style.display = 'none';

    currentIndex = 0; // 重置索引
    idArray = [];
    console.log('Timer stopped.');
});

// 监听来自 content-script.js 的消息
chrome.runtime.onMessage.addListener((message) => {
    if (message.tableHTML) {
        const tableContainer = document.getElementById('tableContainer');
        tableContainer.innerHTML = ''; // 清空现有的内容

        // 将 HTML 内容插入到页面
        tableContainer.innerHTML = message.tableHTML;

        console.log('Received and displayed table data.');
    }
});
