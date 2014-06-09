describe('A Router', function () {

  beforeEach(function () {

    module('kloy.router');
  });

  it('should navigate to routes and broadcast success event', function () {

    module(function (kloyRouterProvider) {

      kloyRouterProvider.addRoute('home', function () {});
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

      kloyRouterProvider.addRoute('home', function () {});
      kloyRouterProvider.addRoute('home', function () {});
    });

    expect(inject).toThrow();
  });

  it('should prevent route changes when paused', function () {

    module(function (kloyRouterProvider) {
      kloyRouterProvider.addRoute('home', function () {});
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
        addRoute('home', function () {}).
        addRoute('about', function () {});
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

  it(
    'should check all configured permissions before transitioning to route',
    function () {

      var permissionChecked1 = 'permission not checked';
      var permissionChecked2 = 'permission not checked';

      module(function (kloyRouterProvider) {

        kloyRouterProvider.
          addPermission('password', function ($q) {

            permissionChecked1 = 'permission checked';
            var dfd = $q.defer();
            dfd.resolve();
            return dfd.promise;
          }).
          addPermission('nonsense', function ($q) {

            permissionChecked2 = 'permission checked';
            var dfd = $q.defer();
            dfd.resolve();
            return dfd.promise;
          }).
          addRoute('home', function () {

            this.permissions(['password', 'nonsense']);
          });
      });

      var $i = injector(),
          router = $i.get('kloyRouter');

      router.go('home');
      $apply();

      expect(permissionChecked1).toBe('permission checked');
      expect(permissionChecked2).toBe('permission checked');
  });

  it(
    'should throw exception when registering duplicate permissions',
    function () {

      module(function (kloyRouterProvider) {

        kloyRouterProvider.
          addPermission('same', function () {}).
          addPermission('same', function () {});
      });

      expect(inject).toThrow();
    }
  );

  it(
    'should prevent route change and broadcast error when permissions fail',
    function () {

      module(function (kloyRouterProvider) {

        kloyRouterProvider.
          addPermission('fail', function ($q) {

            return $q.reject('you are a failure');
          }).
          addRoute('base', function () {

            this.permissions(['fail']);
          });
      });

      var $i = injector(),
          router = $i.get('kloyRouter'),
          scope = $i.get('$rootScope'),
          events = $i.get('KLOY_ROUTER_EVENTS'),
          result = 'not called';

      scope.$on(events.ROUTE_CHANGE_ERROR, function (e, err) {

        result = err.message;
      });
      router.go('base');
      $apply();

      expect(result).toBe('you are a failure');
    }
  );

  it ('should navigate to route with params', function () {

    module(function (kloyRouterProvider) {

      kloyRouterProvider.addRoute('params', function () {});
    });

    var $i = injector(),
        router = $i.get('kloyRouter'),
        route = $i.get('kloyRoute');

    router.go('params', {id: 'abcd'});
    $apply();

    expect(route.params()).toEqual({id: 'abcd'});
  });

  it('should enforce required params', function () {

    module(function (kloyRouterProvider) {

      kloyRouterProvider.addRoute('params', function () {

        this.requireParams(['id', 'name', 'age']);
      });
    });

    var $i = injector(),
        router = $i.get('kloyRouter'),
        scope = $i.get('$rootScope'),
        events = $i.get('KLOY_ROUTER_EVENTS'),
        result = 'not called';

    scope.$on(events.ROUTE_CHANGE_ERROR, function (e, err) {

      result = err.message;
    });
    router.go('params', {name: 'awesome'});
    $apply();

    expect(result).toBe('missing required param(s) id, age');
  });

  it('should prefetch before changing states', function () {

    var result = 'not called';

    module(function (kloyRouterProvider) {

      kloyRouterProvider.addRoute('home', function () {

        this.prefetch(function ($q) {

          var dfd = $q.defer();
          dfd.resolve();
          result = 'prefetched';
          return dfd.promise;
        });
      });
    });

    var router = injector().get('kloyRouter');
    router.go('home');
    $apply();

    expect(result).toBe('prefetched');
  });

  it(
    'should prevent route change and broadcast error when prefetch fails',
    function () {

      module(function (kloyRouterProvider) {

        kloyRouterProvider.addRoute('home', function () {

          this.prefetch(function ($q) {

            return $q.reject('prefetch failed');
          });
        });
      });

      var $i = injector(),
          router = $i.get('kloyRouter'),
          scope = $i.get('$rootScope'),
          events = $i.get('KLOY_ROUTER_EVENTS'),
          route = $i.get('kloyRoute'),
          result = 'not called';

      scope.$on(events.ROUTE_CHANGE_ERROR, function (e, err) {
        result = err.type;
      });
      router.go('home');
      $apply();

      expect(result).toBe('prefetch');
      expect(route.name()).not.toBeDefined();
    }
  );

  it('should broadcast start event when navigating to route', function () {

    module(function (kloyRouterProvider) {

      kloyRouterProvider.addRoute('home', function () {});
    });

    var $i = injector(),
        router = $i.get('kloyRouter'),
        scope = $i.get('$rootScope'),
        events = $i.get('KLOY_ROUTER_EVENTS'),
        result = 'not called';

    scope.$on(events.ROUTE_CHANGE_START, function (e, routeName) {
      result = routeName;
    });
    router.go('home');
    $apply();

    expect(result).toBe('home');
  });

  it(
    'should attempt route transition when kloyRouteChangeRequest is heard',
    function () {

      module(function (kloyRouterProvider) {
        kloyRouterProvider.addRoute('home', function () {});
      });

      var $i = injector(),
          scope = $i.get('$rootScope'),
          events = $i.get('KLOY_ROUTER_EVENTS'),
          requestEvent = events.ROUTE_CHANGE_REQUEST,
          successEvent = events.ROUTE_CHANGE_SUCCESS,
          result;

      scope.$on(successEvent, function (e, name) {
        result = name;
      });
      scope.$broadcast(requestEvent, 'home');
      $apply();

      expect(result).toBe('home');
    }
  );

  it('should allow modifying already defined route', function () {

    module(function (kloyRouterProvider) {
      kloyRouterProvider.
        addRoute('base', function () {

          this.data({name: 'bob'});
        }).
        modifyRoute('base', function () {

          this.data({name: 'keith'});
        });
    });

    var $i = injector(),
        router = $i.get('kloyRouter'),
        route = $i.get('kloyRoute');

    router.go('base');
    $apply();

    expect(route.data()).toEqual({name: 'keith'});
  });

  it(
    'should throw exception when attempting to modify undefined route',
    function () {

      module(function (kloyRouterProvider) {
        kloyRouterProvider.modifyRoute('home', function () {});
      });

      expect(inject).toThrow();
    });
});
