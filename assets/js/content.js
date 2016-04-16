var myApp = angular.module('Chatflix', ["firebase", "ngRoute"]);

myApp.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.when('/chat', {
            templateUrl: 'assets/views/chat.html',
            controller: 'ChatController'
        }).when('/friends', {
            templateUrl: 'assets/views/friends.html',
            controller: 'FriendsController'
        }).when('/newAccount', {
            templateUrl: 'assets/views/subviews/newAccount.html',
            controller: 'newAccountCtrl'
        }).when('/existingAccount', {
            templateUrl: 'assets/views/subviews/existingAccount.html',
            controller: 'existingAccountCtrl'
        }).otherwise({
            redirectTo: '/login',
            templateUrl: 'assets/views/login.html',
            controller: 'LoginController'
        });
    }]);

myApp.controller("newAccountCtrl", function (firebaseService, $scope, $location, $localStorage) {
    $scope.create = function (user) {
        firebaseService.getFirebaseInstance().createUser({
            email: user.new.email,
            password: user.new.password
        }, function (error) {
            if (error) {
                console.log("Error creating user:", error);
            } else {
                console.log("User created succesfully.");
                firebaseService.getFirebaseInstance().authWithPassword({
                    email: user.new.email,
                    password: user.new.password
                }, function (error, authData) {
                    if (error) {
                        console.log("Login Failed!", error);
                    } else {
                        console.log("Authenticated successfully.", authData);
                        $location.path('/friends');
                    }
                });
            }
        });
    };

    $scope.cancel = function () {
        $location.path('/login');
    };
});

myApp.controller("existingAccountCtrl", function (firebaseService, $scope, $location) {
    $scope.login = function (user) {
        firebaseService.getFirebaseInstance().authWithPassword({
            email: user.existing.email,
            password: user.existing.password
        }, function (error, authData) {
            if (error) {
                console.log("Login Failed!", error);
            } else {
                console.log("Authenticated successfully.", authData);
                $location.path('/chat');
            }
        });
    };

    $scope.cancel = function () {
        $location.path('/login');
    };
});

myApp.controller("LoginController", function (firebaseService, $scope, $location) {
    if(firebaseService.getFirebaseInstance().getAuth() != null){
        $location.path('/chat');
    };

    $scope.goToLogin = function() {
        $location.path('/existingAccount');
    };

    $scope.goToNewAccount = function() {
        $location.path('/newAccount');
    };
});

myApp.controller("ChatController", function ($scope, firebaseService, $location) {
    $scope.profilePic = firebaseService.getProfilePicture();

    $scope.logout = function() {
        firebaseService.logout();
        $location.path('/login');
    };
});

myApp.controller("FriendsController", function ($scope, $firebaseObject) {
    $scope.logout = function() {
        firebaseService.logout();
        $location.path('/login');
    };
});

myApp.service('firebaseService', function () {
    var ref = new Firebase("https://boiling-torch-9741.firebaseio.com");

    return {
        getFirebaseInstance: function () {
            return ref;
        },
        getProfilePicture: function() {
            return ref.getAuth().password.profileImageURL;
        },
        logout: function() {
            ref.unauth();
        }
    };
});