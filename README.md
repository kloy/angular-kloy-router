# Getting Started

First, run `npm install && bower install` for dependencies. Next run `gulp` to start the test server for development.

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


# API

## Provider: kloyRouterProvider

#### kloyRouterProvider.addRoute(routeName, routeConfig)

**Description:** Defines a route and provides configuration

**Parameters:**

Param | Type(s) | Description
--- | --- | ---
routeName | string | Name for route
routeConfig | function | Configures route

**Returns:** kloyRouterProvider

#### kloyRouterProvider.modifyRoute(routeName, routeConfig)

**Description:** Modifies a defined route and provides additional configuration

**Parameters:**

Param | Type(s) | Description
--- | --- | ---
routeName | string | Name for route
routeConfig | function | Configures route

**Returns:** kloyRouterProvider

#### kloyRouterProvider.addPermission(permissionName, permissionConfig)

**Description:** Defines a permission

**Parameters:**

Param | Type(s) | Description
--- | --- | ---
permissionName | string | Name for permission
permissionConfig | function | Configures permission

**Returns:** kloyRouterProvider

===

## Service: kloyRouter

#### kloyRouter.toRoute(routeName, [routeParams])

**Description:** Navigate to a route

**Parameters:**

Param | Type(s) | Description
--- | --- | ---
routeName | string | Name for route
routeParams | object | Hash of params for route

**Returns:** promise

#### kloyRouter.toPath(path)

**Description:** Navigate to a route using a path

**Parameters:**

Param | Type(s) | Description
--- | --- | ---
path | string | URL path associated with a route

**Returns:** promise

#### kloyRouter.getPathFor(routeName, [routeParams])

**Description:** Retrieves path for a route

**Parameters:**

Param | Type(s) | Description
--- | --- | ---
routeName | string | Name for a defined route
routeParams | string | Params for a defined route

**Returns:** string

#### kloyRouter.play()

**Description:** Allows router to change routes

**Returns:** undefined

#### kloyRouter.pause()

**Description:** Prevents router from making route changes

===

#### kloyRoute.name()

**Description:** Gets the name for the current route

**Returns:** string

#### kloyRoute.data()

**Description:** Gets the data for the current route

**Returns:**
- object
- undefined

#### kloyRoute.params()

**Description:** Gets the params for the current route

**Returns:**
- object
- undefined

#### kloyRoute.is(value)

**Description:** Checks if current route name is same as value

**Parameters:**

Param | Type(s) | Description
--- | --- | ---
value | string | Value to test against

**Returns:** boolean

#### kloyRoute.not(value)

**Description:** Checks if current route name is not same as value

**Parameters:**

Param | Type(s) | Description
--- | --- | ---
value | string | Value to test against

**Returns:** boolean

#### kloyRoute.includes(value)

**Description:** Checks if current route name includes value

**Parameters:**

Param | Type(s) | Description
--- | --- | ---
value | string | Value to test against

**Returns:** boolean

#### kloyRoute.excludes(value)

**Description:** Checks if current route name does not include value

**Parameters:**

Param | Type(s) | Description
--- | --- | ---
value | string | Value to test against

**Returns:** boolean

#### kloyRoute.startsWith(value)

**Description:** Checks if current route name starts with value

**Parameters:**

Param | Type(s) | Description
--- | --- | ---
value | string | Value to test against

**Returns:** boolean

#### kloyRoute.endsWith(value)

**Description:** Checks if current route name starts with value

**Parameters:**

Param | Type(s) | Description
--- | --- | ---
value | string | Value to test against

**Returns:** boolean

#### kloyRoute.history()

**This method is not yet implemented**

**Description:** Contains list of all previous route name and params with back support in order

**Returns:** array

#### kloyRoute.previous()

**This method is not yet implemented**

**Description:** Returns previous route name and params supporting back

**Returns:** object

===

## Provider: kloyLayoutManagerProvider

Configuration provider for setting up layout sections

#### kloyLayoutManagerProvider.addSection(sectionName, sectionConfig)

**Description:** Defines a section in the layout manager

**Parameters:**

Param | Type(s) | Description
--- | --- | ---
sectionName | string | Name for the section
sectionConfig | function | Configuration for section

**Returns:** kloyLayoutManagerProvider

===

## Configuration Function: routeConfig

#### routeConfig.permissions(permissions)

**Description:** Checks list of permissions before entering route

**Parameters:**

Param | Type(s) | Description
--- | --- | ---
permissions | array | List of permissions

**Returns:** promise

#### routeConfig.requiredParams(params)

**Description:** Checks list of params against passed route params before entering route

**Parameters:**

Param | Type(s) | Description
--- | --- | ---
params | array | List of required parameters

**Returns:** promise

#### routeConfig.path(path)

**Description:** Defines URL path for route

**Parameters:**

Param | Type(s) | Description
--- | --- | ---
path | string | Path template for route

**Example**

	kloyRouterProvider.addRoute('contact.create', function () {
		this.path('/contacts/:id');
	});

**Returns:** undefined

#### routeConfig.prefetch(fn)

**Description:** Prefetch anything and resolve/reject promise when finished

**Parameters:**

Param | Type(s) | Description
--- | --- | ---
fn | function | Dependency injectable function that returns a promise

**Returns:** promise

===

## Configuration Function: sectionConfig

#### sectionConfig.template(templatePath)

**Description:** Sets template URL for section

**Parameters:**

Param | Type(s) | Description
--- | --- | ---
templatePath | string | URL path to angular HTML template

**Returns:** undefined

## Object: routeChangeError

#### routeChangeError.type

**Description:** Type of error related to route change failure.

#### routeChangeError.message

**Description:** Message for error related to route change failure.

## EVENTS

#### kloyRouteChangeStart(event, routeName, kloyRoute)
#### kloyRouteChangeSuccess(event, routeName, kloyRoute)
#### kloyRouteChangeError(event, routeChangeError, routeName, kloyRoute)
#### kloyRouteChangeRequest(event, routeName, [routeParams])

# Outstanding questions

- what is expected to happen when a route is asked to change while still performing a previous route change?
