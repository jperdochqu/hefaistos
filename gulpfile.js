let gulp          = require('gulp'),
    browserSync   = require('browser-sync'),
    reload        = browserSync.reload,
    autoprefixer  = require('gulp-autoprefixer'),
    minifycss     = require('gulp-uglifycss'),
    filter        = require('gulp-filter'),
    uglify        = require('gulp-uglify'),
    imagemin      = require('gulp-imagemin'),
    newer         = require('gulp-newer'),
    rename        = require('gulp-rename'),
    concat        = require('gulp-concat'),
    gcmq          = require('gulp-group-css-media-queries'),
    less          = require('gulp-less'),
    rimraf        = require('gulp-rimraf'),
    plumber       = require('gulp-plumber'),
    cache         = require('gulp-cache'),
    sourcemaps    = require('gulp-sourcemaps'),
    stylelint     = require('gulp-stylelint'),
    eslint        = require('gulp-eslint')

let project       = 'hefaistos',
    url           = 'localhost:1313'

// Tasks
gulp.task('browser-sync', () => {
  let files = [
    '**/*.html',
    '**/*.md',
    '**/*.{png,jpg,gif,svg}'
  ]
  browserSync.init(files, {
    proxy: url,
    port: 8000,
    ui: {
      port: 9000,
    },
    open: false,
    notify: false,
    injectChanges: true,
  })
})

gulp.task('styles', () => {
  gulp.src('./assets/less/app.less')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(less({
      errLogToConsole: true,
      outputStyle: 'compressed',
      precision: 10,
    }))
    .pipe(sourcemaps.write({includeContent: false}))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(autoprefixer('last 3 version', '> 1%', 'ie 9', 'ios 6', 'android 4'))
    .pipe(sourcemaps.write('.'))
    .pipe(plumber.stop())
    .pipe(gulp.dest('./assets/css/'))
    .pipe(filter('**/*.css'))
    .pipe(gcmq())
    .pipe(reload({stream: true}))
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss({
      maxLineLen: 110
    }))
    .pipe(gulp.dest('./assets/css/'))
    .pipe(reload({stream: true}))
})

gulp.task('vendorsJs', () => {
  return gulp.src(['./assets/js/vendor/**/*.js'])
    .pipe(concat('vendors.js'))
    .pipe(gulp.dest('./assets/js'))
    .pipe(rename({
      basename: "vendors",
      suffix: '.min'
    }))
    .pipe(uglify())
    .pipe(gulp.dest('./assets/js/'))
})

gulp.task('scriptsJs', () => {
  return gulp.src('./assets/js/custom/**/*.js')
    .pipe(concat('app.js'))
    .pipe(gulp.dest('./assets/js'))
    .pipe(rename({
      basename: "app",
      suffix: '.min'
    }))
    .pipe(uglify())
    .pipe(gulp.dest('./assets/js/'))
    .pipe(reload({stream: true}))
})

gulp.task('images', () => {
  return gulp.src(['./assets/img/raw/**/*.{png,jpg,gif,svg,ico}'])
    .pipe(newer('./assets/img/'))
    .pipe(rimraf({force: true}))
    .pipe(imagemin({optimizationLevel: 7, progressive: true, interlaced: true}))
    .pipe(gulp.dest('./assets/img/'))
})

gulp.task('clear', () => {
  cache.clearAll()
})

gulp.task('stylelint', () => {
  return gulp.src('assets/less/**/*.less')
    .pipe(stylelint({
      reporters: [
        {formatter: 'string', console: true}
      ]
    }))
})

gulp.task('eslint', () => {
  return gulp.src('assets/js/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
})

gulp.task('default', ['styles', 'vendorsJs', 'scriptsJs', 'images', 'browser-sync'], () => {
  gulp.watch('./assets/img/raw/**/*', ['images'])
  gulp.watch('./assets/less/**/*.less', ['styles'])
  gulp.watch('./assets/js/**/*.js', ['scriptsJs', browserSync.reload])
})
