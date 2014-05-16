var ng = require('ng');

function StateRouter (
  config, registeredPermissions, paused, $rootScope, stateModel, $q, $injector,
  KLOY_ROUTER_EVENTS
) {

  var checkPermissions, checkParams;

  // Check that all permissions are resolved.
  checkPermissions = function (permissions) {

    var promises = [];

    permissions.forEach(function (permission) {

      var permissionFn = registeredPermissions[permission];
      var promise = $injector.invoke(permissionFn);

      promises.push(promise);
    });

    return $q.all(promises);
  };

  checkParams = function (state, params) {

    var allowedParams = (config[state].allowedParams || []).sort(),
        paramKeys = Object.keys(params || {}).sort(),
        passes = true;

    if (allowedParams.length !== paramKeys.length) {
      return false;
    }

    allowedParams.every(function (param) {

      if (allowedParams.indexOf(param) !== -1) {
        return true;
      }

      passes = false;
      return false;
    });

    return passes;
  };

  this.isPaused = function () {

    return paused;
  };

  this.pause = function () {

    paused = true;
    $rootScope.$broadcast(KLOY_ROUTER_EVENTS.STATE_ROUTER_PAUSED, stateModel);

    return this;
  };

  this.play = function () {

    paused = false;
    $rootScope.$broadcast(
      KLOY_ROUTER_EVENTS.STATE_ROUTER_PLAYING,
      stateModel
    );

    return this;
  };

  // Go to a state
  this.go = function (state, params) {

    var permissions, changeState, failState, defer, promise, prefetchFn;

    changeState = function () {

      stateModel.name(state);
      stateModel.params(params || {});
      stateModel.data(config[state].data || {});
      stateModel.permissions(config[state].permissions || []);
      $rootScope.$broadcast(
        KLOY_ROUTER_EVENTS.STATE_CHANGE_SUCCESS,
        stateModel
      );
    };

    failState = function (err) {

      $rootScope.$broadcast(
        KLOY_ROUTER_EVENTS.STATE_CHANGE_ERROR,
        err,
        stateModel
      );
    };

    // Prevent changing state when paused.
    if (this.isPaused()) {
      return;
    }

    if (ng.isUndefined(config[state])) {
      throw "StateRouter.go() unknown state: " + state;
    }

    if (! checkParams(state, params)) {
      throw "StateRouter.go() malformatted params for state: " + state;
    }

    defer = $q.defer();
    defer.resolve();
    promise = defer.promise;

    permissions = config[state].permissions;

    if (ng.isDefined(permissions)) {
      promise = promise.then(function () {

        return checkPermissions(permissions);
      });
    }

    prefetchFn = config[state].prefetch;
    if (ng.isFunction(prefetchFn)) {
      promise = promise.then(function () {

        return $injector.invoke(prefetchFn);
      });
    }

    promise.then(changeState, failState);

    return this;
  };
}

function StateRouterProvider () {

  this._config = {};
  this._permissions = {};
  this._paused = false;

  this.pause = function () {

    this._paused = true;

    return this;
  };

  this.play = function () {

    this._paused = false;

    return this;
  };

  this.state = function (state, config) {

    if (state in this._config) {
      throw "StateRouterProvider.state() duplicate state definition: " + state;
    }

    this._config[state] = config || {};

    return this;
  };

  this.permission = function (permission, fn) {

    var errMsg;

    if (permission in this._permissions) {
      errMsg = "StateRouterProvider.permission() duplicate permission ";
      errMsg += "definition: " + permission;
      throw errMsg;
    }

    this._permissions[permission] = fn;

    return this;
  };

  /*@ngInject*/
  this.$get =function ($rootScope, stateModel, $q, $injector, KLOY_ROUTER_EVENTS) {

    return new StateRouter(
      this._config,
      this._permissions,
      this._paused,
      $rootScope,
      stateModel,
      $q,
      $injector,
      KLOY_ROUTER_EVENTS
    );
  };
}

module.exports = StateRouterProvider;
