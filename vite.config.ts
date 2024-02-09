import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default defineConfig({
  test: {
    include: ['./lib/**/*'],
    exclude: ['packages/template/*'],
  },
})