import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

const env = process.env.NODE_ENV

const config = {
  input: 'src/index.js',
  external: Object.keys(pkg.peerDependencies || {}),
  output: {
    format: 'umd',
    name: 'ReactReduxLean',
    globals: {
      react: 'React',
      redux: 'Redux',
      'prop-types': 'PropTypes'
    }
  },
  plugins: [
    nodeResolve(),
    babel({
      exclude: '**/node_modules/**',
      runtimeHelpers: true
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env)
    })
  ]
}

if (env === 'production') {
  config.plugins.push(
    terser({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false
      }
    })
  )
}

export default config
