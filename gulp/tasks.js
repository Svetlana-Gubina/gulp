const devBuild  = ((process.env.NODE_ENV || 'development').trim().toLowerCase() === 'development'),
      dir = {
        src: 'src/',
        build: 'build/'
      },
      htmlValidator = require('gulp-w3c-html-validator'),
      sass = require('gulp-sass'),
      del = require('del'),
      postcss = require('gulp-postcss'),
      autoprefixer = require('autoprefixer'),
      assets  = require('postcss-assets'),
      csso = require('gulp-csso'),
      sourcemap = devBuild ? require('gulp-sourcemaps') : null,
      rename = devBuild ? require("gulp-rename") : null,
      plumber = require('gulp-plumber'),
      htmlmin = require('gulp-htmlmin'),
      terser = require('gulp-terser'),
      server = require('browser-sync').create(),
      imagemin = require('gulp-imagemin'),
      webp = require('gulp-webp');


module.exports.validateTask = {
  validateHtml() {
     return gulp.src('/**/*.html') // !!
        .pipe(htmlValidator())
        .pipe(htmlValidator.reporter());
     },
};

module.exports = function scripts() {
  return gulp.src(dir.src + 'main.js')
        .pipe(sourcemap.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(terser())
        .pipe(sourcemap.write())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(dir.build + 'js'))
};

module.exports = function css() {
  return gulp.src(dir.src + 'sass/style.scss') // ??
  .pipe(plumber())
  .pipe(sourcemap.init())
  .pipe(sass())
  .pipe(postcss([assets({
    loadPaths: ['img/']
  })]))
  .pipe(postcss([
    autoprefixer({browsers: ['last 1 version']})
  ]))
  .pipe(csso())
  .pipe(rename('style.min.css'))
  .pipe(sourcemap.write())
  .pipe(gulp.dest(devBuild ? dir.src + 'css/' : dir.build + 'css/'))
  // .pipe(server.stream());
};

module.exports = function clean() {
  return del(dir.build);
};


module.exports = function copy() {
  return gulp.src([
          dir.src + 'fonts/**/*.{woff,woff2}',
          dir.src + 'img/**',
          // dir.src + 'js/**',
          dir.src + '*.ico'
        ], {
            base: dir.src // ??
        })
        .pipe(gulp.dest(dir.build))
};

module.exports = function normalize() {
  return gulp.src(dir.src + 'css/normalize.css')
  .pipe(csso())
  .pipe(rename('normalize.min.css'))
  .pipe(gulp.dest(dir.build + 'css/'))
  // .pipe(server.stream());
};

module.exports = function html() {
  return gulp.src(dir.src + '*.html') // ??
  // .pipe(posthtml([
  //     include()
  // ]))
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest(dir.build ));
};

module.exports = function svgSprite() {
  // return gulp.src('source/img/sprite/*.svg')
  //   .pipe(svgstore({
  //     inlineSvg: true
  //   }))
  //   .pipe(rename('sprite.svg'))
  //   .pipe(gulp.dest('build/img'))
};

module.exports = function images() {
  return gulp.src(dir.src + 'img/**/*.{png,jpg,svg}')
  .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.svgo({
          plugins: [
              {cleanupIDs: false}
          ]
      })
  ]))
  .pipe(gulp.dest(dir.build + 'img'));
};

module.exports = function webp() {
  return gulp.src(dir.src + 'img/**/*.{png,jpg}')
  .pipe(webp({quality: 90}))
  .pipe(rename({
    extname: ".webp"
  }))
  .pipe(gulp.dest(dir.build + 'img'));
};

module.exports = function serve() {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  // gulp.watch(dir.src + 'scss/**/*.scss', gulp.series('css', css()));
  // gulp.watch('source/img/icon-*.svg', gulp.series('sprite', 'html','refresh'));
  // gulp.watch(dir.src + '*.html', gulp.series('html','refresh'));
};
