'use strict';

angular.module('chatroom').controller('ChatroomController', ['$scope','Socket',
	function($scope,Socket) {
		Socket.on('user.signedout', function(user) {
		    console.log(user);
		});
	}
]);