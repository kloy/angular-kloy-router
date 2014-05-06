var ng = require('ng');

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
