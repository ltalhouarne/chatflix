var myApp = angular.module('Chatflix', ["firebase", "ngRoute"]);

myApp.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.when('/chat', {
            templateUrl: 'assets/views/chat.html',
            controller: 'ChatCtrl'
        }).when('/friends', {
            templateUrl: 'assets/views/friends.html',
            controller: 'FriendsCtrl'
        }).when('/newAccount', {
            templateUrl: 'assets/views/subviews/newAccount.html',
            controller: 'NewAccountCtrl'
        }).when('/existingAccount', {
            templateUrl: 'assets/views/subviews/existingAccount.html',
            controller: 'ExistingAccountCtrl'
        }).when('/settings', {
            templateUrl: 'assets/views/settings.html',
            controller: 'SettingsCtrl'
        }).when('/forgotPassword', {
            templateUrl: 'assets/views/subviews/forgotPassword.html',
            controller: 'ForgotPasswordCtrl'
        }).when('/emailChange', {
            templateUrl: 'assets/views/subviews/emailChange.html',
            controller: 'EmailChangeCtrl'
        }).when('/passwordChange', {
            templateUrl: 'assets/views/subviews/passwordChange.html',
            controller: 'PasswordChangeCtrl'
        }).when('/deleteAccount', {
            templateUrl: 'assets/views/subviews/deleteAccount.html',
            controller: 'DeleteUserCtrl'
        }).when('/addFriend', {
            templateUrl: 'assets/views/friendSearch.html',
            controller: 'AddFriendCtrl'
        }).otherwise({
            redirectTo: '/login',
            templateUrl: 'assets/views/login.html',
            controller: 'LoginCtrl'
        });
    }]);

myApp.controller("NewAccountCtrl", function ($firebaseAuth, firebaseService, $scope, $location) {
    var auth = $firebaseAuth(firebaseService.getFirebaseInstance());

    $scope.error = false;
    $scope.loading = false;

    auth.$onAuth(function (authData) {
        if (authData) {
            isNewUser = false;
            firebaseService.getFirebaseInstance().child("users").child(authData.uid).set({
                provider: authData.provider,
                name: authData.password.email,
                profilePic: authData.password.profileImageURL,
                friends: {"name": "loic"},
                conversations: {"e": "loic"},
                request: {"email": "talhouar.loic@gmail.com"}
            });
            $scope.loading = false;
            $scope.error = false;
            $scope.$apply();
            $location.path('/friends');
        } else if (authData) {
            $location.path('/friends');
        }
    });

    $scope.create = function (user) {
        $scope.loading = true;
        firebaseService.getFirebaseInstance().createUser({
            email: user.new.email,
            password: user.new.password
        }, function (error) {
            if (error) {
                $scope.loading = false;
                $scope.error = true;
                $scope.$apply();
                console.log("Error creating user:", error);
            } else {
                $scope.loading = false;
                $scope.error = false;
                $scope.$apply();
                console.log("User created succesfully.");
                firebaseService.getFirebaseInstance().authWithPassword({
                    email: user.new.email,
                    password: user.new.password
                }, function (error, authData) {
                    if (error) {
                        console.log("Login Failed!", error);
                    } else {
                        console.log("called");
                    }
                });
            }
        });
    };

    $scope.cancel = function () {
        $location.path('/login');
    };
});

myApp.controller("ExistingAccountCtrl", function ($firebaseAuth, firebaseService, $scope, $location) {
    var auth = $firebaseAuth(firebaseService.getFirebaseInstance());

    $scope.error = false;
    $scope.loading = false;

    auth.$onAuth(function (authData) {
        if (authData) {
            $scope.loading = false;
            $scope.error = false;
            $scope.$apply();
            $location.path('/friends');
        }
    });

    $scope.login = function (user) {
        $scope.error = false;
        $scope.loading = true;
        firebaseService.getFirebaseInstance().authWithPassword({
            email: user.existing.email,
            password: user.existing.password
        }, function (error, authData) {
            if (error) {
                $scope.loading = false;
                $scope.error = true;
                $scope.$apply();
                console.log("Login Failed!", error);
            } else {
                $scope.error = false;
                $scope.$apply();
                console.log("Authenticated successfully.");
            }
        });
    };

    $scope.cancel = function () {
        $location.path('/login');
    };

    $scope.forgotPassword = function () {
        $location.path('/forgotPassword');
    };
});

myApp.controller("ForgotPasswordCtrl", function (firebaseService, $scope, $location) {
    $scope.resetPassword = function (user) {
        firebaseService.getFirebaseInstance().resetPassword({
            email: user.reset.email
        }, function (error) {
            if (error === null) {
                console.log("Password reset email sent successfully");
            } else {
                console.log("Error sending password reset email:", error);
            }
        });
    };

    $scope.cancel = function () {
        $location.path('/login');
    };
});

myApp.controller("LoginCtrl", function (firebaseService, $scope, $location) {
    if (firebaseService.getFirebaseInstance().getAuth() != null) {
        $location.path('/friends');
    }
    ;

    $scope.goToLogin = function () {
        $location.path('/existingAccount');
    };

    $scope.goToNewAccount = function () {
        $location.path('/newAccount');
    };
});

myApp.controller("ChatCtrl", function ($firebaseObject, firebaseService, $scope, $location) {
    $scope.profilePic = firebaseService.getProfilePicture();

    $scope.conversations = $firebaseObject( firebaseService.getFirebaseInstance().child('users')
        .child(firebaseService.getFirebaseInstance().getAuth().uid)
        .child('conversations'));

    $scope.sendMessage = function () {
        var messageParent = {};
        var messageChild = {};

        var date = new Date();

        messageChild.timestamp = date.getHours() + ":" + date.getMinutes() + " on " + date.getDate() + "/" + date.getMonth();
        messageChild.value = $scope.message.content;
        messageParent.message = messageChild;

        firebaseService.getFirebaseInstance().child('users')
            .child(firebaseService.getFirebaseInstance().getAuth().uid)
            .child('conversations')
            .push(messageParent);
    };

    $scope.logout = function () {
        firebaseService.logout();
        $location.path('/login');
    };

    $scope.addFriend = function () {
        $location.path('/addFriend');
    };

    $scope.goToFriends = function () {
        $location.path('/friends');
    };

    $scope.settings = function () {
        $location.path('/settings');
    };
});

myApp.controller("FriendsCtrl", function ($firebaseObject, firebaseService, $scope, $location) {

    $scope.friends = $firebaseObject( firebaseService.getFirebaseInstance().child('users')
        .child(firebaseService.getFirebaseInstance().getAuth().uid)
        .child('friends'));

    console.log($scope.friends);

    $scope.logout = function () {
        firebaseService.logout();
        $location.path('/login');
    };

    $scope.addFriend = function () {
        $location.path('/addFriend');
    };

    $scope.goToChat = function () {
        $location.path('/chat');
    };

    $scope.chatWithFriend = function (friend) {

    };

    $scope.settings = function () {
        $location.path('/settings');
    };
});

myApp.controller("SettingsCtrl", function (firebaseService, $scope, $location) {
    $scope.goToFriends = function () {
        $location.path('/friends');
    };

    $scope.goToChat = function () {
        $location.path('/chat');
    };

    $scope.addFriend = function () {
        $location.path('/addFriend');
    };

    $scope.changePassword = function (user) {
        $location.path('/passwordChange');
    };

    $scope.changeEmail = function (user) {
        $location.path('/emailChange');
    };

    $scope.deleteAccount = function (user) {
        $location.path('/deleteAccount');
    };

    $scope.logout = function () {
        firebaseService.logout();
        $location.path('/login');
    };
});

myApp.controller("EmailChangeCtrl", function (firebaseService, $scope, $location) {
    $scope.changeEmail = function (user) {
        firebaseService.getFirebaseInstance().changeEmail({
            oldEmail: "user.emailChange.email",
            newEmail: "user.emailChange.newEmail",
            password: "user.emailChange.password"
        }, function (error) {
            if (error === null) {
                console.log("Email changed successfully");
            } else {
                console.log("Error changing email:", error);
            }
        });
    };

    $scope.cancel = function () {
        $location.path('/settings');
    };
});

myApp.controller("PasswordChangeCtrl", function (firebaseService, $scope, $location) {
    $scope.resetPassword = function (user) {
        firebaseService.getFirebaseInstance().changePassword({
            email: "user.passwordChange.email",
            oldPassword: "user.passwordChange.oldPassword",
            newPassword: "user.passwordChange.newPassword"
        }, function (error) {
            if (error === null) {
                console.log("Password changed successfully");
            } else {
                console.log("Error changing password:", error);
            }
        });
    };

    $scope.cancel = function () {
        $location.path('/settings');
    };
});

myApp.controller("DeleteUserCtrl", function (firebaseService, $scope, $location) {
    $scope.deleteAccount = function (user) {
        firebaseService.getFirebaseInstance().removeUser({
            email: user.delete.email,
            password: user.delete.password
        }, function (error) {
            if (error === null) {
                console.log("User removed successfully");
            } else {
                console.log("Error removing user:", error);
            }
        });
    };

    $scope.cancel = function () {
        $location.path('/settings');
    };
});

myApp.controller("AddFriendCtrl", function (firebaseService, $scope, $location) {

    $scope.result = "";

    $scope.searchFriend = function (email) {
        if (email) {
            firebaseService.getFirebaseInstance().child('users')
                .orderByChild("name")
                .equalTo(email.trim())
                .once('value', function (returnedValue) {
                    if (returnedValue) {
                        console.log(returnedValue.val());
                        $scope.result = returnedValue.val();
                        $scope.$apply();
                    }
                });
        }
    };

    $scope.addFriend = function (email, pic) {
        var parentFriend = {};
        var childFriend = {};

        childFriend.name = email;
        childFriend.profilePic = pic;
        childFriend.watching = "Game of thrones";
        parentFriend.friend = childFriend;

        firebaseService.getFirebaseInstance().child('users')
            .child(firebaseService.getFirebaseInstance().getAuth().uid)
            .child('friends')
            .push(parentFriend);
    };

    $scope.cancel = function () {
        $location.path('/friends');
    };

    $scope.settings = function () {
        $location.path('/settings');
    };

    $scope.goToChat = function () {
        $location.path('/chat');
    };

    $scope.logout = function () {
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
        getProfilePicture: function () {
            return ref.getAuth().password.profileImageURL;
        },
        logout: function () {
            ref.unauth();
        }
    };
});