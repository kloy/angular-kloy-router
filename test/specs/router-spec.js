describe('A Router', function () {

  beforeEach(function () {

    module('kloy.router');
  });

  it('should navigate to routes and broadcast success event', function () {

    module(function (kloyRouterProvider) {

      kloyRouterProvider.route('home', function () {});
    });

    var $i = injector(),
        router = $i.get('kloyRouter'),
        scope = $i.get('$rootScope'),
        events = $i.get('KLOY_ROUTER_EVENTS'),
        result = 'not called';

    scope.$on(events.ROUTE_CHANGE_SUCCESS, function (e, name) {
      result = name;
    });
    router.go('home');
    $apply();
    expect(result).toBe('home');
  });

  it('should throw exception when navigating to unknown route', function () {

    var router = injector().get('kloyRouter');

    function test () {
      router.go('unknown.route');
    }

    expect(test).toThrow();
  });

  it('should throw exception when registering duplicate route', function () {

    module(function (kloyRouterProvider) {

      kloyRouterProvider.route('home', function () {});
    });

    function test () {
      module(function (kloyRouterProvider) {

        kloyRouterProvider.route('home', function () {});
      });
      injector().get('kloyRouter');
    }

    expect(test).toThrow();
  });

  xit('should allow modifying already defined route', function () {

    module(function (kloyRouterProvider) {

      kloyRouterProvider.
        route('home', function () {

          this.path('/home');
        }).
        modifyRoute('home', function () {

          this.path('/home2');
        });
    });

    var $i = injector(),
        router = $i.get('kloyRouter'),
        $location = $i.get('$location');

    router.go('home');
    expect($location.path()).toBe('/home2');
  });

  it(
    'should throw exception when attempting to modify undefined route',
    function () {

      function test () {
        module(function (kloyRouterProvider) {
          kloyRouterProvider.modifyRoute('home', function () {});
        });
        injector().get('kloyRouter');
      }

      expect(test).toThrow();
    });

  it('should prevent route changes when paused', function () {

    module(function (kloyRouterProvider) {
      kloyRouterProvider.route('home', function () {});
    });

    var $i = injector(),
        router = $i.get('kloyRouter'),
        successEvent = $i.get('KLOY_ROUTER_EVENTS').ROUTE_CHANGE_SUCCESS,
        scope = $i.get('$rootScope'),
        result = 'not called';

    scope.$on(successEvent, function () {
      result = 'called';
    });
    router.pause();
    router.go('home');
    $apply();

    expect(result).toBe('not called');
  });

  it('should allow route changes when unpaused', function () {

    module(function (kloyRouterProvider) {
      kloyRouterProvider.
        route('home', function () {}).
        route('about', function () {});
    });

    var $i = injector(),
        router = $i.get('kloyRouter'),
        successEvent = $i.get('KLOY_ROUTER_EVENTS').ROUTE_CHANGE_SUCCESS,
        scope = $i.get('$rootScope'),
        result = 'not called';

    scope.$on(successEvent, function (e, name) {
      result = name;
    });
    router.pause();
    router.go('home');
    $apply();
    expect(result).toBe('not called');

    router.play();
    router.go('about');
    $apply();
    expect(result).toBe('about');
  });
});
