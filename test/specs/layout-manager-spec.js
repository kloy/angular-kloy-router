describe('A LayoutManager', function () {

  beforeEach(function () {

    module('kloy.router');
  });

  it('should allow syncing', function () {

    module(function (kloyLayoutManagerProvider) {

      kloyLayoutManagerProvider.addSection('master', function () {

        this.template('templates/home.html');
      });
    });

    var $i = injector(),
        layoutManager = $i.get('kloyLayoutManager'),
        scope = $i.get('$rootScope');

    layoutManager.sync();
    expect(scope.section('master')).toBe('templates/home.html');
  });

  it('should define template for match', function () {

    module(function (kloyLayoutManagerProvider) {

      kloyLayoutManagerProvider.
        addSection('master', function (kloyRoute) {

          if (kloyRoute.is('home')) {
            this.template('templates/home.html');
          }
        });
    });

    var $i = injector(),
        layoutManager = $i.get('kloyLayoutManager'),
        scope = $i.get('$rootScope'),
        route = $i.get('kloyRoute');

    route._update({name: 'home'});
    layoutManager.sync();
    expect(scope.section('master')).toBe('templates/home.html');
    route._update({name: 'unknown'});
    layoutManager.sync();
    expect(scope.section('master')).toBeNull();
  });

  it('should throw exception when registering duplicate sections',
    function () {

      module(function (kloyLayoutManagerProvider) {

        kloyLayoutManagerProvider.
          addSection('home', noop).
          addSection('home', noop);
      });

      expect(inject).toThrow();
    });

  it('should sync when route changes', function () {

    module(function (kloyRouterProvider, kloyLayoutManagerProvider) {

      kloyRouterProvider.addRoute('home', function () {});
      kloyLayoutManagerProvider.addSection('master', function (kloyRoute) {

        if (kloyRoute.is('home')) {
          this.template('templates/home.html');
        }
      });
    });

    var router = injector().get('kloyRouter'),
        scope = injector().get('$rootScope');

    router.go('home');
    $apply();
    expect(scope.section('master')).toBe('templates/home.html');
  });
});
