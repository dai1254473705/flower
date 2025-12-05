const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 获取 flower 目录下的所有图片文件
const flowerDir = path.join(__dirname, 'flower');
const files = fs.readdirSync(flowerDir);

// 转换图片的函数
async function convertImage(filePath, outputPath) {
    try {
        await sharp(filePath)
            .jpeg({ quality: 90 })
            .toFile(outputPath);
        console.log(`转换成功: ${path.basename(filePath)} -> ${path.basename(outputPath)}`);
    } catch (error) {
        console.error(`转换失败: ${path.basename(filePath)}，错误: ${error.message}`);
    }
}

// 批量转换所有图片
async function convertAllImages() {
    console.log('开始转换图片格式...');
    
    for (const file of files) {
        const filePath = path.join(flowerDir, file);
        
        // 检查是否是文件
        if (fs.statSync(filePath).isFile()) {
            // 生成临时输出路径
            const tempPath = path.join(flowerDir, `temp_${file}`);
            
            try {
                // 转换图片
                await convertImage(filePath, tempPath);
                
                // 删除原文件
                fs.unlinkSync(filePath);
                
                // 重命名临时文件为原文件名
                fs.renameSync(tempPath, filePath);
            } catch (error) {
                console.error(`处理 ${file} 时出错: ${error.message}`);
                // 如果转换失败，删除临时文件
                if (fs.existsSync(tempPath)) {
                    fs.unlinkSync(tempPath);
                }
            }
        }
    }
    
    console.log('所有图片转换完成！');
}

// 执行转换
convertAllImages();
