var ng = require('ng');

var router = function (
  routes, permissions, $injector, $location, $rootScope, KLOY_ROUTER_EVENTS,
  $log, $q, kloyRoute
) {

  var checkPermissions, checkParams, doPrefetch, buildRouterConfig, updatePath,
      buildPathsConfig, hasPath, convertToPathTemplate, pathParams, cleanPath,
      hasAllValues,
      def = {},
      routerConfig = {},
      pathsConfig = {},
      startEvent = KLOY_ROUTER_EVENTS.ROUTE_CHANGE_START,
      successEvent = KLOY_ROUTER_EVENTS.ROUTE_CHANGE_SUCCESS,
      errorEvent = KLOY_ROUTER_EVENTS.ROUTE_CHANGE_ERROR,
      isPaused = false;

  /*
    I check to see if an array has all of the values passed
  */
  hasAllValues = function (iArray, values) {

    var iArrayCache = {}, passed = true;

    iArray.forEach(function (val) {

      iArrayCache[val] = true;
    });

    values.every(function (val) {

      if (iArrayCache.hasOwnProperty(val)) {
        return true;
      }

      passed = false;
      return false;
    });

    return passed;
  };

  /*
    I clean/format a path to be in a standard format.
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

  /*
    I build the router configuration object
  */
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
        requiredParams: function (params) {

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

      config.requiredParams = config.requiredParams || [];

      configFns.forEach(function (configFn) {

        configFn.bind(helpers)();
      });

      routerConfig[routeName] = config;
    });
  };

  /*
    I build the path configuration object
  */
  buildPathsConfig = function () {

    ng.forEach(routerConfig, function (routeConfig, routeName) {

      var path = routeConfig.path;

      if (ng.isDefined(path)) {
        if (path in pathsConfig) {
          throw new Error(
            "router.buildPathsConfig(): path already defined for route " +
            pathsConfig[path] + " cannot define duplicate for route " +
            routeName
          );
        }
        pathsConfig[path] = routeName;
      }
    });
  };

  /*
    I async a list of permissions and return a promise
  */
  checkPermissions = function (permissionNames) {

    var stubPermission, allPermissions = [];
    permissionNames = permissionNames || [];

    stubPermission = $q.defer();
    stubPermission.resolve();
    allPermissions.push(stubPermission.promise);

    permissionNames.forEach(function (permissionName) {

      var permissionFn, promise;

      permissionFn = permissions[permissionName];

      if (ng.isUndefined(permissionFn)) {
        throw new Error(
          "router.checkPermissions(): unknown permission " +
          permissionName
        );
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

  /*
    I async check passed params against required params and return a promise
  */
  checkParams = function (params, requiredParams) {

    var dfd = $q.defer(), paramKeys;

    params = params || {};
    paramKeys = Object.keys(params);

    if (requiredParams.length === 0) {
      dfd.resolve();
      return dfd.promise;
    }

    if (!hasAllValues(paramKeys, requiredParams)) {

      return $q.reject('missing required param(s)');
    }

    dfd.resolve();
    return dfd.promise;
  };

  /*
    I allow any async operation to be performed and return a promise.
    I should be used for doing preload type functionality before a route
    change.
  */
  doPrefetch = function (prefetchFn) {

    var prefetching, dfd;

    if (ng.isUndefined(prefetchFn)) {
      dfd = $q.defer();
      dfd.resolve();
      return dfd.promise;
    }
    else if (! ng.isFunction(prefetchFn) && ! ng.isArray(prefetchFn)) {
      throw new Error(
        "router.prefetch(): argument must be a function, array or undefined"
      );
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

  /*
    I update the $location.path
  */
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
    I check if path exists in router config
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
    I convert a path to path template

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
    I retrieve params from a path
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
    I navigate to a route when passed a path.
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
    I navigate to given route with passed params.
  */
  def.toRoute = function (routeName, params) {

    var promise, msg, previousErr, routeConfig;

    routeConfig = routerConfig[routeName];

    if (ng.isUndefined(routeConfig)) {
      throw new Error('router.toRoute() unknown route ' + routeName);
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

  /*
    I get the path for a given route name. When passed route params I
    interpolate them onto the path's template segments. Returns null when
    path is not defined for route.

    Returns
     - string path
     - null
  */
  def.getPathFor = function (routeName, routeParams) {

    var routeConfig, path, routeParamKeys;

    routeParams = routeParams || {};
    routeParamKeys = Object.keys(routeParams);
    routeConfig = routerConfig[routeName];

    if (ng.isDefined(routeConfig)) {
      path = routeConfig.path || null;
    } else {
      throw new Error("router.getPathFor(): Unknown route " + routeName);
    }

    if (! hasAllValues(routeParamKeys, routeConfig.requiredParams)) {
      throw new Error(
        "router.getPathFor(): Missing required params for " + routeName
      );
    }

    ng.forEach(routeParams, function (paramVal, paramName) {

      path = path.replace(':' + paramName, paramVal);
    });

    return path;
  };

  /*
    I prevent route from making any changes when called
  */
  def.pause = function () {

    isPaused = true;

    return def;
  };

  /*
    I allow routing changes to take place for future calls.
  */
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

  /*
    I define a route and add a configuration function for it
  */
  def.addRoute = function (name, configFn) {

    if (name in routes) {
      throw new Error(
        'routerProvider.addRoute() route already defined ' + name
      );
    }

    routes[name] = [configFn];

    return def;
  };

  /*
    I allow modification to a route and add an additional configuration
    function for it
  */
  def.modifyRoute = function (name, configFn) {

    if (ng.isUndefined(routes[name])) {
      throw new Error(
        'routerProvider.modifyRoute() route not defined ' + name
      );
    }

    routes[name].push(configFn);

    return def;
  };

  /*
    I define a permission and add a configuration function for it
  */
  def.addPermission = function (name, configFn) {

    if (name in permissions) {
      throw new Error(
        "routerProvider.addPermission(): permission already defined"
      );
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
