/* jshint globalstrict:true */
'use strict';

var ng = require('ng');

ng.module('kloy.router', []).
  constant('KLOY_ROUTER_EVENTS', {
    'ROUTE_CHANGE_START': 'kloyRouteChangeStart',
    'ROUTE_CHANGE_SUCCESS': 'kloyRouteChangeSuccess',
    'ROUTE_CHANGE_ERROR': 'kloyRouteChangeError',
    'ROUTE_CHANGE_REQUEST': 'kloyRouteChangeRequest'
  }).
  provider('kloyRouter', require('./router')).
  provider('kloyLayoutManager', require('./layout-manager')).
  factory('kloyRoute', require('./route')).
  run(/*@ngInject*/function (
    kloyLayoutManager, $rootScope, KLOY_ROUTER_EVENTS
  ) {

    $rootScope.section = function (section) {

      return kloyLayoutManager.sections()[section] || null;
    };

    $rootScope.$on(KLOY_ROUTER_EVENTS.ROUTE_CHANGE_SUCCESS, function () {

      kloyLayoutManager.sync();
    });
  }).
  run(/*@ngInject*/function (
    $rootScope, KLOY_ROUTER_EVENTS, kloyRouter
  ) {

    $rootScope.$on(
      KLOY_ROUTER_EVENTS.ROUTE_CHANGE_REQUEST,
      function routeListener (e, routeName, params) {

        kloyRouter.go(routeName, params);
      }
    );
  });
