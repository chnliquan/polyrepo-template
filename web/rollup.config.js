import path from 'path'
import ts from 'rollup-plugin-typescript2'
import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import postcss from 'rollup-plugin-postcss'
import image from '@rollup/plugin-image'

const { resolveRoot } = require('./scripts/utils')

const pkgJSONPath = resolveRoot('package.json')
const pkg = require(pkgJSONPath)
const name = path.basename(__dirname)

// ensure TS checks only once for each build
let hasTSChecked = false

const outputConfigs = {
  cjs: {
    file: resolveRoot(`dist/${name}.cjs.js`),
    format: `cjs`,
  },
  esm: {
    file: resolveRoot(`dist/${name}.esm.js`),
    format: `es`,
  },
  global: {
    file: resolveRoot(`dist/${name}.global.js`),
    format: `iife`,
  },
}

const defaultFormats = ['esm', 'cjs']
const inlineFormats = process.env.FORMATS && process.env.FORMATS.split(',')
const packageFormats = inlineFormats || defaultFormats
const packageConfigs = process.env.PROD_ONLY
  ? []
  : packageFormats.map(format => createConfig(format, outputConfigs[format]))

if (process.env.NODE_ENV === 'production') {
  packageFormats.forEach(format => {
    if (packageOptions.prod === false) {
      return
    }

    if (format === 'cjs') {
      packageConfigs.push(createProductionConfig(format))
    }

    if (/^(global|esm)(-runtime)?/.test(format)) {
      packageConfigs.push(createMinifiedConfig(format))
    }
  })
}

export default packageConfigs

function createConfig(format, output, plugins = []) {
  if (!output) {
    throw new Error(`Invalid format: "${format}"`)
  }

  const isProductionBuild = process.env.__DEV__ === 'false'
  const isESMBuild = format === 'esm'
  const isNodeBuild = format === 'cjs'
  const isGlobalBuild = format === 'global'

  output.exports = 'named'
  output.sourcemap = !!process.env.SOURCE_MAP
  output.externalLiveBindings = false

  if (isGlobalBuild) {
    output.name = name.replace(/[-_\s]+(.)?/g, function (_, c) {
      return c ? c.toUpperCase() : ''
    })
  }

  const shouldEmitDeclarations = pkg.types && process.env.TYPES != null && !hasTSChecked

  const tsPlugin = ts({
    check: process.env.NODE_ENV === 'production' && !hasTSChecked,
    tsconfig: resolveRoot('tsconfig.json'),
    cacheRoot: resolveRoot('node_modules/.rts2_cache'),
    tsconfigOverride: {
      compilerOptions: {
        sourceMap: output.sourcemap,
        declaration: shouldEmitDeclarations,
        declarationMap: shouldEmitDeclarations,
      },
      exclude: ['__tests__'],
    },
  })
  // we only need to check TS and generate declarations once for each build.
  // it also seems to run into weird issues when checking multiple times
  // during a single build.
  hasTSChecked = true

  const entryFile = `src/index.ts`
  let external = []

  if (!isGlobalBuild) {
    external = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})]
  }

  return {
    input: resolveRoot(entryFile),
    external,
    plugins: [
      tsPlugin,
      json({
        namedExports: false,
      }),
      createReplacePlugin(isProductionBuild, isESMBuild, isGlobalBuild, isNodeBuild),
      nodeResolve(),
      commonjs(),
      postcss(),
      image(),
      ...plugins,
    ],
    output,
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg)
      }
    },
    treeshake: {
      moduleSideEffects: false,
    },
    watch: {
      exclude: ['node_modules/**', 'dist/**'],
    },
  }
}

function createReplacePlugin(isProduction, isESMBuild, isGlobalBuild, isNodeBuild) {
  const replacements = {
    __VERSION__: `"${pkg.version}"`,
    __DEV__: isESMBuild
      ? // preserve to be handled by bundlers
        `(process.env.NODE_ENV !== 'production')`
      : // hard coded dev/prod builds
        !isProduction,
    __GLOBAL__: isGlobalBuild,
    __ESM__: isESMBuild,
    __NODE_JS__: isNodeBuild,
  }

  // allow inline overrides like
  Object.keys(replacements).forEach(key => {
    if (key in process.env) {
      replacements[key] = process.env[key]
    }
  })

  return replace({
    values: replacements,
    preventAssignment: true,
  })
}

function createProductionConfig(format) {
  return createConfig(format, {
    file: resolve(`dist/${name}.${format}.prod.js`),
    format: outputConfigs[format].format,
  })
}

function createMinifiedConfig(format) {
  const { terser } = require('rollup-plugin-terser')

  return createConfig(
    format,
    {
      file: outputConfigs[format].file.replace(/\.js$/, '.prod.js'),
      format: outputConfigs[format].format,
    },
    [
      terser({
        module: /^esm/.test(format),
        compress: {
          ecma: 2015,
          pure_getters: true,
        },
        safari10: true,
      }),
    ]
  )
}
