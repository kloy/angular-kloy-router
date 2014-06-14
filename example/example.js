angular.module('example', ['kloy.router']).
  config(/*@ngInject*/function (kloyRouterProvider) {

    kloyRouterProvider.

      addPermission('password', /*@ngInject*/function ($q, $log) {

        var dfd = $q.defer();
        $log.debug('Checking password permission');
        dfd.resolve('authed');

        return dfd.promise;
      }).

      addRoute('home', function () {

        this.permissions(['password']);
        this.data({name: 'awesome'});
        this.path('/home');
      }).

      addRoute('profile', function () {

        this.permissions(['password']);
        this.path('/about');
      }).

      addRoute('contact.view', function () {

        this.permissions(['password']);
        this.path('/contact/:id');
        this.requiredParams(['id']);
      });
  }).
  config(/*@ngInject*/function (kloyLayoutManagerProvider) {

    kloyLayoutManagerProvider.
      addSection('main', /*@ngInject*/function (kloyRoute, $log) {

        var templates = {
          home: '/example/home.html',
          profile: '/example/profile.html',
          'contact.view': '/example/contact-view.html'
        };

        $log.debug('syncing section "main"');
        this.template(templates[kloyRoute.name()]);
      }).

      addSection('sidebar', /*@ngInject*/function ($log) {

        $log.debug('syncing section "sidebar"');
        this.template('/example/sidebar.html');
      });
  }).
  controller('ContactViewCtrl', /*@ngInject*/function ($scope, kloyRoute) {

    $scope.contactID = kloyRoute.params().id;
  }).
  run(/*@ngInject*/function ($log, $rootScope, kloyRouter) {

    $log.debug('Example running');
    $rootScope.$on('kloyRouteChangeStart', function () {

      $log.debug('kloyRouteChangeStart', arguments);
    });
    $rootScope.$on('kloyRouteChangeSuccess', function () {

      $log.debug('kloyRouteChangeSuccess', arguments);
    });
    $rootScope.$on('kloyRouteChangeError', function () {

      $log.debug('kloyRouteChangeError', arguments);
    });
  });
