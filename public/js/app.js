/**
* app Module
*
* main module
*/
angular.module('app', []).
	service('authService', ['$http', function($http){
		var user = {
			authorization : false,
			username : "root",
			password : "1233"
		}
		var login = function(){
			$http({
				method : 'GET',
				url : '/auth',
				headers : {
					"username" : user.username,
					"password" : user.password
				}
			})
			.then(function (response){
				console.log(response);
				if (response.data.allowed){
					user.authorization = true;
				}
				else{
					alert('access denied');
				}
			})
		}
		var quit = function () {
			$http({
				method : 'GET',
				url : '/auth',
				headers : {
					"logout" : true
				}
			})
			.then(function (response){
				console.log(response.data);
				user.authorization = false;
				user.username = "";
				user.password = "";
			})
		}
		return {
			user : user,
			login : login,
			quit : quit
		}
	}]).
	service('dbService', ['$http', function ($http){
		var getTable = function (query){
			return $http({
				method : 'GET',
				url : '/db',
				headers : {
					"query" : query
				}
			})
			.then(function (response){
				console.log("from db : ", response);
				var fields = response.data.fields.map(function (field){
					return field.name;
				})
				return {
					fields : fields,
					rows : response.data.rows
				}
			}, function (error){
				console.log ("impossible to perform query : ", error);
				alert('shit happens');
				return {
					fields : null,
					rows : null
				}
			})
		}
		return {
			getTable : getTable
		}
	}]).
	service('contentService', ['$log', 'dbService', function ($log, dbService){
		var uiState = {
			templates : [
				{
					id : 0,
					config : {
						navPill : {
							title : "Сотрудники"
						},
						sideContent : {
							template : "partials/stuff/side.html"
						},
						mainContent : {
							template : "partials/stuff/main.html"
						}
					},
					dataConfig : {
						procedure : "select * from general_info"
					},
					data: null,
					selected: true
				},
				{
					id : 1,
					config : {
						navPill : {
							title : "Медицинские лицензии"
						},
						sideContent : {
							template : "partials/license/side.html"
						},
						mainContent : {
							template : "partials/license/main.html"
						}
					},
					dataConfig : {
						procedure : "select * from general_info"
					},
					data: null,
					selected : false
				},
				{
					id : 2,
					config : {
						navPill : {
							title : "Должности"
						},
						sideContent : {
							template : "partials/post/side.html"
						},
						mainContent : {
							template : "partials/post/main.html"
						}
					},
					dataConfig : {
						procedure : "select * from general_info"
					},
					data: null,
					selected : false
				},
				{
					id : 3,
					config : {
						navPill : {
							title : "Отделы"
						},
						sideContent : {
							template : "partials/dept/side.html"
						},
						mainContent : {
							template : "partials/dept/main.html"
						}
					},
					dataConfig : {
						procedure : "select * from general_info"
					},
					data: null,
					selected : false
				}
			],
			select : function (template){
				this.templates.forEach(function (item){
					item.selected = false;
				})
				template.selected = true;
				this.initData(template);
			},
			initData : function (template){
				dbService.getTable(template.dataConfig.procedure).then(function (result){
					template.data = result;
				});
			}
		}
		return uiState;
	}]).
	controller('RootCtrl', ['$log', '$scope', '$rootScope', 'authService', function ($log, $scope, $rootScope, authService){
		$rootScope.user = authService.user;
	}]).
	controller('AuthCtrl', ['$scope', '$http', '$rootScope', "authService", function ($scope, $http, $rootScope, authService){
		$scope.login = authService.login;
	}]).
	controller('ContentCtrl', ['$scope', 'authService', 'contentService', function ($scope, authService, contentService){
		$scope.quit = authService.quit;
		$scope.ui = contentService;


	}])