// 这是一个用于在微信公众号页面控制台执行的抓取脚本
// 打开文章页面后，复制以下代码到浏览器控制台执行

// 优化后的抓取脚本
function fetchSucculentData() {
    // 初始化结果列表
    const succulentList = [];
    
    // 获取所有内容块
    const contentSections = Array.from(document.querySelectorAll('.rich_media_content > section'));
    
    // 当前正在处理的多肉植物数据
    let currentSucculent = null;
    
    // 遍历所有内容块
    for (const section of contentSections) {
        // 尝试获取标题文本
        const textContent = section.innerText.trim();
        const lines = textContent.split('\n').filter(line => line.trim());
        
        // 尝试匹配标题行（通常是数字开头的行或包含多肉名称的行）
        let title = null;
        for (const line of lines) {
            // 匹配格式："1 白牡丹" 或 "白牡丹"
            const titleMatch = line.match(/^(?:\d+\s+)?([^\(\)]+)(?:\s+\(.+\))?$/);
            if (titleMatch) {
                title = titleMatch[1].trim();
                break;
            }
        }
        
        // 尝试获取图片
        const imgElement = section.querySelector('img');
        const imgUrl = imgElement ? imgElement.src : null;
        
        // 处理标题
        if (title) {
            // 如果已经有当前处理的多肉数据，先保存
            if (currentSucculent) {
                succulentList.push(currentSucculent);
            }
            // 创建新的多肉数据
            currentSucculent = { title: title, img: null };
        }
        
        // 处理图片
        if (imgUrl && !imgUrl.includes('svg+xml')) {
            // 如果有当前处理的多肉数据，添加图片
            if (currentSucculent) {
                currentSucculent.img = imgUrl;
            } else {
                // 没有对应的标题，可能是独立的图片块
                // 尝试从图片alt或周围文本获取标题
                let fallbackTitle = imgElement.alt || '未知多肉';
                succulentList.push({ title: fallbackTitle, img: imgUrl });
            }
        }
    }
    
    // 保存最后一个多肉数据
    if (currentSucculent) {
        succulentList.push(currentSucculent);
    }
    
    // 过滤掉没有有效图片的条目
    const filteredList = succulentList.filter(item => item.img && !item.img.includes('svg+xml'));
    
    // 打印结果
    console.log('抓取到的多肉植物数据：');
    console.log(JSON.stringify(filteredList, null, 2));
    console.log(`总条目数：${filteredList.length}`);
    
    // 方便用户复制
    return filteredList;
}

// 执行抓取
fetchSucculentData();

// 以下是使用说明：
// 1. 打开微信公众号文章页面
// 2. 按F12打开开发者工具
// 3. 切换到Console（控制台）选项卡
// 4. 复制以上代码并粘贴到控制台
// 5. 按Enter执行
// 6. 等待脚本执行完成，控制台会显示抓取到的数据
// 7. 复制JSON格式的数据，保存到app.js文件中