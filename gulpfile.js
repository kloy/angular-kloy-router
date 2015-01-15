var gulp = require('gulp');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var gutil = require('gulp-util');
var karma = require('karma').server;
var rename = require('gulp-rename');
var del = require('del');
var runSequence = require('run-sequence');
var connect = require('gulp-connect');
var open = require("gulp-open");

gulp.task('clean', function (done) {

  del.sync('dist');
  done();
});

gulp.task('js', function () {

  var browserified = transform(function(filename) {
    var b = browserify(filename);
    return b.bundle();
  });

  return gulp.src('./src/index.js')
    .pipe(browserified)
    .on('error', gutil.log)
    .pipe(ngAnnotate())
    .pipe(rename('angular-kloy-router.js'))
    .pipe(gulp.dest('./dist'))
    .pipe(uglify())
    .pipe(rename('angular-kloy-router.min.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('unit:ci', function (done) {

  karma.start({
    configFile: __dirname + '/karma.continuous.conf.js'
  }, done);
});

gulp.task('unit:tdd', function (done) {

  karma.start({
    configFile: __dirname + '/karma.conf.js'
  }, done);
});

gulp.task('watch', function () {

  return gulp.watch('src/*.js', ['js']);
});

gulp.task('serve', function() {

  return connect.server({
    port: 8888
  });
});

gulp.task('open', function () {

  return gulp.src("./example/index.html").pipe(open("", {
    url: 'http://localhost:8888/example'
  }));
});

gulp.task('dist', function () {

  return runSequence(
    'clean',
    'js',
    'unit:ci'
  );
});

gulp.task('default', [
  'js',
  'unit:tdd',
  'watch'
]);

gulp.task('example', function () {

  return runSequence(
    'dist',
    'serve',
    'open',
    'watch'
  );
});
