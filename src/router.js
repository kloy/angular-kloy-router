/* jshint globalstrict:true */
'use strict';

var ng = require('ng');

ng.module('kloy.router', []).
  constant('KLOY_ROUTER_EVENTS', {
    'STATE_CHANGE_SUCCESS': 'stateChangeSuccess',
    'STATE_CHANGE_ERROR': 'stateChangeError',
    'STATE_CHANGE_REQUEST': 'stateChangeRequest',
    'STATE_ROUTER_PAUSED': 'stateRouterPaused',
    'STATE_ROUTER_PLAYING': 'stateRouterPlaying'
  }).
  provider('stateRouter', require('./state-router')).
  provider('layoutManager', require('./layout-manager')).
  service('stateModel', require('./state-model')).
  run([
    'layoutManager',
    '$rootScope',
    'KLOY_ROUTER_EVENTS',
    function (layoutManager, $rootScope, KLOY_ROUTER_EVENTS) {

      $rootScope.section = function (section) {

        return layoutManager.sections()[section] || null;
      };

      $rootScope.$on(
        KLOY_ROUTER_EVENTS.STATE_CHANGE_SUCCESS,
        layoutManager.sync
      );
    }]
  ).
  run([
    '$rootScope',
    'stateRouter',
    'KLOY_ROUTER_EVENTS',
    function ($rootScope, stateRouter, KLOY_ROUTER_EVENTS) {

      function listener (e, state, params) {

        stateRouter.go(state, params);
      }

      $rootScope.$on(KLOY_ROUTER_EVENTS.STATE_CHANGE_REQUEST, listener);
    }
  ]);
