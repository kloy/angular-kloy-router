require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ng = require('ng');

function LayoutManager (sectionConfigs, $rootScope, $injector) {

  var sections = {};

  this.sections = function () {

    return ng.copy(sections);
  };

  this.sync = function () {

    Object.keys(sectionConfigs).forEach(function (section) {

      var config = sectionConfigs[section],
          helpers = {},
          template = null;

      helpers.template = function (_template) {

        template = _template;
      };

      $injector.invoke(config, helpers);
      sections[section] = template;
    });
  };
}

function LayoutManagerProvider () {

  var sectionConfigs = {};

  this.section = function (section, templateSelector) {

    var errMsg;

    if (section in sectionConfigs) {
      errMsg = "LayoutManagerProvider.section() duplicate state definition: ";
      errMsg += section;
      throw errMsg;
    }

    sectionConfigs[section] = templateSelector;

    return this;
  };

  this.$get = /*@ngInject*/["$rootScope", "$injector", function ($rootScope, $injector) {

    return new LayoutManager(
      sectionConfigs,
      $rootScope,
      $injector
    );
  }];
}

module.exports = LayoutManagerProvider;

},{"ng":"QBxXRv"}],"QBxXRv":[function(require,module,exports){
/* global angular */
module.exports = angular;

},{}],"ng":[function(require,module,exports){
module.exports=require('QBxXRv');
},{}],4:[function(require,module,exports){
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
  run(/*@ngInject*/["layoutManager", "$rootScope", function (layoutManager, $rootScope) {

    $rootScope.section = function (section) {

      return layoutManager.sections()[section] || null;
    };
  }]).
  run(/*@ngInject*/["$rootScope", "KLOY_ROUTER_EVENTS", "kloyRouter", function (
    $rootScope, KLOY_ROUTER_EVENTS, kloyRouter
  ) {

    $rootScope.$on(
      KLOY_ROUTER_EVENTS.ROUTE_CHANGE_REQUEST,
      function routeListener (e, routeName, params) {

        kloyRouter.go(routeName, params);
      }
    );
  }]);

},{"./layout-manager":1,"./route":5,"./router":6,"ng":"QBxXRv"}],5:[function(require,module,exports){
var ng = require('ng');

var route = /*@ngInject*/function () {

  var def = {}, params, name, routeData;

  /*
    Internal method should only be used by kloyRouter to update current
    route information.
  */
  def._update = function (obj) {

    params = obj.params || undefined;
    name = obj.name || undefined;
    routeData = obj.data || undefined;
  };

  def.params = function () {

    return params;
  };

  def.name = function () {

    return name;
  };

  def.data = function () {

    return ng.copy(routeData);
  };

  def.is = function (val) {

    return (def.name() === val);
  };

  def.not = function (val) {

    return (! def.is(val));
  };

  def.includes = function (val) {

    return (def.name().indexOf(val) !== -1);
  };

  def.excludes = function (val) {

    return (! def.includes(val));
  };

  def.startsWith = function (val) {

    return (def.name().substring(0, val.length) === val);
  };

  def.endsWith = function (val) {

    var name = def.name();

    return (name.substring(name.length - val.length) === val);
  };

  return def;
};

module.exports = route;

},{"ng":"QBxXRv"}],6:[function(require,module,exports){
var ng = require('ng');

var router = function (
  routes, permissions, $injector, $location, $rootScope, KLOY_ROUTER_EVENTS,
  $log, $q, kloyRoute
) {

  var def = {}, checkPermissions, checkParams, doPrefetch,
      startEvent = KLOY_ROUTER_EVENTS.ROUTE_CHANGE_START,
      successEvent = KLOY_ROUTER_EVENTS.ROUTE_CHANGE_SUCCESS,
      errorEvent = KLOY_ROUTER_EVENTS.ROUTE_CHANGE_ERROR,
      isPaused = false;

  checkPermissions = function (permissionNames) {

    var stubPermission, allPermissions = [];
    permissionNames = permissionNames || [];

    stubPermission = $q.defer();
    stubPermission.resolve();
    allPermissions.push(stubPermission.promise);

    permissionNames.forEach(function (permissionName) {

      var permissionFn, promise;

      permissionFn = permissions[permissionName];

      if (! ng.isFunction(permissionFn)) {
        throw "kloyRouter.checkPermissions(): unknown permission " +
          permissionName;
      }

      try {
        promise = $injector.invoke(permissionFn);
      } catch (err) {
        $log.error(
          'kloyRouter.checkPermissions(): problem invoking permission',
          err
        );
        throw err;
      }

      allPermissions.push(promise);
    });

    return $q.all(allPermissions);
  };

  checkParams = function (params, requiredParams) {

    var dfd = $q.defer(),
        missingParams = [];

    params = params || {};

    if (! ng.isArray(requiredParams)) {
      dfd.resolve();
      return dfd.promise;
    }

    requiredParams.forEach(function (name) {

      if (name in params) { return; }

      missingParams.push(name);
    });

    if (missingParams.length) {

      return $q.reject('missing required param(s) ' + missingParams.join(', '));
    }

    dfd.resolve();
    return dfd.promise;
  };

  doPrefetch = function (prefetchFn) {

    var prefetching, dfd;

    if (ng.isUndefined(prefetchFn)) {
      dfd = $q.defer();
      dfd.resolve();
      return dfd.promise;
    }
    else if (! ng.isFunction(prefetchFn)) {
      throw "kloyRouter.prefetch(): argument must be a function or undefined";
    }

    try {
        prefetching = $injector.invoke(prefetchFn);
      } catch (err) {
      $log.error(
        'kloyRouter.doPrefetch(): problem invoking prefetch',
        err
      );
      throw err;
    }

    return prefetching;
  };

  def.go = function (routeName, params) {

    var helpers, configFns, permissions, promise, msg, requiredParams,
        prefetchFn, previousErr, routeData;

    configFns = routes[routeName];

    if (! ng.isArray(configFns)) {
      throw 'router.go() unknown route ' + routeName;
    }

    if (isPaused) {
      msg = 'kloyRouter.go(): paused, cannot go to ' + routeName;
      $log.debug(msg);
      return $q.reject(msg);
    }

    $rootScope.$broadcast(startEvent, routeName, kloyRoute);

    helpers = {
      permissions: function (listOfPermissions) {

        if (ng.isDefined(listOfPermissions)) {
          permissions = listOfPermissions;
        }

        return permissions;
      },
      requireParams: function (params) {

        if (ng.isDefined(params)) {
          requiredParams = params;
        }

        return requiredParams;
      },
      prefetch: function (fn) {

        if (ng.isDefined(fn)) {
          prefetchFn = fn;
        }

        return prefetchFn;
      },
      data: function (obj) {

        if (ng.isDefined(obj)) {
          routeData = ng.copy(obj);
        }

        return routeData;
      }
    };

    configFns.forEach(function (configFn) {

      configFn.bind(helpers)();
    });

    previousErr = false;
    promise = checkPermissions(permissions).
      then(
        function () {

          return checkParams(params, requiredParams);
        },
        function (err) {

          if (previousErr) { return $q.reject(err); }

          $log.debug('kloyRouter.go(): permissions error', err, routeName);
          $rootScope.$broadcast(
            errorEvent,
            {
              message: err,
              type: 'permissions'
            },
            routeName,
            kloyRoute
          );
          previousErr = true;

          return $q.reject(err);
        }
      ).
      then(
        function () {

          return doPrefetch(prefetchFn);
        },
        function (err) {

          if (previousErr) { return $q.reject(err); }

          $log.debug('kloyRouter.go(): params error', err, routeName);
          $rootScope.$broadcast(
            errorEvent,
            {
              message: err,
              type: 'params'
            },
            routeName,
            kloyRoute
          );
          previousErr = true;

          return $q.reject(err);
        }
      ).
      then(
        null,
        function (err) {

          if (previousErr) { return $q.reject(err); }

          $log.debug('kloyRouter.go(): prefetch error', err, routeName);
          $rootScope.$broadcast(
            errorEvent,
            {
              message: err,
              type: 'prefetch'
            },
            routeName,
            kloyRoute
          );
          previousErr = true;

          return $q.reject(err);
        }
      ).
      then(
        function (data) {

          kloyRoute._update({
            params: params,
            name: routeName,
            data: routeData
          });

          // All went well, broadcast success event
          $rootScope.$broadcast(successEvent, routeName, kloyRoute);

          return data;
        }
      );

    return promise;
  };

  def.pause = function () {

    isPaused = true;

    return def;
  };

  def.play = function () {

    isPaused = false;

    return def;
  };

  return def;
};

var routerProvider = function () {

  var def = {}, routes = {}, permissions = {};

  def.addRoute = function (name, configFn) {

    if (name in routes) {
      throw 'routerProvider.addRoute() route already defined ' + name;
    }

    routes[name] = [configFn];

    return def;
  };

  def.modifyRoute = function (name, configFn) {

    if (ng.isUndefined(routes[name])) {
      throw 'routerProvider.modifyRoute() route not defined ' + name;
    }

    routes[name].push(configFn);

    return def;
  };

  def.addPermission = function (name, configFn) {

    if (name in permissions) {
      throw "kloyRouterProvider.addPermission(): permission already defined";
    }

    permissions[name] = configFn;

    return def;
  };

  def.$get = /*@ngInject*/["$injector", "$location", "$rootScope", "KLOY_ROUTER_EVENTS", "$log", "$q", "kloyRoute", function (
    $injector, $location, $rootScope, KLOY_ROUTER_EVENTS, $log, $q, kloyRoute
  ) {

    return router(
      routes,
      permissions,
      $injector,
      $location,
      $rootScope,
      KLOY_ROUTER_EVENTS,
      $log,
      $q,
      kloyRoute
    );
  }];

  return def;
};

module.exports = routerProvider;

},{"ng":"QBxXRv"}]},{},[4])