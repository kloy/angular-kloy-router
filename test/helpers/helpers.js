function injector () {
  var $injector;

  inject(function (_$injector_) {

    $injector = _$injector_;
  });

  return $injector;
}

function $apply () {

  injector().get('$rootScope').$apply();
}

var noop = angular.noop;
