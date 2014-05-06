# Getting Started

First, run `npm install && bower install` for dependencies. Next run `grunt` to start the test server for development.

# Examples

	// State requiring password permissions and with no params
	app.config(function (stateRouterProvider) {

		stateRouterProvider.
			permission('password', function ($q) {

				var defer = $q.defer();
				defer.resolve('authed');

				return defer.promise;
			}).
			state('home', {
				permissions: ['password'],
				data: {
					title: 'home'
				}
			});
	});

	// State requiring params
	app.config(function (stateRouterProvider) {

		stateRouterProvider.
			state('people', {
				allowedParams: ['id']
			});
	});

	// Section visible when state is home
	app.config(function (layoutManagerProvider) {

		layoutManagerProvider.section('main', function (stateModel) {

			if (stateModel.is('home')) {
				// set template url for section when state is home
				this.template('templates/home.html');
			}
		});
	});

	<!-- How to use section in HTML -->
	<ng-include src="section('main')"></ng-include>


# Test Cases

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
* <s>should sync when state changes</s>

### A LocationRouter
* should broadcast state change request when route matched
* should broadcast error when unknown location change occurs
* should match locations with params
* should broadcast params with state change request
* is able to be paused
* is able to be synced
