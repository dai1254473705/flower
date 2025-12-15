# flower

多肉管理系统前端 + 本地文件服务。

## 本地启动 / 调试
1. 安装依赖：`npm install`
2. 开发启动：`npm run dev`（并行启动本地 API `server/index.js` 默认端口 3000 + Vite 开发服务默认 5173）
3. 浏览器访问：`http://localhost:5173`
4. 调试：前端使用 Vite HMR，服务端日志在终端输出。

## 构建
- 运行 `npm run build`，产物输出到 `dist/`。

## 部署
- 将 `dist/` 目录静态部署即可（如 Nginx / 静态托管）。
- 若需使用现有自动脚本：`npm run deploy`（会执行 build 并 git 提交推送到 master）。

## 资源
- 本地图标：`public/images/icon/<分类>/<名称>.jpg`
- 分类数据：`public/data/category/*.json`（`srcList[0].local` 指向本地图标，`srcList[0].remote` 为已上传的微信地址）