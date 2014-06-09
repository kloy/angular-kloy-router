describe('A Route', function () {

  beforeEach(function () {

    module('kloy.router');
  });

  it('should contain current route\'s name', function () {

    module(function (kloyRouterProvider) {
      kloyRouterProvider.addRoute('home', function () {});
    });

    var $i = injector(),
        router = $i.get('kloyRouter'),
        route = $i.get('kloyRoute');

    router.go('home');
    $apply();
    expect(route.name()).toBe('home');
  });

  it('should contain current route\'s data', function () {

    module(function (kloyRouterProvider) {
      kloyRouterProvider.addRoute('home', function () {
        this.data({foo: 'bar'});
      });
    });

    var $i = injector(),
        router = $i.get('kloyRouter'),
        route = $i.get('kloyRoute');

    router.go('home');
    $apply();
    expect(route.data()).toEqual({foo: 'bar'});
  });

  it('should contain current route\'s params', function () {

    module(function (kloyRouterProvider) {
      kloyRouterProvider.addRoute('home', function () {});
    });

    var $i = injector(),
        router = $i.get('kloyRouter'),
        route = $i.get('kloyRoute');

    router.go('home', {my: 'params'});
    $apply();
    expect(route.params()).toEqual({my: 'params'});
  });

  it('should allow checking if current route is passed value', function () {

    var route = injector().get('kloyRoute');

    route._update({name: 'foo'});
    expect(route.is('foo')).toBe(true);
    expect(route.is('bar')).toBe(false);
  });

  it('should allow checking if current route is not passed value', function () {

    var route = injector().get('kloyRoute');

    route._update({name: 'foo'});
    expect(route.not('bar')).toBe(true);
    expect(route.not('foo')).toBe(false);
  });

  it(
    'should allow checking if current route includes passed value',
    function () {

      var route = injector().get('kloyRoute');

      route._update({name: 'foo'});
      expect(route.includes('bar')).toBe(false);
      expect(route.includes('oo')).toBe(true);
    }
  );

  it(
    'should allow checking if current route includes passed value',
    function () {

      var route = injector().get('kloyRoute');

      route._update({name: 'foo'});
      expect(route.includes('bar')).toBe(false);
      expect(route.includes('oo')).toBe(true);
    }
  );


  it(
    'should allow checking if current route does not include passed value',
    function () {

      var route = injector().get('kloyRoute');

      route._update({name: 'foo'});
      expect(route.excludes('bar')).toBe(true);
      expect(route.excludes('oo')).toBe(false);
    }
  );

  it(
    'should allow checking if current route starts with passed value',
    function () {

      var route = injector().get('kloyRoute');

      route._update({name: 'foo.bar'});
      expect(route.startsWith('foo')).toBe(true);
      expect(route.startsWith('bar')).toBe(false);
    }
  );


  it(
    'should allow checking if current route ends with passed value',
    function () {

      var route = injector().get('kloyRoute');

      route._update({name: 'foo.bar'});
      expect(route.endsWith('foo')).toBe(false);
      expect(route.endsWith('bar')).toBe(true);
    }
  );

});
