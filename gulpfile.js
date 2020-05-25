/* eslint-disable no-unused-vars */
/*eslint-env node*/
/*eslint indent:0*/
'use strict';
let gulp = require('gulp');
let fs = require('fs');
let eslint = require('gulp-eslint');
let clean = require('gulp-clean');
let concat = require('gulp-concat');
let uglify = require('gulp-uglify');
let rename = require('gulp-rename');
let runSequence = require('run-sequence');
let gutil = require('gulp-util');
let KarmaServer = require('karma').Server;
let webpack = require("webpack");
let WebpackDevServer = require("webpack-dev-server");

// source directives and services
let srcFiles = 'site/app/**/*.js';
let unitTestSpecFiles = 'site/test/unit/**/*.spec.js';

gulp.task('js', function() {
  gulp.src(['node_modules/angular-esri-map/dist/angular-esri-map.js', 'node_modules/angular/angular.js'])
    .pipe(gulp.dest('dist/assets/js'));
});

gulp.task('images', ['3dModels'], function() {
  gulp.src(['site/assets/img/**/*.png', 'site/assets/img/**/*.jpg', 'site/assets/img/**/*.ico'])
    .pipe(gulp.dest('dist/assets/img/'));
});

gulp.task('3dModels', function() {
  gulp.src(['site/assets/3dModel/**/*']).pipe(gulp.dest('dist/assets/3dModel/'));
  gulp.src(['site/assets/collada/**/*']).pipe(gulp.dest('dist/assets/collada/'));
});

gulp.task('i18n', function() {
  gulp.src(['site/assets/i18n/**/*']).pipe(gulp.dest('dist/assets/i18n/'));
});

gulp.task('html', function() {
  gulp.src(['site/app/**/*.html']).pipe(gulp.dest('dist/'));
});

gulp.task('version', function() {
  let APP_VERSION = require('./package.json').version;
  fs.writeFileSync('dist/version.txt', APP_VERSION);
});

gulp.task("webpack", ['html', 'images', 'i18n', 'js'], function (callback) {
  webpack(require('./webpack.conf'), function (err, stats) {
    if (err) throw new gutil.PluginError("webpack", err);
    gutil.log("[webpack]", stats.toString({}));
    callback();
  });
});

gulp.task('webpack-dev-server', function (callback) {
  let webpackConfig = require('./webpack.conf');
  let compiler = webpack(webpackConfig);
  new WebpackDevServer(compiler, webpackConfig.devServer)
    .listen(9002, 'localhost', function (err) {
      if (err) throw new gutil.PluginError("webpack-dev-server", err);
      gutil.log("[webpack-dev-server]", "http://localhost:9002/");
    });

  gulp.watch(['site/app/**/*.html'], ['html']);
  gulp.watch(['site/assets/i18n/**/*'], ['i18n']);
  gulp.watch(['site/assets/img/**/*.png', 'site/assets/img/**/*.jpg', 'site/assets/img/**/*.ico'], ['images']);
});

// clean built copies of javascript files
// from dist folder and site
gulp.task('clean', function() {
  return gulp.src([
      'dist/*',
      '!dist/arcgis_js_api/'
    ])
    .pipe(clean({force: true}));
});

// lint source javascript files
gulp.task('lint', function() {
  return gulp.src([srcFiles, unitTestSpecFiles])
    // eslint() attaches the lint output to the eslint property
    // of the file object so it can be used by other modules.
    .pipe(eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failOnError last.
    .pipe(eslint.failOnError());
});

gulp.task('test', ['set-dev-node-env', 'lint', 'webpack'], function (done) {
  new KarmaServer({
    configFile: __dirname + '/site/test/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('set-dev-node-env', function() {
  process.env.UNMINIFIED = 'true';
  return process.env.NODE_ENV = "dev";
});

gulp.task('set-prod-node-env', function() {
  process.env.UNMINIFIED = 'false';
  return process.env.NODE_ENV = "prod";
});

gulp.task('build:dev', function(callback) {
  runSequence(
    'clean',
    'set-dev-node-env',
    'webpack',
    'version',
    callback
  );
});

gulp.task('build:prod', function(callback) {
  runSequence(
    'clean',
    'set-prod-node-env',
    'webpack',
    'version',
    callback
  );
});

gulp.task('start', function(callback) {
  runSequence(
    'build:dev',
    'webpack-dev-server',
    callback
  );
});

gulp.task('start:prod', function(callback) {
  runSequence(
    'build:prod',
    'webpack-dev-server',
    callback
  );
});

// Default Task
gulp.task('default', ['start']);
