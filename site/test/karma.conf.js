//jshint strict: false
let webpackConfig = require('../../webpack.conf');

module.exports = function (config) {
  config.set({

    basePath: '../',

    files: [
      '../dist/vendor.bundle.js',
      '../dist/leaflet.bundle.js',
      '../dist/app.bundle.js',
      'assets/js/angular-esri-map.js',
      '../node_modules/angular-mocks/angular-mocks.js',
      './test/**/*.js'
    ],

    webpack: webpackConfig,

    autoWatch: false,

    frameworks: ['mocha', 'sinon-chai'],

    browsers: ['Chrome'],

    client: {
      mocha: {
        reporter: 'html'
      }
    },

    plugins: [
      'karma-webpack',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-mocha',
      'karma-sinon-chai',
      'karma-coverage'
    ],

    // coverage reporter generates the coverage
    reporters: ['progress', 'coverage'],

    preprocessors: {
      '../dist/app.bundle.js': ['webpack']
    },

    // optionally, configure the reporter
    coverageReporter: {
      threshold: 80,
      type: 'html',
      dir: '../coverage/'
    }

  });
};
