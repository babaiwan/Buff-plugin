// 监听页面加载完成后，抓取 ID 为 market-selling-list 的表格数据
$(document).ready(function () {
    // 获取 captcha 元素
    const captchaDiv = document.getElementById('captcha');

    // 检查是否有 input 元素
    if (captchaDiv && captchaDiv.querySelector('input')) {
        chrome.runtime.sendMessage({ action: 'stop' }, (response) => {
            if (response.status === 'stopped') {
                console.log('Task stopped successfully.');
            } else {
                console.log('Error stopping task: ' + response.message);
            }
        });
    }

    // 获取 ID 为 market-selling-list 的 table 元素
    setTimeout(_=>{
        const table = document.getElementById('market-selling-list');

        if (table) {

            // 将抓取到的 table HTML 内容发送给 popup.js
            let arr = getRowData()
            console.log(arr)
// 使用正则表达式提取商品 ID
            const regex = /https:\/\/buff\.163\.com\/goods\/(\d+)\?/;
            const match = window.location.href.match(regex);

            let itemId = null;
            if (match) {
                itemId = match[1];  // 获取第一个捕获的组，即商品 ID
                chrome.runtime.sendMessage({ data: arr,goodId:itemId });

                if (arr.length != 0){
                    let price = arr[0].price;

                    // 从 chrome.storage.local 获取已有数据
                    chrome.storage.local.get('storedData', (result) => {
                        let storedData = result.storedData || {};

                        // 更新或添加新的 goodId 和 price
                        storedData[itemId] = price;
                        console.log('set storeData')
                        console.log(storedData)

                        // 保存更新后的数据回 chrome.storage.local
                        chrome.storage.local.set({storedData: storedData});
                    });
                }
            }

        } else {
            console.log('Table with ID "market-selling-list" not found.');
        }
    },1000)
})

function getRowData(){
    // 获取所有的tr元素，其中每个tr包含一个物品的详细信息
    const rows = document.querySelectorAll('#market-selling-list .selling');

// 遍历每一行，提取磨损度和价格
    const items = Array.from(rows).map(row => {
        // 获取磨损度
        const wearValueElement = row.querySelector('.wear-value');
        const wearValue = wearValueElement ? wearValueElement.textContent.trim() : null;

        // 获取价格
        const priceElement = row.querySelector('.f_Strong');
        const price = priceElement ? priceElement.textContent.trim() : null;

        return {
            wearValue,
            price
        };
    });

    // 提取和转换数据
    const formattedItems = items.map(item => ({
        wearValue: parseFloat(item.wearValue.replace('磨损: ', '')),  // 去掉 '磨损: ' 并转为浮动数值
        price: parseFloat(item.price.replace('¥ ', '').replace(',', '')),  // 去掉 '¥ ' 和逗号，转为整数
    }));

    return formattedItems;
}