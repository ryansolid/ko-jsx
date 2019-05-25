module.exports = {
  output: 'src/runtime.js',
  includeTypes: true,
  variables: {
    imports: [
      `import { ignoreDependencies as sample } from 'knockout'`,
      `import {
        root, cleanup, computed as wrap, setContext,
        registerSuspense, getContextOwner as currentContext
      } from './core'`
    ],
    includeContext: true
  }
}