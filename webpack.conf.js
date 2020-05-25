let webpack = require('webpack');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let UglifyJSPlugin = require('uglifyjs-webpack-plugin');
let FontminPlugin = require('fontmin-webpack');
let HtmlStringReplace = require('html-string-replace-webpack-plugin');
let OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
let AssetsPlugin = require('assets-webpack-plugin');
let path = require('path');
let unminified = process.env.UNMINIFIED;
let SHANGHAI = process.env.npm_config_shanghai;
let locality = SHANGHAI ? "zh-cn" : "en";

if (process.env.npm_config_unminified !== undefined) {
    unminified = process.env.npm_config_unminified;
}

let plugins = [
  new webpack.ProvidePlugin({
    $: "jquery",
    jQuery: "jquery"
  }),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'process.env.SHANGHAI': JSON.stringify(SHANGHAI)
  }),
  new webpack.optimize.CommonsChunkPlugin({
    names: ['app', 'leaflet', 'vendor']
  }),
  new ExtractTextPlugin("styles.css"),
  new HtmlWebpackPlugin({
    template: __dirname + '/site/index.html',
    inject: 'head',
    excludeChunks: ['map', 'interpolation']
  }),
  new HtmlStringReplace({
    enable: true,
    patterns: [
      {
        match: /%3D_WebGIS_Angular_ESRI_locality%/g,
        replacement: locality
      },
    ]
  }),
  new FontminPlugin({
    autodetect: true, // automatically pull unicode characters from CSS
  }),
  new AssetsPlugin({
    filename: '3D_WebGIS_Angular_ESRI-assets.js',
    processOutput: function (assets) {
      return 'window.staticMap = ' + JSON.stringify(assets)
    },
    path: path.join(__dirname, 'dist')
  })
];

let FILE_NAME = "[name].bundle.js";

if (!unminified || unminified === 'false') {
  FILE_NAME = "[name].bundle.min.[hash].js";
  plugins.push(new UglifyJSPlugin({
    uglifyOptions: {
      compress: {
        warnings: false
      },
      warnings: false
    }
  }));
}


module.exports = {
  context: path.resolve(__dirname, "./site"),

  entry: {
    app: './app/app.js',
    vendor: './app/vendor.js',
    leaflet: './app/leaflet.js',
    map: './app/map.js',
    interpolation: './app/interpolation.js'
  },

  output: {
    filename: FILE_NAME,
    publicPath: '/',
    path: path.resolve(__dirname, 'dist')
  },

  plugins: plugins,

  resolve: {
    modules: ['../node_modules', './app/assets/js']
  },

  module: {
    rules: [
      {
        test: /\.js$/, // Check for all js files
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ["es2015"]
          }
        }]
      },
      {
        test: /\.html$/,
        exclude: [/node_modules/, require.resolve('./site/index.html')],
        loader: 'ngtemplate-loader?relativeTo=' + (path.resolve(__dirname, './site/app')) + '!html-loader'
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: "css-loader",
        })
      },
      {test: /\.(jpe?g|png|gif|svg)$/i, loader: "file-loader?limit=100000&name=assets/img/[name].[ext]"},
      {
        test: /\.(woff|woff2|svg|eot|ttf)(\?.+)?$/i,
        use: 'file-loader?name=fonts/[name].[ext]'
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    historyApiFallback: {
      index: 'index.html'
    },
    stats: {colors: true},
    host: "0.0.0.0",
    port: 9000
  },
  watchOptions: {
    aggregateTimeout: 300,
    ignored: path.resolve(__dirname, 'node_modules/')
  },
  devtool: 'source-map'
};
