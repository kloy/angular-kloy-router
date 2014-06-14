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

  this.addSection = function (section, templateSelector) {

    var errMsg;

    if (section in sectionConfigs) {
      errMsg = "LayoutManagerProvider.addSection() duplicate section ";
      errMsg += "definition: " + section;
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
  provider('kloyLayoutManager', require('./layout-manager')).
  factory('kloyRoute', require('./route')).
  run(/*@ngInject*/["kloyLayoutManager", "$rootScope", "KLOY_ROUTER_EVENTS", function (
    kloyLayoutManager, $rootScope, KLOY_ROUTER_EVENTS
  ) {

    $rootScope.section = function (section) {

      return kloyLayoutManager.sections()[section] || null;
    };

    $rootScope.$on(KLOY_ROUTER_EVENTS.ROUTE_CHANGE_SUCCESS, function () {

      kloyLayoutManager.sync();
    });
  }]).
  run(/*@ngInject*/["$rootScope", "KLOY_ROUTER_EVENTS", "kloyRouter", "$location", "kloyRoute", function (
    $rootScope, KLOY_ROUTER_EVENTS, kloyRouter, $location, kloyRoute
  ) {

    $rootScope.$on(
      KLOY_ROUTER_EVENTS.ROUTE_CHANGE_REQUEST,
      function routeListener (e, routeName, params) {

        kloyRouter.toRoute(routeName, params);
      }
    );

    $rootScope.$on('$locationChangeSuccess', function (e, newUrl, oldUrl) {

      var path = $location.path(),
          routePath = kloyRoute.path();

      // Should do following...
      // Check if new URL is not old URL
      // Check if route's path is not new path

      if (newUrl !== oldUrl && path !== routePath) {
        path = $location.path();
        kloyRouter.toPath(path);
      }
    });
  }]);

},{"./layout-manager":1,"./route":5,"./router":6,"ng":"QBxXRv"}],5:[function(require,module,exports){
var ng = require('ng');

var route = /*@ngInject*/function () {

  var def = {}, params, name, routeData, path;

  /*
    Internal method should only be used by kloyRouter to update current
    route information.
  */
  def._update = function (obj) {

    params = obj.params || undefined;
    name = obj.name || undefined;
    routeData = obj.data || undefined;
    path = obj.path || undefined;
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

  def.path = function () {

    return path;
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

  var checkPermissions, checkParams, doPrefetch, buildRouterConfig, updatePath,
      buildPathsConfig, hasPath, convertToPathTemplate, pathParams, cleanPath,
      def = {},
      routerConfig = {},
      pathsConfig = {},
      startEvent = KLOY_ROUTER_EVENTS.ROUTE_CHANGE_START,
      successEvent = KLOY_ROUTER_EVENTS.ROUTE_CHANGE_SUCCESS,
      errorEvent = KLOY_ROUTER_EVENTS.ROUTE_CHANGE_ERROR,
      isPaused = false;

  /*
    Cleans a path to be in a standard format.
  */
  cleanPath = function (path) {

    // dump(path);
    path = path.trim();
    // replace multiple spaces with single space
    path = path.replace(/ +(?= )/g, '');
    // replace all spaces with %20
    path = path.replace(/ /g, '%20');
    // replace double slashes with single slash
    path = path.replace(/([^:]\/)\/+/g, "$1");
    path = path.toLowerCase();
    // Ensure first char is /
    path = path.charAt(0) !== '/' ? '/' + path : path;
    // Ensure last char is not /
    path = (
      path.charAt(path.length - 1) === '/' ?
      path.substring(0, path.length - 1) : path
    );

    return path;
  };

  buildRouterConfig = function () {

    ng.forEach(routes, function (configFns, routeName) {

      var config, helpers;

      config = routerConfig[routeName] || {};

      helpers = {
        permissions: function (listOfPermissions) {

          if (ng.isDefined(listOfPermissions)) {
            config.permissions = listOfPermissions;
          }

          return config.permissions;
        },
        requireParams: function (params) {

          if (ng.isDefined(params)) {
            config.requiredParams = params;
          }

          return config.requiredParams;
        },
        prefetch: function (fn) {

          if (ng.isDefined(fn)) {
            config.prefetchFn = fn;
          }

          return config.prefetchFn;
        },
        data: function (obj) {

          if (ng.isDefined(obj)) {
            config.data = ng.copy(obj);
          }

          return config.data;
        },
        path: function (path) {

          if (ng.isDefined(path)) {
            config.path = cleanPath(path);
          }

          return config.path;
        }
      };

      configFns.forEach(function (configFn) {

        configFn.bind(helpers)();
      });

      routerConfig[routeName] = config;
    });
  };

  buildPathsConfig = function () {

    ng.forEach(routerConfig, function (routeConfig, routeName) {

      var path = routeConfig.path;

      if (ng.isDefined(path)) {
        if (path in pathsConfig) {
          throw "router.buildPathsConfig(): path already defined for route " +
            pathsConfig[path] + " cannot define duplicate for route " +
            routeName;
        }
        pathsConfig[path] = routeName;
      }
    });
  };

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
        throw "router.checkPermissions(): unknown permission " +
          permissionName;
      }

      try {
        promise = $injector.invoke(permissionFn);
      } catch (err) {
        $log.error(
          'router.checkPermissions(): problem invoking permission',
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
      throw "router.prefetch(): argument must be a function or undefined";
    }

    try {
        prefetching = $injector.invoke(prefetchFn);
      } catch (err) {
      $log.error(
        'router.doPrefetch(): problem invoking prefetch',
        err
      );
      throw err;
    }

    return prefetching;
  };

  updatePath = function (pathTemplate, params) {

    var splitPath = [];
    var path;

    if (ng.isUndefined(pathTemplate)) { return; }

    pathTemplate.split('/').forEach(function (segment) {

      if (segment.charAt(0) === ':') {
        splitPath.push(params[segment.substr(1)]);
      } else {
        splitPath.push(segment);
      }
    });

    path = splitPath.join('/');
    $location.path(path);
  };

  /*
    Checks if path exists in router config
  */
  hasPath = function (path) {

    if (ng.isDefined(pathsConfig[path])) {
      return true;
    }

    if (convertToPathTemplate(path) !== false) {
      return true;
    }

    return false;
  };

  /*
    Converts path to path template

    Returns

    - path template
    - false for no matched path template
  */
  convertToPathTemplate = function (path) {

    var foundPathTemplate = false;
    var splitPath = path.split('/');
    var pathTemplates = Object.keys(pathsConfig);

    pathTemplates.every(function (pathTemplate) {

      var splitPathTemplate = pathTemplate.split('/');
      var splitTestPath = [];
      var testPath;

      if (splitPathTemplate.length !== splitPath.length) {
        return true;
      }

      splitPathTemplate.forEach(function (segment, index) {

        if (segment.charAt(0) === ':') {
          splitTestPath.push(splitPath[index]);
        }
        else {
          splitTestPath.push(segment);
        }
      });

      testPath = splitTestPath.join('/');
      if (testPath !== path) {
        return true;
      }

      foundPathTemplate = pathTemplate;

      return false;
    });

    return foundPathTemplate;
  };

  /*
    Retrieve params from a path
  */
  pathParams = function (pathTemplate, path) {

    var params,
        splitPathTemplate = pathTemplate.split('/'),
        splitPath = path.split('/');

    splitPathTemplate.forEach(function (segment, index) {

      if (segment.charAt(0) !== ':') {
        return;
      }

      params = params || {};
      params[segment.substr(1)] = splitPath[index];
    });

    return params;
  };

  /*
    Navigates to a route when passed a path.
  */
  def.toPath = function (path) {

    var pathExists, pathTemplate, routeName, params;

    path = cleanPath(path);
    pathExists = hasPath(path);

    if (!pathExists) {
      $rootScope.$broadcast(errorEvent,
        {
          type: 'unknown_path',
          message: 'Path ' + path + ' does not match a route'
        },
        undefined,
        kloyRoute
      );
      return $q.reject('unknown_path');
    }

    pathTemplate = convertToPathTemplate(path);
    routeName = pathsConfig[pathTemplate];
    params = pathParams(pathTemplate, path);

    return def.toRoute(routeName, params);
  };

  /*
    Navigates to given route with passed params.
  */
  def.toRoute = function (routeName, params) {

    var promise, msg, previousErr, routeConfig;

    routeConfig = routerConfig[routeName];

    if (ng.isUndefined(routeConfig)) {
      throw 'router.toRoute() unknown route ' + routeName;
    }

    if (isPaused) {
      msg = 'router.toRoute(): paused, cannot go to ' + routeName;
      $log.debug(msg);
      return $q.reject(msg);
    }

    $rootScope.$broadcast(startEvent, routeName, kloyRoute);

    previousErr = false;
    promise = checkPermissions(routeConfig.permissions).
      then(
        function () {

          return checkParams(params, routeConfig.requiredParams);
        },
        function (err) {

          if (previousErr) { return $q.reject(err); }

          $log.debug('router.toRoute(): permissions error', err, routeName);
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

          return doPrefetch(routeConfig.prefetchFn);
        },
        function (err) {

          if (previousErr) { return $q.reject(err); }

          $log.debug('router.toRoute(): params error', err, routeName);
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

          $log.debug('router.toRoute(): prefetch error', err, routeName);
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

          var path = routeConfig.path;

          kloyRoute._update({
            params: params,
            name: routeName,
            data: routeConfig.data,
            path: path
          });
          updatePath(path, params);

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

  buildRouterConfig();
  buildPathsConfig();

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
      throw "routerProvider.addPermission(): permission already defined";
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