xdescribe('A LayoutManager', function () {

  beforeEach(function () {

    module('kloy.router');
  });

  it('should allow syncing', function () {

    module(function (layoutManagerProvider) {

      layoutManagerProvider.section('master', function () {

        this.template('templates/home.html');
      });
    });

    var layoutManager = injector().get('layoutManager'),
        scope = injector().get('$rootScope');

    layoutManager.sync();
    expect(scope.section('master')).toBe('templates/home.html');
  });

  it('should define template for match', function () {

    module(function (layoutManagerProvider) {

      layoutManagerProvider.
        section('master', function (stateModel) {

          if (stateModel.is('home')) {
            this.template('templates/home.html');
          }
        });
    });

    var layoutManager = injector().get('layoutManager'),
        scope = injector().get('$rootScope'),
        stateModel = injector().get('stateModel');

    stateModel.name('home');
    layoutManager.sync();
    expect(scope.section('master')).toBe('templates/home.html');
    stateModel.name('unknown');
    layoutManager.sync();
    expect(scope.section('master')).toBeNull();
  });

  it('should throw exception when registering duplicate sections',
    function () {

      module(function (layoutManagerProvider) {

        layoutManagerProvider.
          section('home', noop).
          section('home', noop);
      });

      expect(inject).toThrow();
    });

  it('should sync when state changes', function () {

    module(function (stateRouterProvider, layoutManagerProvider) {

      stateRouterProvider.state('home');
      layoutManagerProvider.section('master', function (stateModel) {

        if (stateModel.is('home')) {
          this.template('templates/home.html');
        }
      });
    });

    var stateRouter = injector().get('stateRouter'),
        scope = injector().get('$rootScope');

    stateRouter.go('home');
    $apply();
    expect(scope.section('master')).toBe('templates/home.html');
  });
});
