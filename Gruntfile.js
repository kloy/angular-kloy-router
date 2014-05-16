/* jshint node:true */
'use strict';

module.exports = function (grunt) {

  var config = {
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        background: true
      },
      //continuous integration mode: run tests once in PhantomJS browser.
      continuous: {
        configFile: 'karma.continuous.conf.js'
      }
    },
    browserify: {
      options: {
        alias: [
          'src/ng.js:ng'
        ],
        transform: ['browserify-ngannotate']
      },
      plugin: {
        src: 'src/router.js',
        dest: 'dist/angular-kloy-router.js'
      }
    },
    watch: {
      test: {
        files: ['src/*.js', 'test/**/*.js'],
        tasks: ['browserify:plugin', 'karma:unit:run']
      }
    },
    uglify: {
      plugin: {
        src: 'dist/angular-kloy-router.js',
        dest: 'dist/angular-kloy-router.min.js'
      }
    },
    jshint: {
      options: {
        jshintrc: true
      },
      plugin: ['src/*.js']
    }
  };

  grunt.initConfig(config);
  // load all grunt tasks matching the `grunt-*` pattern
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', [
    'jshint:plugin',
    'browserify:plugin',
    'uglify:plugin',
    'karma:continuous',
    'karma:unit',
    'watch'
  ]);

  grunt.registerTask('dist', [
    'jshint:plugin',
    'browserify:plugin',
    'uglify:plugin',
    'karma:continuous',
  ]);
};
