var rrefDirective = /*@ngInject*/function (
  $log, kloyRouter, $compile, $rootScope
) {

  var def = {
    restrict: 'A'
  };

  var isAnchor = function (el) {

    return el[0].tagName.toUpperCase() === 'A';
  };

  $rootScope.kloyToRoute = function (routeName, routeParams) {

    kloyRouter.toRoute(routeName, routeParams);
  };

  def.compile = function (tEl, tAttrs) {

    var ngClickValue = 'kloyToRoute(' + tAttrs.kloyRref;
    ngClickValue = (
      tAttrs.kloyRrefParams ?
      ngClickValue + ', ' + tAttrs.kloyRrefParams + ')' :
      ngClickValue + ')'
    );

    tAttrs.$set('ngClick', ngClickValue);
    if (isAnchor(tEl)) {
      tAttrs.$set('href', '');
    }
    tAttrs.$set('kloyRref', null);
    tAttrs.$set('kloyRrefParams', null);

    return function (scope, el) {

      var clone, reCompiled;

      clone = el.clone();
      reCompiled = $compile(clone)(scope);
      el.replaceWith(reCompiled);
    };
  };

  return def;
};

module.exports = rrefDirective;
