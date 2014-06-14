# Getting Started

First, run `npm install && bower install` for dependencies. Next run `grunt` to start the test server for development.

# Examples

	// Route requiring password permissions and with no params
	app.config(function (kloyRouterProvider) {

		kloyRouterProvider.
			addPermission('password',
				/* Angular Dependency Injection */
				function ($q) {

					var defer = $q.defer();
					defer.resolve('authed');

					return defer.promise;
				}
			).
			addRoute('home', function () {

				this.permissions(['password']);
				this.data({
					title: 'home',
					back: true
				});

				this.supportsBack(true);
			});
	});

	// Route requiring params
	app.config(function (kloyRouterProvider) {

		kloyRouterProvider.
			addRoute('people', function () {

				this.requiredParams(['id']);
			});
	});

	// Section visible when state is home
	app.config(function (kloyLayoutManagerProvider) {

		kloyLayoutManagerProvider.addSection('main',
			/* Angular Dependency Injection */function (kloyRoute) {

				if (kloyRoute.is('home')) {
					// set template url for section when state is home
					this.template('templates/home.html');
				}
			});
	});

	<!-- How to use section in HTML -->
	<ng-include src="section('main')"></ng-include>

# Current Draft Test Cases

### A Router
* <s>should navigate to routes and broadcast success event</s>
* <s>should throw exception when navigating to unknown route</s>
* <s>should throw exception when registering duplicate route</s>
* <s>should prevent route changes when paused</s>
* <s>should allow route changes when unpaused</s>
* <s>should check all configured permissions before transitioning to route</s>
* <s>should throw exception when registering duplicate permissions</s>
* <s>should prevent route change and broadcast error when permissions fail</s>
* <s>should navigate to route with params</s>
* <s>should enforce required params</s>
* <s>should prefetch before changing states</s>
* <s>should prevent route change and broadcast error when prefetch fails</s>
* <s>should broadcast start event when navigating to route</s>
* <s>should attempt route transition when kloyRouteChangeRequest is heard</s>
* <s>should allow modifying already defined route</s>
* <s>should throw exception when attempting to modify undefined route</s>
* <s>should update path when route changes</s>
* <s>should change route when $locationChangeSuccess is broadcasted with matching path</s>
* <s>should broadcast error when asked to change to unmatched path</s>
* <s>should match route when path includes params</s>
* <s>should include params in route change when path includes params</s>
* <s>should interpolate path variables with route params</s>
* <s>should lowercase, trim, replace spaces with %20 and remove unnecessary slashes from paths when matching to route</s>
* should throw exception if same path is configured for multiple routes

### A Route
* <s>should contain current route's name</s>
* <s>should contain current route's data</s>
* <s>should contain current route's params</s>
* <s>should allow checking if current route is passed value</s>
* <s>should allow checking if current route is not passed value</s>
* <s>should allow checking if current route includes passed value</s>
* <s>should allow checking if current route does not include passed value</s>
* <s>should allow checking if current route starts with passed value</s>
* <s>should allow checking if current route ends with passed value</s>

### A Router Directive
* should navigate to provided route when clicked
* should modify href when provided route has configured path
* should pass provided params
* should log error when provided route is unknown
* should allow directive to be used on more than one element
* should modify href with interpolated path with params

### A LayoutManager
* <s>should allow syncing</s>
* <s>should define template for match</s>
* <s>should throw exception when registering duplicate sections</s>
* <s>should sync when route changes</s>


# API for module
* kloyRouterProvider
	* addRoute(routeName, routeConfigFn)
	* modifyRoute(routeName, routeConfigFn)
	* addPermission(permissionName, permissionConfigFn)
		* routeConfigFn
			* permissions(array)
			* requiredParams(array)
			* path(string)
			* prefetch(function returning promise)
		* permissionConfigFn -> returns promise
* kloyRouter
	* toRoute(name, params)
	* toPath(path)
	* EVENTS
		* kloyRouteChangeStart (e, routeName, kloyRoute)
		* kloyRouteChangeSuccess (e, routeName, kloyRoute)
		* kloyRouteChangeError (e, err, routeName, kloyRoute)
* kloyRoute
	* name()
	* data()
	* params()
	* is()
	* not()
	* includes()
	* excludes()
	* startsWith()
	* endsWith()
	* &history() contains all previous routes
	* &previous() contains last route
* kloyLayoutManager
	* addSection(sectionName, sectionConfigFn)
		* sectionConfigFn
			* template(string)
& previous to property/method indicates tentative support
