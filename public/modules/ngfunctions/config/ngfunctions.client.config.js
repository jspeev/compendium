'use strict';

// Ngfunctions module config
angular.module('ngfunctions').run(['Menus',
	function(Menus) {
		// Config logic
		Menus.addMenuItem('topbar', 'Compendia', 'compendia', 'dropdown', '/compendia(/create)?');
		Menus.addSubMenuItem('topbar', 'compendia', 'List Compendia', 'compendia');
		Menus.addSubMenuItem('topbar', 'compendia', 'New Compendium', 'compendia/create');
	}
]);