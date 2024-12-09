let timer = null; // 定时器 ID
let currentIndex = 0; // 当前处理的商品索引
let idArray = []; // 商品 ID 数组

// 启动按钮事件
document.getElementById('startButton').addEventListener('click', () => {
    console.log('trigger loop')
    const goodsIds = document.getElementById('goodsIds').value.trim();
    console.log(goodsIds)

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
    console.log(idArray)

    // 发送消息启动定时任务
    chrome.runtime.sendMessage(
        { action: 'start', goodsIds: idArray },
        (response) => {
            if (response.status === 'started') {
                // 切换按钮状态
                document.getElementById('startButton').style.display = 'none';
                document.getElementById('stopButton').style.display = 'block';
                console.log(response.message);
            } else {
                alert(response.message);
            }
        }
    );
});

// 停止按钮事件
document.getElementById('stopButton').addEventListener('click', () => {
    // 发送消息停止定时任务
    chrome.runtime.sendMessage({ action: 'stop' }, (response) => {
        if (response.status === 'stopped') {
            // 切换按钮状态
            document.getElementById('startButton').style.display = 'block';
            document.getElementById('stopButton').style.display = 'none';
            console.log(response.message);
        }
    });
});


// 监听来自 content-script.js 的消息
chrome.runtime.onMessage.addListener((message) => {
    if (message.data) {
        if (message.data.length != 0) {
            let goodId = message.goodId;
            let price = message.data[0].price;

            // 从 chrome.storage.local 获取已有数据
            chrome.storage.local.get('storedData', (result) => {
                let storedData = result.storedData || {};

                // 更新或添加新的 goodId 和 price
                storedData[goodId] = price;

                // 保存更新后的数据回 chrome.storage.local
                chrome.storage.local.set(storedData, () => {
                    console.log('Data updated in storage:', storedData);
                });
            });
        }

        console.log('Received and displayed table data.');
    }
});

// 导出到 Excel 功能
function exportToExcel() {
    chrome.storage.local.get(null, (storedData) => {
        if (!storedData || Object.keys(storedData).length === 0) {
            alert('没有数据可导出');
            return;
        }

        // 将存储的数据转换为一个数组，以便导出
        let exportData = [];
        for (let goodId in storedData) {
            debugger
            exportData.push([goodId, storedData[goodId]]);
        }

        // 添加表头
        exportData.unshift(['Good ID', 'Price']);

        // 将数据转为 CSV 格式
        const csvContent = exportData.map(row => row.join(',')).join('\n');

        // 创建 Blob 对象
        const blob = new Blob([csvContent], { type: 'text/csv' });

        // 使用 chrome.downloads.download 下载文件
        const url = URL.createObjectURL(blob);
        chrome.downloads.download({
            url: url,
            filename: 'storedData.csv',
            saveAs: true, // 让用户选择保存路径
        }, (downloadId) => {
            console.log('Download started with ID:', downloadId);
            // 清理 Object URL
            URL.revokeObjectURL(url);
        });

        console.log('CSV file export triggered');
    });
}


// 绑定导出按钮
document.getElementById('exportButton').addEventListener('click', exportToExcel);
