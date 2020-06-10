'use strict';

const gulp = require('gulp');

const serve = require('./tasks/serve');
const css = require('./tasks/css');
const scripts = require('./tasks/scripts');
const imageMinify = require('./tasks/images');
const clean = require('./tasks/clean');
const webp = require('./tasks/webp');
// const lighthouse = require('./gulp/tasks/lighthouse');
// const svgSprite = require('./tasks/svgSprite');

function setMode(isProduction = false) {
  return cb => {
    process.env.NODE_ENV = isProduction ? 'production' : 'development'
    cb()
  }
};

const dev = gulp.parallel(css, scripts, imageMinify, svgSprite);

const build = gulp.series(clean, dev);

module.exports.start = gulp.series(setMode(), build, serve);
module.exports.build = gulp.series(setMode(true), build);

// module.exports.lighthouse = gulp.series(lighthouse)
