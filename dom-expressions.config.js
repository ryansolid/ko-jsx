module.exports = {
  output: 'src/runtime.js',
  includeTypes: true,
  variables: {
    imports: [
      `import * as ko from 'knockout'`,
      `import {
        root, cleanup, computed as wrap, setContext,
        registerSuspense, getContextOwner as currentContext
      } from './core'`
    ],
    declarations: {
      sample: 'ko.ignoreDependencies'
    },
    includeContext: true
  }
}