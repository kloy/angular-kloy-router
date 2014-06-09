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
  provider('layoutManager', require('./layout-manager')).
  factory('kloyRoute', require('./route')).
  run(/*@ngInject*/function (layoutManager, $rootScope) {

    $rootScope.section = function (section) {

      return layoutManager.sections()[section] || null;
    };
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
