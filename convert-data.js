import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建data目录
const dataDir = path.join(__dirname, 'data');
const detailsDir = path.join(dataDir, 'details');

// 确保目录存在
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(detailsDir)) {
    fs.mkdirSync(detailsDir, { recursive: true });
}

// 读取原始数据
const imageLinksPath = path.join(__dirname, 'image-links.json');
const imageLinks = JSON.parse(fs.readFileSync(imageLinksPath, 'utf8'));

// 生成id的函数
function generateId(title, index) {
    // 统一处理：替换空格为下划线，移除特殊字符，限制长度
    const baseId = title.toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_\u4e00-\u9fa5]/g, '')
        .replace(/_+/g, '_')
        .slice(0, 30); // 限制长度
    
    // 添加索引确保唯一性
    return `${baseId}_${index}`;
}

// 创建新的索引文件（只包含基础信息）
const newImageLinks = [];

// 为每个植物生成详细信息文件
imageLinks.forEach((plant, index) => {
    // 生成唯一id
    let id = generateId(plant.title, index);
    
    // 确保id唯一
    let uniqueId = id;
    let counter = 1;
    while (newImageLinks.some(p => p.id === uniqueId)) {
        uniqueId = `${id}_${counter}`;
        counter++;
    }
    
    // 添加到新的索引文件
    newImageLinks.push({
        id: uniqueId,
        title: plant.title,
        src: plant.src,
        category: plant.category || ''
    });
    
    // 创建详细信息文件（初始为空模板）
    const detailContent = {
        description: '',
        detailImages: [],
        tabs: [
            {
                title: '种植技巧',
                content: []
            },
            {
                title: '病虫害管理',
                content: []
            },
            {
                title: '繁殖方法',
                content: []
            }
        ]
    };
    
    // 特殊处理：如果是乙女心，使用我们之前创建的示例数据
    if (plant.title === '乙女心') {
        const examplePath = path.join(__dirname, 'example-plant-detail.json');
        if (fs.existsSync(examplePath)) {
            const exampleData = JSON.parse(fs.readFileSync(examplePath, 'utf8'));
            detailContent.description = exampleData.description;
            detailContent.detailImages = exampleData.detailImages;
            detailContent.tabs = exampleData.tabs;
        }
    }
    
    // 写入详细信息文件
    const detailPath = path.join(detailsDir, `${uniqueId}.json`);
    fs.writeFileSync(detailPath, JSON.stringify(detailContent, null, 2), 'utf8');
    
    console.log(`处理完成：${plant.title} -> ${uniqueId}.json`);
});

// 写入新的索引文件
const newImageLinksPath = path.join(dataDir, 'image-links.json');
fs.writeFileSync(newImageLinksPath, JSON.stringify(newImageLinks, null, 2), 'utf8');

// 备份原始文件
const backupPath = path.join(__dirname, 'image-links.bak.json');
fs.copyFileSync(imageLinksPath, backupPath);

console.log('\n数据拆分完成！');
console.log(`- 新索引文件：${newImageLinksPath}`);
console.log(`- 详细信息目录：${detailsDir}`);
console.log(`- 原始文件备份：${backupPath}`);