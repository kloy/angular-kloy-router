var routeDirective = /*@ngInject*/function (
  $log, kloyRouter, $compile, $rootScope, $parse
) {

  var def = {
    restrict: 'A'
  };

  var isAnchor = function (el) {

    return el[0].tagName.toUpperCase() === 'A';
  };

  $rootScope.krToRoute = function (routeName, routeParams) {

    kloyRouter.toRoute(routeName, routeParams);
  };

  def.link = function (scope, el, attrs) {

    var routeName, routeParams, path, update;

    update = function () {

      routeName = $parse(attrs.krRoute)(scope);
      routeParams = attrs.krParams ? $parse(attrs.krParams)(scope) : undefined;
      path = kloyRouter.getPathFor(routeName, routeParams);

      if (isAnchor(el)) {
        attrs.$set('href', path ? '#' + path : '');
      }
    };

    scope.$watch(attrs.krRoute, update);
    scope.$watch(attrs.krParams, update);

    el.on('click', function () {

      kloyRouter.toRoute(routeName, routeParams);
    });
  };

  return def;
};

module.exports = routeDirective;
