import { URL } from 'node:url'
import { readdir, stat } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
/**
 * @description 根据可选的路径片段生成一个新的绝对路径
 * @param dir 路径片段，默认`build`
 * @param metaUrl 模块的完整`url`，如果在`build`目录外调用必传`import.meta.url`
 */
const pathResolve = (dir = '.', metaUrl = import.meta.url) => {
  // 当前文件目录的绝对路径
  const currentFileDir = dirname(fileURLToPath(metaUrl))
  // build 目录的绝对路径
  const buildDir = resolve(currentFileDir, 'build')
  // 解析的绝对路径
  const resolvedPath = resolve(currentFileDir, dir)
  // 检查解析的绝对路径是否在 build 目录内
  if (resolvedPath.startsWith(buildDir)) {
    // 在 build 目录内，返回当前文件路径
    return fileURLToPath(metaUrl)
  }
  // 不在 build 目录内，返回解析后的绝对路径
  return resolvedPath
}
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      // '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@': pathResolve('./src'),
    },
  },
})
