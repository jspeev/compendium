'use strict';

angular.module('ngfunctions').directive('direxample', ['$sce','$timeout','$filter','$compile','$location','$anchorScroll','$animate','$cacheFactory','$document','$http','$templateCache','$interpolate','$log','$parse','$rootElement','$injector',
	function($sce,$timeout,$filter,$compile,$location,$anchorScroll,$animate,$cacheFactory,$document,$http,$templateCache,$interpolate,$log,$parse,$rootElement,$injector) {
		return {
			scope:{'codeContent':'@code'},
			template: '<div id="dirExample"></div>',
			restrict: 'E',
			link: function postlink($scope,element,attribute) {
				
				$scope.html = undefined;
				
				function appendHtml() {
						//$COMPILE A NEW ELEMENT RATHER THAN SANITIZE FILTER TO USE NG ATTRIBUTES FROM INPUTS
	              if($scope.html) {
	                  var newElement = angular.element($scope.html);
	                  $compile(newElement)($scope);
	                  element.append(newElement);
	              }
	          }
				
				$timeout(function(){

					var output = eval($scope.codeContent.replace(/(\r\n|\n|\r)/gm,''));
					
					if(angular.isUndefined($scope.html)){
						element.text(output);
					}
						
				},500);
				
				$scope.$watch(function() { return $scope.html; }, appendHtml);
				
			}
		};
	}
]);