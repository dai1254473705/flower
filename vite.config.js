import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/flower/', // 设置GitHub Pages的基础路径
  build: {
    outDir: 'docs' // 将构建输出目录改为docs，以便GitHub Pages直接读取
  }
})
