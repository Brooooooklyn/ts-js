const os = require('os')
const { join } = require('path')
const HashOutput = require('webpack-plugin-hash-output')
const MomentLocalesPlugin = require('moment-locales-webpack-plugin')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CircularDependencyPlugin = require('circular-dependency-plugin')
const HappyPack = require('happypack')

const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length - 1 })

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  mode: 'production',

  output: {
    filename: `[name].[chunkhash:8].js`,
    chunkFilename: `[name].[chunkhash:8].js`
  },

  entry: ['./src/index.js'],

  resolve: {
    extensions: ['.ts', '.tsx', '.jsx', '.js', '.css', '.less'],
  },

  optimization: {
    minimize: true,
    runtimeChunk: true,
    splitChunks: {
      chunks: 'all',
      maxAsyncRequests: 20,
      maxInitialRequests: 20,
      cacheGroups: {
        vendors: {
          name: 'vendors',
          test: (module) => module.nameForCondition && /[\\/]node_modules[\\/]/.test(module.nameForCondition())
        },
        styles: {
          name: 'styles',
          test: (module) =>
            module.nameForCondition && /\.css$/.test(module.nameForCondition()) && !/^javascript/.test(module.type),
          chunks: 'all',
          minSize: 0,
          minChunks: 1,
          reuseExistingChunk: true,
          priority: 100
        }
      }
    }
  },

  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        loader: 'happypack/loader?id=sourcemap',
        enforce: 'pre',
        include: [join(__dirname, './src')]
      },
      {
        test: /\.(t|j)sx?$/,
        use: 'happypack/loader?id=ts',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: false,
              modules: false,
              import: true,
              importLoaders: 1
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              config: {
                path: join(__dirname, 'postcss.config.js')
              }
            }
          }
        ]
      },
      {
        test: /\.less/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: false,
              modules: false,
              import: true,
              importLoaders: 1
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              config: {
                path: join(__dirname, 'postcss.config.js')
              }
            }
          },
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true,
              sourceMap: false
            }
          }
        ]
      }
    ]
  },

  devtool: 'hidden-nosources-source-map',

  plugins: [
    new HappyPack({
      id: 'ts',
      loaders: [
        {
          loader: 'ts-loader',
          options: {
            compiler: join(__dirname, 'ts.js'),
            transpileOnly: true,
            happyPackMode: true,
            configFile: join(__dirname, 'tsconfig.json')
          }
        }
      ],
      threadPool: happyThreadPool
    }),

    new HappyPack({
      id: 'sourcemap',
      loaders: ['source-map-loader'],
      threadPool: happyThreadPool
    }),

    new MiniCssExtractPlugin({
      filename: `[name].[chunkhash:8].css`
    }),

    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
      __DEV__: false,
    }),

    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true
    }),

    new HashOutput(),

    new webpack.HashedModuleIdsPlugin(),

    new MomentLocalesPlugin({
      localesToKeep: ['zh-cn']
    }),
  ]
}