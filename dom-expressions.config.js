module.exports = {
  output: 'src/runtime.js',
  includeTypes: true,
  variables: {
    imports: [
      `import { computed as wrap, condition as wrapCondition } from './core';`,
      `import { ignoreDependencies as ignore } from 'knockout';`
    ],
    includeContext: false,
    wrapConditionals: true
  }
}