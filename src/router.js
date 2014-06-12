var ng = require('ng');

var router = function (
  routes, permissions, $injector, $location, $rootScope, KLOY_ROUTER_EVENTS,
  $log, $q, kloyRoute
) {

  var checkPermissions, checkParams, doPrefetch, buildRouterConfig, updatePath,
      buildPathsConfig, hasPath, convertToPathTemplate, pathParams,
      def = {},
      routerConfig = {},
      pathsConfig = {},
      startEvent = KLOY_ROUTER_EVENTS.ROUTE_CHANGE_START,
      successEvent = KLOY_ROUTER_EVENTS.ROUTE_CHANGE_SUCCESS,
      errorEvent = KLOY_ROUTER_EVENTS.ROUTE_CHANGE_ERROR,
      isPaused = false;

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
            config.path = path;
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

    var params;
    var splitPathTemplate = pathTemplate.split('/');
    var splitPath = path.split('/');

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
  def.goByPath = function (path) {

    var pathExists = hasPath(path);
    var pathTemplate;
    var routeName;
    var params;

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

    return def.go(routeName, params);
  };

  /*
    Navigates to given route with passed params.
  */
  def.go = function (routeName, params) {

    var promise, msg, previousErr, routeConfig;

    routeConfig = routerConfig[routeName];

    if (ng.isUndefined(routeConfig)) {
      throw 'router.go() unknown route ' + routeName;
    }

    if (isPaused) {
      msg = 'router.go(): paused, cannot go to ' + routeName;
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

          $log.debug('router.go(): permissions error', err, routeName);
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

          $log.debug('router.go(): params error', err, routeName);
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

          $log.debug('router.go(): prefetch error', err, routeName);
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

  def.$get = /*@ngInject*/function (
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
  };

  return def;
};

module.exports = routerProvider;
