import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  input: 'src/index.js',
  output: [{
    format: 'es',
    file: 'dist/index.js'
  } , {
    format: 'cjs',
    file: 'lib/index.js'
  }],
  external: ['knockout'],
  plugins: [
    nodeResolve({ extensions: ['.js'] })
  ]
};