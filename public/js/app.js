/**
* app Module
*
* main module
*/
angular.module('app', ['pascalprecht.translate', 'app-i18n']).
	service('authService', ['$http', 'contentService', 'employeeFactory', function ($http, contentService, employeeFactory){
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
					contentService.selectByID(0);
					employeeFactory.init();
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
	service('dbService', ['$http', '$rootScope', function ($http, $rootScope){
		var performGetQuery = function (query){
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
				alert('error');
				return {
					fields : null,
					rows : null
				}
			})
		}
		var performGetProcedure = function (query){
			return $http({
				method : 'GET',
				url : '/db',
				headers : {
					"query" : query
				}
			})
			.then(function (response){
				console.log("from db : ", response);
				var fields = response.data.fields[0].map(function (field){
					return field.name;
				})
				return {
					fields : fields,
					rows : response.data.rows[0]
				}
			}, function (error){
				console.log ("impossible to perform query : ", error);
				// alert('shit happens');
				return {
					fields : null,
					rows : null
				}
			})
		}
		var performSetProcedure = function (query){
			return $http({
				method : 'POST',
				url : '/db',
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				data: { "query" : query }
			})
			.then(function (response){
				console.log("from db : ", response);
				$rootScope.$broadcast('refresh');
			}, function (error){
				console.log ("impossible to perform query : ", error);
				// alert('shit happens');
				$rootScope.$broadcast('refresh');
			})
		}
		return {
			performGetQuery : performGetQuery,
			performGetProcedure : performGetProcedure,
			performSetProcedure : performSetProcedure
		}
	}]).
	factory('employeeFactory', ['$rootScope', 'dbService', function ($rootScope, dbService){
		var posts = {};
		var initPosts = function (){
			return dbService.performGetQuery("select post_id, post_descr from post_info")
				.then(function (result){
					posts = result.rows;
					console.log("posts :", result);
					if ($rootScope.$$phase !== '$digest'){
						$rootScope.$apply();
					}
				});
		}
		var createEmployee = function (){
			var emp = {
				textProperties: {
					'last_name' : {value:'', type:'text', required:true},
					'first_name' : {value:'', type:'text', required:true},
					'middle_name': {value:'', type:'text', required:true},
					'age': {value:'', type:'number', required:true}
				},
				radioProperties: {
					'sex':{values:['м','ж'], value:'м', type:'radio'}
				},
				selectProperties: {
					'post_id':{
						values: posts, 
						value: posts[0]
					}
				},
				nonRequiredProperties: {
					'medical_license_number': {value:'', type:'number', required:true},
					'last_accreditation_date': {value:'', type:'text', required:true, label: "Предыдущая аккредитация (yyyy-mm-dd)"},
					'next_accreditation_date': {value:'', type:'text', required:true, label: "Лицензия истекает (yyyy-mm-dd)"}
				}
			}
			return emp;
		}
		return {
			createEmployee : createEmployee,
			init : initPosts
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
						type: "query",
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
						type : "procedure",
						procedure : "call cl_getLicenseInfo()"
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
						type : "procedure",
						procedure : "call cl_getPostInfo"
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
				switch (template.dataConfig.type){
					case "query":{
						dbService.performGetQuery(template.dataConfig.procedure).then(function (result){
							template.data = result;
						});
						break;
					}
					case "procedure":{
						dbService.performGetProcedure(template.dataConfig.procedure).then(function (result){
							template.data = result;
						});
						break;
					}
				}
			},
			selectByID : function (id){
				var template;
				this.templates.forEach(function (item){
					if (item.id === id){
						template = item;
					}
				});
				this.select(template);
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
	controller('ContentCtrl', ['$scope', 'authService', 'contentService', 'employeeFactory', 'dbService', function ($scope, authService, contentService, employeeFactory, dbService){
		$scope.$on('refresh', function (){
			contentService.selectByID(0);
		})
		$scope.quit = authService.quit;
		$scope.ui = contentService;
		$scope.emp = {};
		$scope.initEmp = function (){
			$scope.emp = employeeFactory.createEmployee();
		}
		$scope.addEmployee = function (){
			var last_name = $scope.emp.textProperties.last_name.value;
			var first_name = $scope.emp.textProperties.first_name.value;
			var middle_name = $scope.emp.textProperties.middle_name.value;
			var sex = $scope.emp.radioProperties.sex.value;
			var age = $scope.emp.textProperties.age.value;
			var post_id = $scope.emp.selectProperties.post_id.value.post_id;
			var license = $scope.emp.nonRequiredProperties.medical_license_number.value;
			var last_accr = $scope.emp.nonRequiredProperties.last_accreditation_date.value;
			var next_accr = $scope.emp.nonRequiredProperties.next_accreditation_date.value;


			if (!first_name || !last_name || !middle_name || !age){
					return;
			}
			dbService.performSetProcedure("call cl_createUser('"+
				first_name + "','" +
				last_name + "','" +
				middle_name + "','" +
				sex + "'," +
				age + "," +
				post_id + "," +
				(license? license : "null") + "," +
				(last_accr? "'" + last_accr +"'" : "null")+ "," +
				(next_accr? "'" + next_accr +"'" : "null") + ")"
				);
		}
	}]).
	controller('CreateEmpCtrl', ['$scope', 'employeeFactory', function ($scope, employeeFactory){
		$scope.asd = 123;	
	}])