// 监听页面加载完成后，抓取 ID 为 market-selling-list 的表格数据
window.addEventListener('load', () => {
    // 获取 ID 为 market-selling-list 的 table 元素
    const table = document.getElementById('market-selling-list');

    if (table) {
        // 获取整个 table 的 HTML 内容
        const tableHTML = table.outerHTML;

        // 输出整个 table 的 HTML 内容
        console.log('Table HTML:', tableHTML);

        // 将抓取到的 table HTML 内容发送给 popup.js
        chrome.runtime.sendMessage({ tableHTML: tableHTML });
    } else {
        console.log('Table with ID "market-selling-list" not found.');
    }
});
