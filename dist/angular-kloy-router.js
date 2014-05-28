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
    'STATE_CHANGE_SUCCESS': 'stateChangeSuccess',
    'STATE_CHANGE_ERROR': 'stateChangeError',
    'STATE_CHANGE_REQUEST': 'stateChangeRequest',
    'STATE_ROUTER_PAUSED': 'stateRouterPaused',
    'STATE_ROUTER_PLAYING': 'stateRouterPlaying'
  }).
  provider('stateRouter', require('./state-router')).
  provider('layoutManager', require('./layout-manager')).
  service('stateModel', require('./state-model')).
  run(/*@ngInject*/["layoutManager", "$rootScope", "KLOY_ROUTER_EVENTS", function (layoutManager, $rootScope, KLOY_ROUTER_EVENTS) {

    $rootScope.section = function (section) {

      return layoutManager.sections()[section] || null;
    };

    $rootScope.$on(
      KLOY_ROUTER_EVENTS.STATE_CHANGE_SUCCESS,
      layoutManager.sync
    );
  }]).
  run(/*@ngInject*/["$rootScope", "stateRouter", "KLOY_ROUTER_EVENTS", function ($rootScope, stateRouter, KLOY_ROUTER_EVENTS) {

    function listener (e, state, params) {

      stateRouter.go(state, params);
    }

    $rootScope.$on(KLOY_ROUTER_EVENTS.STATE_CHANGE_REQUEST, listener);
  }]);

},{"./layout-manager":1,"./state-model":5,"./state-router":6,"ng":"QBxXRv"}],5:[function(require,module,exports){
var ng = require('ng');

/*@ngInject*/
function StateModel () {

  var name = '',
      data = {},
      permissions = [],
      params = {};

  this.name = function (_name) {

    if (ng.isDefined(_name)) {
      name = _name;
    }

    return name;
  };

  this.data = function (_data) {

    if (ng.isObject(_data)) {
      data = ng.copy(_data);
    }

    return ng.copy(data);
  };

  this.permissions = function (_permissions) {

    if (ng.isArray(_permissions)) {
      permissions = _permissions;
    }

    return permissions;
  };

  this.params = function (_params) {

    if (ng.isObject(_params)) {
      params = ng.copy(_params);
    }

    return ng.copy(params);
  };

  this.is = function (val) {

    return (this.name() === val);
  };

  this.not = function (val) {

    return (! this.is(val));
  };

  this.includes = function (val) {

    return (this.name().indexOf(val) !== -1);
  };

  this.excludes = function (val) {

    return (! this.includes(val));
  };

  this.startsWith = function (val) {

    return (this.name().substring(0, val.length) === val);
  };

  this.endsWith = function (val) {

    var name = this.name();

    return (name.substring(name.length - val.length) === val);
  };
}

module.exports = StateModel;

},{"ng":"QBxXRv"}],6:[function(require,module,exports){
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

  this.$get = /*@ngInject*/["$rootScope", "stateModel", "$q", "$injector", "KLOY_ROUTER_EVENTS", function (
    $rootScope, stateModel, $q, $injector, KLOY_ROUTER_EVENTS
  ) {

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
  }];
}

module.exports = StateRouterProvider;

},{"ng":"QBxXRv"}]},{},[4])