var ng = require('ng');

var router = function (
  routes, $injector, $location, $rootScope, KLOY_ROUTER_EVENTS
) {

  var def = {},
      successEvent = KLOY_ROUTER_EVENTS.ROUTE_CHANGE_SUCCESS,
      isPaused = false;

  def.go = function (routeName) {

    var path, helpers = {}, configFns;

    // helpers.path = function (_path) {

    //    path = _path;
    // };

    configFns = routes[routeName];

    if (! ng.isArray(configFns)) {
      throw 'router.go() unknown route ' + routeName;
    }

    configFns.forEach(function (configFn) {

      $injector.invoke(configFn, helpers);
    });

    // if (ng.isString(path)) {
    //   $location.path(path);
    // }

    if (! isPaused) {
      $rootScope.$broadcast(successEvent, routeName);
    }

    return def;
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

  var def = {}, routes = {};

  def.route = function (name, configFn) {

    if (name in routes) {
      throw 'routerProvider.route() route already defined ' + name;
    }

    routes[name] = [configFn];

    return def;
  };

  def.modifyRoute = function (name, configFn) {

    if (!ng.isArray(routes[name])) {
      throw 'routerProvider.modifyRoute() route undefined ' + name;
    }

    routes[name].push(configFn);

    return def;
  };

  def.$get = /*@ngInject*/function (
    $injector, $location, $rootScope, KLOY_ROUTER_EVENTS
  ) {

    return router(routes, $injector, $location, $rootScope, KLOY_ROUTER_EVENTS);
  };

  return def;
};

module.exports = routerProvider;
