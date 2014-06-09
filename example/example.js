angular.module('example', []).
  config(/*@ngInject*/function (kloyRouterProvider) {

    kloyRouterProvider.

      addPermission('password', /*@ngInject*/function ($q) {

        var dfd = $q.defer();
        dfd.resolve('authed');

        return dfd.promise;
      }).

      addRoute('home', /*@ngInject*/function () {

        this.
          permissions(['password']).
          params(['foo', 'bar']).
          data({name: 'awesome'}).
          path('/my/path');
      }).

      addRoute('profile', /*@ngInject*/function () {

        this.
          permissions(['password']).
          path('/about');
      });
  }).
  config(/*@ngInject*/function (kloyLayoutManagerProvider) {

    kloyLayoutManagerProvider.
      addSection('main', /*@ngInject*/function (kloyRoute) {

        var templates = {
          home: 'templates/home.html',
          profile: 'templates/profile.html'
        };

        this.template(templates[kloyRoute.name()]);
      }).

      addSection('sidebar', /*@ngInject*/function () {

        this.template('templates/sidebar.html');
      });
  }).
  run(/*@ngInject*/function ($log) {

    $log.debug('Example running');
  });

try {
  angular.bootstrap(document, ['example']);
} catch (e) {
  console.error(e.message, e);
}
