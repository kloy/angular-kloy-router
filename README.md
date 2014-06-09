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

	document.addEventListener('back', function () {

		var result = $route.back();
		if (result === false) {
			application().quit();
		} else {
			router.go(result[name], result[params]);
		}
	});

	<!-- How to use section in HTML -->
	<ng-include src="section('main')"></ng-include>


# First Draft Test Cases

### A StateRouter
* <s>should go to states</s>
* <s>should pass state name when state changes</s>
* <s>should throw exception for unknown states</s>
* <s>should throw exception when registering duplicate states</s>
* <s>should prevent state changes when paused</s>
* <s>should resume state changes when unpaused</s>
* <s>should check permissions</s>
* <s>should throw exception when registering duplicate permissions</s>
* <s>should broadcast error when permissions fail</s>
* <s>should prevent state change when permissions fail</s>
* <s>should pass config data when state changes</s>
* <s>should pass params when state changes</s>
* <s>should throw exception when params do not match configured params</s>
* <s>should prefetch before changing states</s>
* <s>should broadcast error when prefetch fails</s>
* <s>should prevent state change when prefetch fail</s>
* <s>should attempt state transition when stateChangeRequest is heard</s>

### A StateModel
* <s>checks if current state is passed value</s>
* <s>checks if current state is not passed value</s>
* <s>checks if current state includes passed value</s>
* <s>checks if current state does not include passed value</s>
* <s>checks if current state begins with passsed value</s>
* <s>checks if current state ends with passsed value</s>

### A LayoutManager
* <s>should allow syncing</s>
* <s>should define template for match</s>
* <s>should throw exception when registering duplicate sections</s>
* <s>should sync when sync is called</s>

### A LocationRouter
* should match location to route on $locationChangeSuccess
* should go to "unknown" route when path cannot be matched to route
* should pass params to route config function
* is able to be paused
* is able to be synced
* should treat all paths as lowercased

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
* should match location's path to route on $locationChangeSuccess
* should broadcast error when path cannot be matched to route
* should interpolate path variables with route params
* should sync location's path with route
* should treat all paths as lowercased
* should get path for matched route
* (is this needed?) should not change routes when navigating to current route

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
* should modify href with interpolated path with params
* should log error when provided route is unknown
* should allow directive to be used on more than one element

### A LayoutManager
* <s>should allow syncing</s>
* <s>should define template for match</s>
* <s>should throw exception when registering duplicate sections</s>
* <s>should sync when route changes</s>


# API for module
* kloyRouter
	* addRoute(routeName, routeConfigFn)
	* modifyRoute(routeName, routeConfigFn)
	* addPermission(permissionName, permissionConfigFn)
		* routeConfigFn
			* permissions(array)
			* requiredParams(array)
			* path(string)
			* prefetch(function returning promise)
		* permissionConfigFn -> returns promise
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
