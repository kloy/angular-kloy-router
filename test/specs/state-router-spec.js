describe('A StateRouter', function () {

  beforeEach(function () {

    module('kloy.router');
  });

  it('should go to states', function () {

    module(function (stateRouterProvider) {

      stateRouterProvider.state('home');
    });

    var $rootScope = injector().get('$rootScope'),
        stateRouter = injector().get('stateRouter'),
        result = 'not called';

    $rootScope.$on('stateChangeSuccess', function () {
      result = 'called';
    });
    stateRouter.go('home');
    $apply();

    expect(result).toBe('called');
  });

  it('should pass state name when state changes', function () {

    module(function (stateRouterProvider) {

      stateRouterProvider.state('about');
    });

    var $rootScope = injector().get('$rootScope'),
        stateRouter = injector().get('stateRouter'),
        result = 'not called';

    $rootScope.$on('stateChangeSuccess', function (e, stateModel) {

      result = stateModel.name();
    });
    stateRouter.go('about');
    $apply();

    expect(result).toBe('about');
  });

  it('should throw exception for unknown states', function () {

    var stateRouter;

    inject(function (_stateRouter_) {

      stateRouter = _stateRouter_;
    });

    function shouldThrow () {

      stateRouter.go('unknown');
    }

    expect(shouldThrow).toThrow();
  });

  it('should throw exception when registering duplicate states', function () {

    module(function (stateRouterProvider) {

      stateRouterProvider.
        state('duplicate').
        state('duplicate');
    });

    expect(inject).toThrow();
  });

  it('should prevent state changes when paused', function () {

    module(function (stateRouterProvider) {

      stateRouterProvider.state('home');
    });

    var stateRouter = injector().get('stateRouter'),
        $rootScope = injector().get('$rootScope'),
        successResult = 'not called',
        pauseResult = 'not called';

    $rootScope.$on('stateChangeSuccess', function () {

      successResult = 'success';
    });

    $rootScope.$on('stateRouterPaused', function () {

      pauseResult = 'paused';
    });

    stateRouter.pause().go('home');
    $apply();
    expect(successResult).toBe('not called');
    expect(pauseResult).toBe('paused');
  });

  it('should resume state changes when unpaused', function () {

    module(function (stateRouterProvider) {

      stateRouterProvider.
        pause().
        state('home').
        state('dashboard');
    });

    var stateRouter = injector().get('stateRouter'),
        $rootScope = injector().get('$rootScope'),
        successResult = 'not called',
        playResult = 'not called';

    $rootScope.$on('stateChangeSuccess', function () {

      successResult = 'success';
    });

    $rootScope.$on('stateRouterPlaying', function () {

      playResult = 'playing';
    });

    stateRouter.go('home');
    $apply();
    expect(successResult).toBe('not called');

    stateRouter.
      play().
      go('dashboard');
    $apply();
    expect(successResult).toBe('success');
    expect(playResult).toBe('playing');
  });

  it('should check permissions', function () {

    var passwordChecked = false;

    module(function (stateRouterProvider) {

      stateRouterProvider.
        permission('password', function () {

          passwordChecked = true;
        }).
        state('home', {
          permissions: ['password']
        });
    });

    injector().get('stateRouter').go('home');
    $apply();
    expect(passwordChecked).toBe(true);
  });

  it(
    'should throw exception when registering duplicate permissions',
    function () {

      module(function (stateRouterProvider) {

        stateRouterProvider.
          permission('password', noop).
          permission('password', noop);
      });

      expect(inject).toThrow();
    }
  );

  it('should broadcast error when permissions fail', function () {

    module(function (stateRouterProvider) {

      stateRouterProvider.
        permission('password', function ($q) {

          return $q.reject('permission.password');
        }).
        state('home', {
          permissions: ['password']
        });
    });

    var stateRouter = injector().get('stateRouter'),
        $rootScope = injector().get('$rootScope'),
        result = 'not called';

    $rootScope.$on('stateChangeError', function (e, err) {

      result = err;
    });
    stateRouter.go('home');
    $apply();

    expect(result).toBe('permission.password');
  });

  it('should prevent state change when permissions fail', function () {

    module(function (stateRouterProvider) {

      stateRouterProvider.
        permission('password', function ($q) {

          return $q.reject('permission.password');
        }).
        state('home', {
          permissions: ['password']
        });
    });

    var stateRouter = injector().get('stateRouter'),
        stateModel = injector().get('stateModel');

    stateRouter.go('home');
    $apply();

    expect(stateModel.name()).toBe('');
  });

  it('should pass config data when state changes', function () {

    module(function (stateRouterProvider) {

      stateRouterProvider.state('home', {
        data: {
          name: 'keith',
          type: 'awesome'
        }
      });
    });

    var stateRouter = injector().get('stateRouter'),
        $rootScope = injector().get('$rootScope'),
        data;

    $rootScope.$on('stateChangeSuccess', function (e, stateModel) {
      data = stateModel.data();
    });
    stateRouter.go('home');
    $apply();

    expect(data).toEqual({name: 'keith', type: 'awesome'});
  });

  it('should pass params when state changes', function () {

    module(function (stateRouterProvider) {

      stateRouterProvider.state('random', {
        allowedParams: ['myNumber']
      });
    });

    var router = injector().get('stateRouter'),
        scope = injector().get('$rootScope'),
        params;

    scope.$on('stateChangeSuccess', function (e, state) {

      params = state.params();
    });
    router.go('random', {myNumber: 42});
    $apply();

    expect(params).toEqual({myNumber: 42});
  });

  it(
    'should throw exception when params do not match configured params',
    function () {

      module(function (stateRouterProvider) {

        stateRouterProvider.state('test.state', {
          allowedParams: ['name', 'type']
        });
      });

      var router = injector().get('stateRouter');

      function missingParamsTest () {

        router.go('test.state');
        $apply();
      }

      function unknownParamsTest () {

        router.go('test.state', {
          name: 'keith',
          type: 'developer',
          id: 'abc'
        });
        $apply();
      }

      function knownParamsTest () {

        router.go('test.state', {
          name: 'keith',
          type: 'developer'
        });
        $apply();
      }

      expect(missingParamsTest).toThrow();
      expect(unknownParamsTest).toThrow();
      expect(knownParamsTest).not.toThrow();
    }
  );

  it('should prefetch before changing states', function () {

    var result = 'not called';

    module(function (stateRouterProvider) {

      stateRouterProvider.state('prefetch.state', {
        prefetch: function ($q) {

          var defer = $q.defer();
          result = 'prefetched';
          defer.resolve();

          return defer.promise;
        }
      });
    });

    var router = injector().get('stateRouter');
    router.go('prefetch.state');
    $apply();

    expect(result).toBe('prefetched');
  });

  it('should broadcast error when prefetch fails', function () {

    module(function (stateRouterProvider) {

      stateRouterProvider.state('prefetch.state', {
        prefetch: function ($q) {

          return $q.reject('prefetch.failed');
        }
      });
    });

    var router = injector().get('stateRouter'),
        scope = injector().get('$rootScope'),
        result = 'not called';

    scope.$on('stateChangeError', function (e, err) {

      result = err;
    });
    router.go('prefetch.state');
    $apply();

    expect(result).toBe('prefetch.failed');
  });

  it('should broadcast error when prefetch fails', function () {

    module(function (stateRouterProvider) {

      stateRouterProvider.state('prefetch.state', {
        prefetch: function ($q) {

          return $q.reject('prefetch.failed');
        }
      });
    });

    var router = injector().get('stateRouter'),
        state = injector().get('stateModel'),
        result = 'not called';

    router.go('prefetch.state');
    result = state.name();
    $apply();

    expect(result).toBe('');
  });

  it('should attempt state transition when stateChangeRequest is heard',
    function () {

      module(function (stateRouterProvider) {

        stateRouterProvider.state('contacts', {
          allowedParams: ['id']
        });
      });

      injector().get('stateRouter');
      var scope = injector().get('$rootScope'),
          stateModel = injector().get('stateModel');

      scope.$broadcast('stateChangeRequest', 'contacts', {id: 'abc'});
      $apply();

      expect(stateModel.name()).toBe('contacts');
      expect(stateModel.params()).toEqual({id: 'abc'});
    }
  );
});
