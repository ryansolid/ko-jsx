import nodeResolve from 'rollup-plugin-node-resolve';

export default [{
  input: 'src/index.js',
  output: {
    format: 'cjs',
    file: 'lib/index.js'
  },
  external: ['knockout', 'dom-expressions'],
  plugins: [ nodeResolve() ]
}, {
  input: 'src/html.js',
  output: {
    format: 'cjs',
    file: 'lib/html.js'
  },
  external: ['ko-jsx', 'lit-dom-expressions'],
  plugins: [ nodeResolve() ]
}, {
  input: 'src/h.js',
  output: {
    format: 'cjs',
    file: 'lib/h.js'
  },
  external: ['ko-jsx', 'hyper-dom-expressions'],
  plugins: [ nodeResolve() ]
}];