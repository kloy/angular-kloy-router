// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/oclazyload/dist/ocLazyLoad.js',
      'dist/angular-kloy-router.js',
      'test/helpers/*.js',
      'test/specs/*.js',
      'test/mocks/app-mock.js',
      {pattern: 'test/mocks/home-mock.js', included: false},
      {pattern: 'test/mocks/test-mock.js', included: false}
    ],

    // list of files / patterns to exclude
    exclude: [
      // 'test/mocks/home-mock.js',
      // 'test/mocks/test-mock.js'
    ],

    // web server port
    port: 8082,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    // browsers: ['Chrome'],
    browsers: ['Chrome'],


    reporters: ['progress'],


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
