const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebPackPlugin = require("html-webpack-plugin")
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')
const showdown = require('showdown')
const md = new showdown.Converter()
const cloneDeep = require('lodash/cloneDeep')
const handlebars = require('handlebars')

// apply markdown filter recursively as needed
function formatStrings(data, isMarkdown=false) {
  let parsedData = cloneDeep(data)

  if (Array.isArray(data)) {
    parsedData = data.map(formatStrings)
  }
  else if (typeof(data) === 'object') {
    for (let key of Object.keys(data)) {
      if (data[key]) {
        parsedData[key] = formatStrings(data[key], key.match(/_html$/))
      }
    }
  }
  else if (isMarkdown) {
    parsedData = md.makeHtml(data)
  }

  return parsedData
}

function loadStrings(languageCode) {
  const stringsFile = path.resolve(__dirname, 'src', 'strings', `${languageCode}.yml`)
  const strings = yaml.safeLoad(fs.readFileSync(stringsFile, 'utf8'))
  return formatStrings(strings)
}

function HandlebarsPlugin(options) {
  options = options || {};
  this.template = options.template;
}

HandlebarsPlugin.prototype.apply = function(compiler) {
  compiler.hooks.compilation.tap('HandlebarsPlugin', function (compilation) {
    compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync('HandlebarsPlugin', function (data, callback) {
      const template = handlebars.compile(data.html)
      const strings = loadStrings(data.plugin.options.language)
      data.html = template(strings)
      callback(null, data)
    });
  });
}

const extractSass = new ExtractTextPlugin({
  filename: "app.[hash].css",
  disable: process.env.NODE_ENV === "development"
});


module.exports = {
  entry: './src/index.js',
  output: {
    filename: "app.[hash].js",
    path: path.resolve(__dirname, './dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [
          /node_modules/
        ],
        use: {
          loader: "babel-loader",
          query: {
            presets: ['es2015', 'stage-0']
          }
        },
      }, {
        test: /\.(s*)css$/,
        use: extractSass.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      }, {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: {
              minimize: true
            }
          }
        ]
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader'
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebPackPlugin({
      template: './src/index.html',
      inlineSource: '.(js|css)$',
      language: 'en'
    }),
    new HtmlWebPackPlugin({
      template: './src/index.html',
      inlineSource: '.(js|css)$',
      language: 'es',
      filename: 'index-es.html'
    }),
    new HandlebarsPlugin(),
    new CopyWebpackPlugin([
      { from: 'static' }
    ]),
    extractSass,
  ]
};
