module.exports = {
  output: 'src/runtime.js',
  variables: {
    imports: [
      `import * as ko from 'knockout'`,
      `import { root as koRoot, cleanup as koCleanup, computed as koComputed } from './core'`
    ],
    computed: 'koComputed',
    sample: 'ko.ignoreDependencies',
    root: 'koRoot',
    cleanup: 'koCleanup'
  }
}