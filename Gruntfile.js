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
        src: 'src/plugin.js',
        dest: 'build/angular-kloy-router.js'
      }
    },
    watch: {
      build: {
        files: ['src/*.js'],
        tasks: ['browserify:plugin']
      },
      test: {
        files: ['test/**/*.js', 'build/*.js'],
        tasks: ['karma:unit:run']
      }
    },
    uglify: {
      plugin: {
        src: 'build/angular-kloy-router.js',
        dest: 'build/angular-kloy-router.min.js'
      }
    },
    jshint: {
      options: {
        jshintrc: true
      },
      plugin: ['src/*.js']
    },
    clean: ['build'],
    copy: {
      plugin: {
        files: [
          {
            src: 'build/angular-kloy-router.js',
            dest: 'dist/angular-kloy-router.js'
          },
          {
            src: 'build/angular-kloy-router.min.js',
            dest: 'dist/angular-kloy-router.min.js'
          }
        ]
      }
    },
    connect: {
      server: {
        options: {
          port: 9000,
          keepalive: true
        }
      }
    }
  };

  grunt.initConfig(config);
  // load all grunt tasks matching the `grunt-*` pattern
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', [
    'clean',
    'jshint:plugin',
    'browserify:plugin',
    'uglify:plugin',
    // 'karma:continuous',
    'karma:unit',
    'watch',
  ]);

  grunt.registerTask('dist', [
    'clean',
    'jshint:plugin',
    'browserify:plugin',
    'uglify:plugin',
    'karma:continuous',
    'copy:plugin',
  ]);

  grunt.registerTask('example', [
    'dist',
    'connect:server'
  ]);
};
