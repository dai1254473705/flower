const fs = require('fs');
const https = require('https');
const path = require('path');

// 引入 app.js 中的数据
const flowers = require('./app.js');

// 创建 flower 目录用于保存图片
const flowerDir = path.join(__dirname, 'flower');
if (!fs.existsSync(flowerDir)) {
    fs.mkdirSync(flowerDir);
}

// 下载图片的函数
function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        // 检查是否是 data:image/svg+xml 格式的图片，如果是则跳过
        if (url.startsWith('data:image/svg+xml')) {
            console.log(`跳过 SVG 图片: ${filename}`);
            resolve();
            return;
        }

        const file = fs.createWriteStream(filename);
        
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`请求失败，状态码: ${response.statusCode}`));
                return;
            }

            response.pipe(file);
            
            file.on('finish', () => {
                file.close(() => {
                    console.log(`下载成功: ${filename}`);
                    resolve();
                });
            });
        }).on('error', (err) => {
            fs.unlink(filename, () => {}); // 删除失败的文件
            console.error(`下载失败: ${filename}，错误: ${err.message}`);
            resolve(); // 继续下载其他图片
        });
    });
}

// 批量下载所有图片
async function downloadAllImages() {
    console.log('开始下载图片...');
    
    for (const flower of flowers) {
        const title = flower.title;
        const imgUrl = flower.img;
        
        // 生成文件名，使用标题作为文件名，添加 .jpg 扩展名
        const filename = path.join(flowerDir, `${title}.jpg`);
        
        // 检查文件是否已存在，如果存在则跳过
        if (fs.existsSync(filename)) {
            console.log(`文件已存在，跳过: ${filename}`);
            continue;
        }
        
        try {
            await downloadImage(imgUrl, filename);
        } catch (error) {
            console.error(`处理 ${title} 时出错: ${error.message}`);
        }
        
        // 等待一段时间，避免请求过于频繁
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('所有图片下载完成！');
}

// 执行下载
downloadAllImages();