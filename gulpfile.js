const gulp  = require('gulp'),
      devBuild  = ((process.env.NODE_ENV || 'development').trim().toLowerCase() === 'development'),
      dir = {
        src: 'src/',
        build: 'build/'
      },
      htmlValidator = require('gulp-w3c-html-validator'),
      posthtml = require('gulp-posthtml'),
      include = require('posthtml-include'),
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
      babel = require('gulp-babel'),
      terser = require('gulp-terser'),
      sync = require('browser-sync').create(),
      imagemin = require('gulp-imagemin'),
      webp = require('gulp-webp'),
      svgstore = require('gulp-svgstore');


// HTML

const html = () => {
  return gulp.src(dir.src + '*.html')
  .pipe(posthtml([
      include()
  ]))
  .pipe(htmlValidator())
  .pipe(htmlValidator.reporter())
  .pipe(htmlmin({
    collapseWhitespace: true,
    removeComments: true,
   }))
  .pipe(gulp.dest(dir.build))
  .pipe(sync.stream());
};

exports.html = html;

// Styles

const styles = () => {
  return gulp.src(dir.src + 'sass/style.scss')
  .pipe(plumber())
  .pipe(sourcemap.init())
  .pipe(sass())
  .pipe(postcss([assets({
    loadPaths: ['img/']
  })]))
  .pipe(postcss([
    autoprefixer()
  ]))
  .pipe(csso())
  .pipe(rename('style.min.css'))
  .pipe(sourcemap.write())
  .pipe(gulp.dest(dir.build + 'css/'))
  .pipe(sync.stream());
};

exports.styles = styles;


const normalize = () => {
  return gulp.src(dir.src + 'css/normalize.css')
  .pipe(csso())
  .pipe(rename('normalize.min.css'))
  .pipe(gulp.dest(dir.build + 'css/'))
  .pipe(sync.stream());
};

exports.normalize = normalize;


// Scripts

const scripts = () => {
  return gulp.src(dir.src + 'js/main.js')
        .pipe(sourcemap.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(terser())
        .pipe(sourcemap.write())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(dir.build + 'js'))
        .pipe(sync.stream());
};

exports.scripts = scripts;


// Images

const images = () => {
  return gulp.src(dir.src + 'img/**/*.{png,jpg,svg}')
  .pipe(imagemin([
    imagemin.gifsicle({interlaced: true}),
    imagemin.mozjpeg({quality: 75, progressive: true}),
    imagemin.optipng({optimizationLevel: 5}),
    imagemin.svgo({
        plugins: [
            {removeViewBox: true},
            {cleanupIDs: false}
        ]
    })
]))
  .pipe(gulp.dest(dir.build + 'img'));
};

exports.images = images;

const toWebp = () => {
  return gulp.src(dir.src + 'img/**/*.{png,jpg}')
  .pipe(webp({quality: 90}))
  .pipe(rename({
    extname: ".webp"
  }))
  .pipe(gulp.dest(dir.build + 'img'));
};

exports.webp = webp;

// SVG

const svgSprite = () => {
  return gulp.src(dir.src + 'img/sprite/*.svg')
  .pipe(svgstore({
      inlineSvg: true
  }))
  .pipe(rename('sprite.svg'))
  .pipe(gulp.dest(dir.build + 'img'));
};

exports.svgSprite = svgSprite;


// Clean

const clean = () => {
  return del(dir.build);
};

exports.clean = clean;

// Copy

const copy = () => {
  return gulp.src([
    dir.src + 'fonts/**/*',
    dir.src + 'img/**/*',
    dir.src + '*.ico'
  ], {
      base: dir.src
  })
  .pipe(gulp.dest(dir.build))
  .pipe(sync.stream({
    once: true
}));
};

exports.copy = copy;

// Server

const server = () => {
  sync.init({
      open: true,
      cors: true,
      ui: false,
      notify: false,
      server: {
          baseDir: 'build/'
      }
  });
};

exports.server = server;

// Watch

const reload = (done) => {
  sync.reload();
  done();
};

exports.reload = reload;


const watch = () => {
  gulp.watch(dir.src + '*.html', gulp.series(html, reload));
  gulp.watch(dir.src + 'sass/**/*.scss', gulp.series(styles, reload));
  gulp.watch(dir.src + 'js/**/*.js', gulp.series(scripts, reload));
  gulp.watch([
      dir.src + 'fonts/**/*',
      dir.src + 'img/**/*',
  ], gulp.series(copy));
};

exports.watch = watch;

// Start, build

const dev = gulp.series(
  gulp.parallel(
    html,
    styles,
    normalize,
    scripts,
    images,
    toWebp,
    svgSprite
    ),
    gulp.parallel(
      watch,
      server,
  ),
);


exports.start = dev;
exports.build = gulp.series(clean, dev);
