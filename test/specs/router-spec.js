describe('A Router', function () {

  beforeEach(function () {

    module('app', 'kloy.router');
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
    router.toRoute('home');
    $apply();
    expect(result).toBe('home');
  });

  it('should throw exception when navigating to unknown route', function () {

    var router = injector().get('kloyRouter');

    function test () {
      router.toRoute('unknown.route');
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
    router.toRoute('home');
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
    router.toRoute('home');
    $apply();
    expect(result).toBe('not called');

    router.play();
    router.toRoute('about');
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
          addPermission('password', ['$q', function ($q) {

            permissionChecked1 = 'permission checked';
            var dfd = $q.defer();
            dfd.resolve();
            return dfd.promise;
          }]).
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

      router.toRoute('home');
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

      // $locationChangeSuccess will be heard, so make sure it changes route
      // before we do.
      $apply();

      var $i = injector(),
          router = $i.get('kloyRouter'),
          scope = $i.get('$rootScope'),
          events = $i.get('KLOY_ROUTER_EVENTS'),
          result = 'not called';

      scope.$on(events.ROUTE_CHANGE_ERROR, function (e, err) {

        result = err.message;
      });
      router.toRoute('base');
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

    router.toRoute('params', {id: 'abcd'});
    $apply();

    expect(route.params()).toEqual({id: 'abcd'});
  });

  it('should enforce required params', function () {

    module(function (kloyRouterProvider) {

      kloyRouterProvider.addRoute('params', function () {

        this.requiredParams(['id', 'name', 'age']);
      });
    });

    // $locationChangeSuccess will be heard, so make sure it changes route
    // before we do.
    $apply();

    var $i = injector(),
        router = $i.get('kloyRouter'),
        scope = $i.get('$rootScope'),
        events = $i.get('KLOY_ROUTER_EVENTS'),
        result = 'not called';

    scope.$on(events.ROUTE_CHANGE_ERROR, function (e, err) {

      result = err.message;
    });
    router.toRoute('params', {name: 'awesome'});
    $apply();

    expect(result).toBe('missing required param(s)');
  });

  it('should preload a module before changing states', function (done) {

    module(function (kloyRouterProvider, $ocLazyLoadProvider) {

      $ocLazyLoadProvider.config({
        modules: [{
          name: 'home',
          files: ['../base/test/mocks/home-mock.js']
        }]
      });

      kloyRouterProvider.addRoute('home', function() {

        this.preload('home');
      });

    });

    var router = injector().get('kloyRouter');
    router.toRoute('home');
    $apply();

    var $ocLazyLoad = injector().get('$ocLazyLoad');

    waitsFor(function() {
      return $ocLazyLoad.isLoaded('home') === true;
    }, 'Module not loaded', 1500);

    runs(function() {
      expect($ocLazyLoad.isLoaded('home')).toBe(true);
    });
  });

  it('should preload modules before changing states', function () {

    module(function (kloyRouterProvider, $ocLazyLoadProvider) {

      $ocLazyLoadProvider.config({
        modules: [{
          name: 'home',
          files: ['../base/test/mocks/home-mock.js']
        }, {
          name: 'test',
          files: ['../base/test/mocks/test-mock.js']
        }]
      });

      kloyRouterProvider.addRoute('home', function() {

        this.preload(['home', 'test']);
      });

    });

    var router = injector().get('kloyRouter');
    router.toRoute('home');
    $apply();

    var $ocLazyLoad = injector().get('$ocLazyLoad');

    waitsFor(function() {
      return $ocLazyLoad.isLoaded('home') === true &&
        $ocLazyLoad.isLoaded('test') === true;
    }, 'Modules not loaded', 1500);

    runs(function() {
      expect($ocLazyLoad.isLoaded('home')).toBe(true);
      expect($ocLazyLoad.isLoaded('test')).toBe(true);
    });
  });

  it('should preload using a function that returns a promise before changing states', function () {

    var result = 'not called';

    module(function (kloyRouterProvider, $ocLazyLoadProvider) {

      kloyRouterProvider.addRoute('home', function() {

        this.preload(function ($q) {
          result = 'called';
          var dfd = $q.defer();
          dfd.resolve();
          return dfd.promise;
        });
      });

    });

    var router = injector().get('kloyRouter');
    router.toRoute('home');
    $apply();

    expect(result).toBe('called');
  });

  it('should preload modules before checking permissions', function () {

    var ordering = [];

    module(function (kloyRouterProvider) {

      kloyRouterProvider.
        addPermission('password', ['$q', function ($q) {

          ordering.push('permission');

          var dfd = $q.defer();
          dfd.resolve();

          return dfd.promise;
        }]).

        addRoute('home', function() {

          this.permissions(['password']);
          this.preload(function ($q) {

            ordering.push('preload');

            var dfd = $q.defer();
            dfd.resolve('Preloaded something');

            return dfd.promise;
          });

        });

    });

    var router = injector().get('kloyRouter');
    router.toRoute('home');
    $apply();

    var $ocLazyLoad = injector().get('$ocLazyLoad');

    expect(ordering).toEqual(['preload', 'permission']);
  });

  it('should prevent route change and broadcast error when preload fails', function () {

    module(function (kloyRouterProvider) {

      kloyRouterProvider.addRoute('home', function () {

        this.preload(function ($q) {
          var dfd = $q.defer();
          dfd.reject();
          return dfd.promise;
        });
      });
    });

    // $locationChangeSuccess will be heard, so make sure it changes route
    // before we do.
    $apply();

    var $i = injector(),
        router = $i.get('kloyRouter'),
        scope = $i.get('$rootScope'),
        events = $i.get('KLOY_ROUTER_EVENTS'),
        route = $i.get('kloyRoute'),
        result = 'not called';

    scope.$on(events.ROUTE_CHANGE_ERROR, function (e, err) {
      result = err.type;
    });
    router.toRoute('home');
    $apply();

    expect(result).toBe('preload');
    expect(route.name()).not.toBeDefined();
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
    router.toRoute('home');
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

      // $locationChangeSuccess will be heard, so make sure it changes route
      // before we do.
      $apply();

      var $i = injector(),
          router = $i.get('kloyRouter'),
          scope = $i.get('$rootScope'),
          events = $i.get('KLOY_ROUTER_EVENTS'),
          route = $i.get('kloyRoute'),
          result = 'not called';

      scope.$on(events.ROUTE_CHANGE_ERROR, function (e, err) {
        result = err.type;
      });
      router.toRoute('home');
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
    router.toRoute('home');
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

    router.toRoute('base');
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

  it('should update path when route changes', function () {

    module(function (kloyRouterProvider) {

      kloyRouterProvider.addRoute('base', function () {

        this.path('/home');
      });
    });

    var $i = injector(),
        router = $i.get('kloyRouter'),
        $location = $i.get('$location');

    expect($location.path()).toBe('');
    router.toRoute('base');
    $apply();
    expect($location.path()).toBe('/home');
  });

  it(
    'should change route when $locationChangeSuccess is broadcasted with ' +
    'matching path',
    function () {

      module(function (kloyRouterProvider) {

        kloyRouterProvider.addRoute('example', function () {

          this.path('/example');
        });
      });

      var $i = injector(),
          route = $i.get('kloyRoute'),
          $location = $i.get('$location');

      $location.path('/example');
      $apply();
      expect(route.name()).toBe('example');
    }
  );

  it(
    'should broadcast error when asked to change to unmatched path',
    function () {

      var $i = injector(),
          router = $i.get('kloyRouter'),
          scope = $i.get('$rootScope'),
          events = $i.get('KLOY_ROUTER_EVENTS'),
          result;

      scope.$on(events.ROUTE_CHANGE_ERROR, function (e, err) {

        result = err;
      });
      router.toPath('/unknown');
      $apply();
      expect(result.type).toBe('unknown_path');
    }
  );

  it('should match route when path includes params', function () {

    module(function (kloyRouterProvider) {

        kloyRouterProvider.addRoute('contact.delete', function () {

          this.path('/contacts/:id/delete');
        });
      });

      var $i = injector(),
          route = $i.get('kloyRoute'),
          $location = $i.get('$location');

      $location.path('/contacts/abcd/delete');
      $apply();
      expect(route.name()).toBe('contact.delete');
  });

  it(
    'should include params in route change when path includes params',
    function () {

      module(function (kloyRouterProvider) {

        kloyRouterProvider.addRoute('contact.delete', function () {

          this.path('/contacts/:id/delete');
        });
      });

      var $i = injector(),
          route = $i.get('kloyRoute'),
          $location = $i.get('$location');

      $location.path('/contacts/abcd/delete');
      $apply();
      expect(route.params()).toEqual({'id': 'abcd'});
    }
  );

  it('should interpolate path variables with route params', function () {

    module(function (kloyRouterProvider) {

      kloyRouterProvider.addRoute('contact.view', function () {

        this.path('/contacts/:id');
      });
    });

    var $i = injector(),
        router = $i.get('kloyRouter'),
        $location = $i.get('$location');

    router.toRoute('contact.view', {
      id: 'abcd'
    });
    $apply();

    expect($location.path()).toBe('/contacts/abcd');
  });

  it(
    'should lowercase, trim, replace spaces with %20 and remove unnecessary ' +
    'slashes from paths when matching to route',
    function () {

      module(function (kloyRouterProvider) {

        kloyRouterProvider.addRoute('test', function () {

          this.path('/MY/really//rediculous/:name//exa  mple');
        });
      });

      var $i = injector(),
          $location = $i.get('$location'),
          route = $i.get('kloyRoute');

      $location.path('MY/really/ReDiculous/aBCd/exa mple/');
      $apply();
      expect(route.name()).toBe('test');
      expect(route.params()).toEqual({name: 'abcd'});
    }
  );

  it(
    'should throw exception if same path is configured for multiple routes',
    function () {

      module(function (kloyRouterProvider) {

        kloyRouterProvider.
          addRoute('home', function () {

            this.path('/home');
          }).
          addRoute('base', function () {

            this.path('/home');
          });
      });

      expect(inject).toThrow();
    }
  );

  it('should allow getting path when given a route name', function () {

    module(function (kloyRouterProvider) {
      kloyRouterProvider.addRoute('home', function () {
        this.path('/home');
      });
    });

    var router = injector().get('kloyRouter');
    var result = router.getPathFor('home');

    expect(result).toBe('/home');
  });

  it('should return null when no path exists for known route', function () {

    module(function (kloyRouterProvider) {
      kloyRouterProvider.addRoute('base', function () {});
    });

    var router = injector().get('kloyRouter');
    var result = router.getPathFor('base');

    expect(result).toBe(null);
  });

  it('should throw exception when getting path for unknown route', function () {

    var router = injector().get('kloyRouter');
    function test () {
      router.getPathFor('unknown');
    }

    expect(test).toThrow();
  });

  it(
    'should allow getting path when given a route name and params',
    function () {

      module(function (kloyRouterProvider) {
        kloyRouterProvider.addRoute('contact.view', function () {
          this.path('/contacts/:id');
        });
      });

      var router = injector().get('kloyRouter');
      var result = router.getPathFor('contact.view', {id: 'abcd'});

      expect(result).toBe('/contacts/abcd');
    }
  );

  it(
    'should throw exception when path is found and all required params are ' +
    'not included',
    function () {

      module(function (kloyRouterProvider) {

        kloyRouterProvider.addRoute('example', function () {

          this.path('/example/:id/:name');
          this.requiredParams(['id', 'name']);
        });
      });

      var router = injector().get('kloyRouter');
      function test () {
        router.getPathFor('example', {id: 'abcd'});
      }

      expect(test).toThrow();
    }
  );
});
