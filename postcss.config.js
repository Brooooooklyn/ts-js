const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')

module.exports = function (context) {
  const plugins = [
    autoprefixer({
      browsers: [
        "> 1%",
        "Firefox > 50",
        "last 4 versions",
        "not ie < 10"
      ]
    })
  ]

  plugins.push(cssnano())

  return {
    from: context.from,
    plugins,
    to: context.to
  }
}
