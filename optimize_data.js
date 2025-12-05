const fs = require('fs');
const path = require('path');

// 读取当前的 app.js 数据
const currentData = require('./app.js');

// 过滤出有有效图片的条目
const validData = currentData.filter(item => {
    return item.img && !item.img.startsWith('data:image/svg+xml');
});

// 为过滤后的数据重新添加正确的索引
const optimizedData = validData.map((item, index) => {
    return {
        ...item,
        index: index
    };
});

// 输出统计信息
console.log('原始数据条数:', currentData.length);
console.log('有效数据条数:', validData.length);
console.log('优化后数据条数:', optimizedData.length);

// 将优化后的数据写入新文件
const outputPath = path.join(__dirname, 'app_optimized.js');
fs.writeFileSync(outputPath, `module.exports = ${JSON.stringify(optimizedData, null, 2)};`);

console.log(`优化后的数据已保存到: ${outputPath}`);

// 可选：如果需要替换原文件，可以取消下面的注释
// fs.writeFileSync('./app.js', `module.exports = ${JSON.stringify(optimizedData, null, 2)};`);
// console.log('已替换原 app.js 文件');