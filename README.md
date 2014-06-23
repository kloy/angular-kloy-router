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
* <s>should throw exception if same path is configured for multiple routes</s>
* <s>should allow getting path when given a route name</s>
* <s>should return null when no path exists for known route</s>
* <s>should throw exception when getting path for unknown route</s>
* <s>should allow getting path when given a route name and params</s>
* <s>should throw exception when path is found and all required params are not included</s>
* should change on first $locationChangeSuccess

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
* should cleanup when element is removed from dom

### A LayoutManager
* <s>should allow syncing</s>
* <s>should define template for match</s>
* <s>should throw exception when registering duplicate sections</s>
* <s>should sync when route changes</s>


# API for module

**kloyRouterProvider**
- addRoute(*string route's name*, *function route's configuration*)
- modifyRoute(*stirng route's name*, *function route's configuration*)
- addPermission(*string permission's name*, *function permission's configuration*)

**kloyRouter**
- toRoute(*string name*, *object params*)
- toPath(*string path*)
- getPathFor(*string route's name*, *object params*)
- play()
- pause()

**kloyRoute**
- name()
- data()
- params()
- is()
- not()
- includes()
- excludes()
- startsWith()
- endsWith()
- *history() contains all previous routes
- *previous() contains last route

**kloyLayoutManager**
- addSection(*string section's name*, *function section's config*)

**Route Configuration Function**
- permissions(*array*)
- requiredParams(*array*)
- path(*string*)
- prefetch(*function, must return promise*)

**Section Configuration Function**
- template(*string, path to template*)

**EVENTS**
- kloyRouteChangeStart(*object event*, *string route's name*, *object kloyRoute*)
- kloyRouteChangeSuccess(*object event*, *string route's name*, *object kloyRoute*)
- kloyRouteChangeError(*object event*, *object error*, *string route's name*, *object kloyRoute*)
- kloyRouteChangeRequest(*object event*, *string route name*, *string params*)

**Methods with a * beside them are not yet developed**
