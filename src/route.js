/*
  I provide helper methods for accessing the current route's information
*/
var ng = require('ng');

var route = /*@ngInject*/function () {

  var def = {}, params, name, routeData, path;

  /*
    I am an internal method that should only be used by kloyRouter to update
    current route information.
  */
  def._update = function (obj) {

    params = obj.params || undefined;
    name = obj.name || undefined;
    routeData = obj.data || undefined;
    path = obj.path || undefined;
  };

  /*
    I expose the current route's params
  */
  def.params = function () {

    return params;
  };

  /*
    I expose the current route's name
  */
  def.name = function () {

    return name;
  };

  /*
    I expose the current route's data
  */
  def.data = function () {

    return ng.copy(routeData);
  };

  /*
    I expose the current route's configured path
  */
  def.path = function () {

    return path;
  };

  /*
    I check if a value is the current route's name
  */
  def.is = function (val) {

    return (def.name() === val);
  };

  /*
    I check if a value is not the current route's name
  */
  def.not = function (val) {

    return (! def.is(val));
  };

  /*
    I check if a value is included in the current route's name
  */
  def.includes = function (val) {

    return (def.name().indexOf(val) !== -1);
  };

  /*
    I check if a value is not included in the current route's name
  */
  def.excludes = function (val) {

    return (! def.includes(val));
  };

  /*
    I check if the current route's name starts with given value
  */
  def.startsWith = function (val) {

    return (def.name().substring(0, val.length) === val);
  };

  /*
    I check if a value is the ending of the current route's name
  */
  def.endsWith = function (val) {

    var name = def.name();

    return (name.substring(name.length - val.length) === val);
  };

  return def;
};

module.exports = route;
