ng.module('app').config(function (kloyRouterProvider) {

  kloyRouterProvider.

    permission('password', /*@ngInject*/function ($q) {

      var dfd = $q.defer();

      dfd.resolve('authed');

      return dfd.promise;
    }).

    route('home', /*@ngInject*/function () {

      this.
        permissions(['password']).
        params(['foo', 'bar']).
        data({name: 'awesome'}).
        path('/my/path');
    }).

    route('profile', /*@ngInject*/function () {

      this.
        permissions(['password']).
        path('/about');
    }).

    modifyRoute('profile', /*@ngInject*/function () {

      this.path('/about-me');
    });

});

ng.module('app').config(function (kloyLayoutManagerProvider) {

  kloyLayoutManagerProvider.

    section('main', /*@ngInject*/function (kloyRoute) {

      var templates = {
        home: 'templates/home.html',
        profile: 'templates/profile.html'
      };

      this.template(templates[kloyRoute.name()]);
    }).

    section('sidebar', /*@ngInject*/function () {

      this.template('templates/sidebar.html');
    });

});
