var routeDirective = /*@ngInject*/function (
  $log, kloyRouter, $compile, $rootScope, $parse
) {

  var def = {
    restrict: 'A'
  };

  var isAnchor = function (el) {

    return el[0].tagName.toUpperCase() === 'A';
  };

  $rootScope.srToRoute = function (routeName, routeParams) {

    kloyRouter.toRoute(routeName, routeParams);
  };

  def.link = function (scope, el, attrs) {

    var routeName, routeParams, path, update;

    update = function () {

      routeName = $parse(attrs.srRoute)(scope);
      routeParams = attrs.srParams ? $parse(attrs.srParams)(scope) : undefined;
      path = kloyRouter.getPathFor(routeName, routeParams);

      if (isAnchor(el)) {
        attrs.$set('href', '#' + path || '');
      }
    };

    scope.$watch(attrs.srRoute, update);
    scope.$watch(attrs.srParams, update);

    el.on('click', function () {

      kloyRouter.toRoute(routeName, routeParams);
    });
  };

  return def;
};

module.exports = routeDirective;
