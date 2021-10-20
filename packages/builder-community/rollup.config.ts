import { nodeResolve } from '@rollup/plugin-node-resolve'
import { babel } from '@rollup/plugin-babel'
import postcss from 'rollup-plugin-postcss'
import less from 'rollup-plugin-less';
import replace from 'rollup-plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';
import svg from 'rollup-plugin-svg';
import image from '@rollup/plugin-image';
import { uglify } from 'rollup-plugin-uglify';
const rollupPostcssLessLoader = require('rollup-plugin-postcss-webpack-alias-less-loader')
import alias from '@rollup/plugin-alias';
import css from 'rollup-plugin-css-only'
import visualizer from 'rollup-plugin-visualizer'


import path from 'path';

const options = {
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [],
  watch: {
    include: 'src/**',
  },
  plugins: [,
    // Allow json resolution
    image(),
    json(),
    nodeResolve({
      extensions: [ '.jsx', '.js', '.json', '.node' ],
      browser: true, 
    }),
    // Compile TypeScript files
    typescript({ useTsconfigDeclarationDir: true }),
    svg(),
    // alias({
    //   entries: {
    //     "@steedos-ui/builder-sdk": "../../packages/builder-sdk/src/index.ts",
    //     "@steedos-ui/builder-store": "../../packages/builder-store/src/index.tsx",
    //     "@steedos-ui/builder-ant-design": "../../packages/builder-ant-design/src/index.tsx",
    //     "@steedos-ui/builder-form": "../../packages/builder-form/src/index.tsx",
    //     "@steedos-ui/builder-object": "../../packages/builder-object/src/index.tsx",
    //     "@steedos-ui/builder-locale": "../../packages/builder-locale/src/index.tsx",
    //     "@emotion/core": "../../node_modules/@emotion/react",
    //     "emotion-theming": "../../node_modules/@emotion/react",
    //   }
    // }),
    // less({
    //   extensions: ['.css', '.less'],
    //   inject: true,
    //   exclude: [],
    //   include: [path.resolve(__dirname, '../../node_modules/antd'), path.resolve(__dirname, '../../node_modules/@ant-design/')],
    //   option: {javascriptEnabled: true}
    // }),
    // babel({
    //   plugins: [
    //     ['import', { libraryName: 'antd', style: true }],
    //   ],
    //   exclude: ['node_modules/**', 'public/**'],
    // }),
    babel({
      include: [
        '../../node_modules/@salesforce/design-system-react/**',
        '../../node_modules/antd/**',
        '../../node_modules/@ant-design/**'
      ],
      // exclude: 'node_modules/',
      // exclude: ["../../node_modules/d3/**", "../../node_modules/d3-*/**"],
      presets: ["@babel/preset-react", "@babel/preset-env"],
      plugins: [
        ['import', { libraryName: 'antd', style: true, "libraryDirectory": "es" }, 'antd'],
        ['import', { libraryName: 'lodash' }, 'lodash'],
        ["@babel/plugin-proposal-class-properties", { loose: true }],
        '@babel/plugin-proposal-object-rest-spread',
        '@babel/plugin-proposal-export-default-from',
        '@babel/plugin-proposal-export-namespace-from',
      ]
    }),
    postcss({
      loaders: [rollupPostcssLessLoader({
        nodeModulePath: path.resolve('../../node_modules'),
        aliases: {
          '~': path.resolve('../../node_modules'),
        }
      })],
      use: [["less", { javascriptEnabled: true }]],
      extract: true,
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify( 'production' )
    }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs({
      // esmExternals: true,
      // transformMixedEsModules: true,
      // exclude: ["../../node_modules/antd/**", "../../node_modules/@ant-design/**"],
      // include: /\**node_modules\**/,
      // exclude: ["../../node_modules/d3/**", "../../node_modules/d3-*/**"],
    }),
    // css({ output: 'builder-object.css' }),
  ],
};

export default [
  // React CJS
  {
    ...options,
    input: `src/index.tsx`,
    external: [ 'react','react-dom', '@steedos/filters' ],
    output: [
      { 
        file: 'dist/builder-community.react.js', 
        format: 'cjs', 
        sourcemap: true,
        strict: false,
        globals: { react: 'React' }
      }
    ],
    plugins: options.plugins.concat([
      sourceMaps(),
    ]),
  },
  // ES
  // {
  //   ...options,
  //   input: `src/index.tsx`,
  //   external: [ 'react', 'react-dom', '@steedos/filters' ],
  //   output: [
  //     { 
  //       file: 'dist/builder-community.esm.js', 
  //       format: 'es', 
  //       sourcemap: true,
  //       globals: { react: 'React' }
  //     }
  //   ],
  //   plugins: options.plugins.concat([
  //     visualizer({
  //       filename: 'dist/stats.html'
  //     }),
  //     sourceMaps()
  //   ]),
  // },
  // UMD DEV
  // {
  //   ...options,
  //   input: `src/webcomponents.tsx`,
  //   output: [
  //     {
  //       file: 'dist/builder-community.umd.js',
  //       name: 'BuilderObject',
  //       format: 'umd',
  //       sourcemap: false,
  //       amd: {
  //         id: '@steedos-ui/builder-community',
  //       },
  //       intro: 'const global = window;',
  //     },
  //   ],
  //   plugins: options.plugins.concat([
  //     visualizer({
  //       filename: 'dist/stats.html'
  //     }),
  //     uglify(), 
  //     sourceMaps()
  //   ]),
  // }
]