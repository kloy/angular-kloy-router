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
