describe('A StateModel', function () {

  beforeEach(function () {

    module('kloy.router');
  });

  it('checks if current state is passed value', inject(function (stateModel) {

    stateModel.name('foo');
    expect(stateModel.is('foo')).toBe(true);
  }));

  it('checks if current state is not passed value', inject(
    function (stateModel) {

      stateModel.name('bar');
      expect(stateModel.not('foo')).toBe(true);
    }));

  it('checks if current state includes passed value',
    inject(function (stateModel) {

      stateModel.name('foo.bar');
      expect(stateModel.includes('.bar')).toBe(true);
    }));

  it('checks if current state does not include passed value',
    inject(function (stateModel) {

      stateModel.name('foo.bar');
      expect(stateModel.excludes('.bar')).toBe(false);
      expect(stateModel.excludes('.chu')).toBe(true);
    }));

  it('checks if current state begins with passsed value',
    inject(function (stateModel) {

      stateModel.name('foo.bar');
      expect(stateModel.startsWith('foo')).toBe(true);
      expect(stateModel.startsWith('bar')).toBe(false);
      expect(stateModel.startsWith('foo.bar1')).toBe(false);
    }));

  it('checks if current state ends with passsed value',
    inject(function (stateModel) {

      stateModel.name('foo.bar');
      expect(stateModel.endsWith('foo')).toBe(false);
      expect(stateModel.endsWith('bar')).toBe(true);
      expect(stateModel.endsWith('bar1')).toBe(false);
    }));
});
