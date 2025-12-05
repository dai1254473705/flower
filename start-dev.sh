#!/bin/bash

# 切换到Node.js 24版本
echo "切换到Node.js 24版本..."
. ~/.nvm/nvm.sh
nvm use 24

# 检查Node.js版本
node -v

# 启动开发服务器
echo "启动开发服务器..."
npm run dev-actual