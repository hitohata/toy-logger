import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['./lib/**/*', './test/**.test.ts'],
    exclude: ['packages/template/*'],
  },
})