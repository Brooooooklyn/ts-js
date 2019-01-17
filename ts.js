const ts = require('typescript')
const tsImportPluginProvider = require('ts-import-plugin')

const transpileModule = ts.transpileModule

const tsImportPlugin = tsImportPluginProvider([
  {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true
  },
  {
    style: false,
    libraryName: 'lodash',
    libraryDirectory: null,
    camel2DashComponentName: false
  }
])

const plugins = [tsImportPlugin]

ts.transpileModule = function (input, transpileOptions) {
  if (transpileOptions.transformers) {
    const before = transpileOptions.transformers.before || []
    transpileOptions.transformers.before = before.concat(plugins)
  } else {
    transpileOptions.transformers = {
      before: plugins
    }
  }

  return transpileModule(input, transpileOptions)
}

module.exports = ts
