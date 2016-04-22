var myApp = angular.module('Chatflix', ["firebase", "ngRoute"]);

myApp.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider
        .when('/chat', {
            templateUrl: 'assets/views/chat.html',
            controller: 'ChatCtrl'
        }).when('/friends', {
            templateUrl: 'assets/views/friends.html',
            controller: 'FriendsCtrl'
        }).when('/chat/:friendid', {
            templateUrl: 'assets/views/chatWithFriend.html',
            controller: 'ChatWithFriendCtrl'
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
    $scope.error = false;
    $scope.loading = false;

    $scope.create = function (user) {
        $scope.loading = true;

        firebaseService.getFirebaseInstance().createUser({
            email: user.new.email,
            password: user.new.password
        }, function (error, userData) {
            if (error) {
                switch (error.code) {
                    case "EMAIL_TAKEN":
                        console.log("The new user account cannot be created because the email is already in use.");
                        break;
                    case "INVALID_EMAIL":
                        console.log("The specified email is not a valid email.");
                        break;
                    default:
                        console.log("Error creating user:", error);
                }
                $scope.loading = false;
                $scope.error = true;
                $scope.$apply();
            } else {
                $scope.error = false;
                $scope.$apply();
                var _authData;
                console.log("User created succesfully.");

                firebaseService.getFirebaseInstance().authWithPassword({
                    email: user.new.email,
                    password: user.new.password
                }, function (error, authData) {
                    if (error) {
                        $scope.loading = false;
                        $scope.error = true;
                        console.log("Login Failed!", error);
                    } else {
                        $scope.loading = false;
                        $scope.error = false;
                        $scope.$apply();
                        console.log("Login successful.");

                        var publicInfo = {};
                        publicInfo.status = true;
                        publicInfo.watching = "";
                        publicInfo.time = "";

                        firebaseService.getFirebaseInstance().child("users").child(authData.uid).set({
                            name: authData.password.email,
                            username: user.new.username,
                            profilePic: authData.password.profileImageURL,
                            public: publicInfo
                        }, function (error) {
                            if (error) {
                                firebaseService.logout();
                                $scope.loading = false;
                                $scope.error = true;
                                $scope.$apply();
                                console.log("Error creating user object.", error);
                            } else {
                                firebaseService.getFirebaseInstance().child("usernames").child(user.new.username).set({
                                    value: user.new.username,
                                    profilePic: authData.password.profileImageURL,
                                    uid: authData.uid
                                }, function (error) {
                                    if (error) {
                                        console.log("here");
                                        firebaseService.logout();
                                        $scope.loading = false;
                                        $scope.error = true;
                                        $scope.$apply();
                                        console.log("Error creating username object.", error);
                                    } else {
                                        console.log("no errors");
                                        $location.path('/friends');
                                        if (!$scope.$$phase) $scope.$apply();
                                    }
                                });
                            }
                        });
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
});

myApp.controller("ChatWithFriendCtrl", function ($route, $anchorScroll, $firebaseObject, firebaseService, $scope, $location) {
    $scope.emptyResult = true;

    if($route.current.params.friendid) {
        firebaseService.getFirebaseInstance().child('users')
            .child(firebaseService.getFirebaseInstance().getAuth().uid)
            .child("friends")
            .child($route.current.params.friendid)
            .once('value', function (returnedValue) {
                if (returnedValue.val()) {
                    $scope.result = returnedValue.val();
                    $scope.profilePicNS = $scope.result.profilePic;
                } else {
                    console.log("error");
                    $scope.error = true;
                }
            });

        $scope.conversations = $firebaseObject(firebaseService.getFirebaseInstance().child('users')
            .child(firebaseService.getFirebaseInstance().getAuth().uid)
            .child('conversations')
            .child($route.current.params.friendid));

        $scope.conversations.$loaded().then(function () {
            console.log($scope.conversations);
            $scope.emptyResult = $scope.conversations.$value === null && $scope.conversations.$value !== undefined;
            $scope.loading = false;
        });
    }

    $scope.loading = true;

    $scope.profilePicS = firebaseService.getProfilePicture();

    function formatAMPM(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }

    $scope.sendMessage = function () {
        var message = {};

        var date = new Date();

        message.timestamp = formatAMPM(date) + " on " + ('0' + date.getDate()).slice(-2) + "/" + ('0' + (date.getMonth()+1)).slice(-2);
        message.value = $scope.message.content;

        $scope.message.content = "";

        message.self = true;
        firebaseService.getFirebaseInstance().child('users')
            .child(firebaseService.getFirebaseInstance().getAuth().uid)
            .child('conversations')
            .child($route.current.params.friendid)
            .push(message);

        message.self = false;
        firebaseService.getFirebaseInstance().child('users')
            .child($route.current.params.friendid)
            .child('conversations')
            .child(firebaseService.getFirebaseInstance().getAuth().uid)
            .push(message);
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

    $scope.goToChat = function () {
        $location.path('/chat');
    };

    $scope.settings = function () {
        $location.path('/settings');
    };
});

myApp.controller("ChatCtrl", function ($route, $anchorScroll, $firebaseObject, $firebaseArray, firebaseService, $scope, $location) {
    $scope.loading = true;
    $scope.emptyResult = false;

    $scope.friendsWithProfilePictures = [];

    $scope.friends = $firebaseArray(firebaseService.getFirebaseInstance()
        .child('users')
        .child(firebaseService.getFirebaseInstance().getAuth().uid)
        .child('friends'));

    $scope.friends.$loaded().then(function () {
        angular.forEach($scope.friends, function (value) {
            console.log(value);
        });
        
        for (var key in $scope.friends[0]) {
            if($scope.friends[0][key] !== undefined && $scope.friends[0][key] !== null){
                if($scope.friends[0][key].profilePic){
                    var friend = {};
                    friend.profilePic = $scope.friends[0][key].profilePic;
                    friend.username = $scope.friends[0][key].username;
                    friend.id = $scope.friends[0].$id;
                    $scope.friendsWithProfilePictures.push(friend);
                }
            }
        }

        $scope.conversations = [];

        if($scope.friendsWithProfilePictures.length != 0){
            angular.forEach($scope.friendsWithProfilePictures, function(value){
                var lastMessage = {};

                lastMessage.message = $firebaseArray(firebaseService.getFirebaseInstance().child('users')
                    .child(firebaseService.getFirebaseInstance().getAuth().uid)
                    .child('conversations')
                    .child(value.id)
                    .limitToLast(1));

                lastMessage.message.$loaded().then(function(){
                    lastMessage.message = lastMessage.message[0].value;
                    lastMessage.profilePic = value.profilePic;
                    lastMessage.username = value.username;
                    lastMessage.id = value.id;
                    $scope.conversations.push(lastMessage);
                });
            });
        }

        $scope.emptyResult = $scope.conversations.length == 0;
        $scope.loading = false;
    });

    $scope.logout = function () {
        firebaseService.logout();
        $location.path('/login');
    };

    $scope.addFriend = function () {
        $location.path('/addFriend');
    };

    $scope.chatWithFriend = function (friendid) {
        $location.path('/chat/' + friendid);
    };

    $scope.goToFriends = function () {
        $location.path('/friends');
    };

    $scope.settings = function () {
        $location.path('/settings');
    };

    $scope.goToChat = function () {
        $location.path('/chat');
    };
});

myApp.controller("FriendsCtrl", function ($anchorScroll, $firebaseObject, firebaseService, $scope, $location) {
    // chrome.tabs.getAllInWindow(null, function(tabs){
    //     for (var i = 0; i < tabs.length; i++) {
    //         if(tabs[i].active && tabs[i].url.indexOf("netflix")){
    //             console.log(document.body.outerHTML);
    //         }
    //     }
    // });

    $scope.loading = true;
    $scope.emptyResult = false;

    $scope.friends = $firebaseObject(firebaseService.getFirebaseInstance()
        .child('users')
        .child(firebaseService.getFirebaseInstance().getAuth().uid)
        .child('friends'));

    $scope.friends.$loaded().then(function () {
        $scope.emptyResult = $scope.friends.$value === null && $scope.friends.$value !== undefined;
        $scope.loading = false;
    });

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

    $scope.chatWithFriend = function (friendid) {
        $location.path('/chat/' + friendid);
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
    $scope.uid = firebaseService.getFirebaseInstance().getAuth().uid;
    $scope.result = "";
    $scope.loading = false;
    $scope.error = false;
    $scope.success = false;

    $scope.searchFriend = function (username) {
        $scope.loading = true;
        $scope.error = false;
        $scope.success = false;
        $scope.result = "";
        if (username) {
            firebaseService.getFirebaseInstance().child('usernames')
                .orderByChild("value")
                .equalTo(username.trim())
                .once('value', function (returnedValue) {
                    if (returnedValue.val()) {
                        $scope.result = returnedValue.val();
                        $scope.$apply();
                    } else {
                        $scope.error = true;
                        $scope.$apply();
                    }
                });
        }
        $scope.loading = false;
    };

    $scope.addFriend = function (key, username, pic) {
        var friend = {};

        friend.username = username;
        friend.profilePic = pic;

        $scope.success = false;

        firebaseService.getFirebaseInstance().child('users')
            .child(firebaseService.getFirebaseInstance().getAuth().uid)
            .child('friends')
            .child(key)
            .set(friend, function (error) {
            if (error) {
                $scope.loading = false;
                $scope.error = true;
                $scope.success = false;
                $scope.$apply();
                console.log("Adding a friend failed!", error);
            } else {
                $scope.error = false;
                $scope.loading = false;
                $scope.success = true;
                $scope.$apply();
                console.log("Added friend successfully.");
            }
        });
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

    $scope.goToFriends = function () {
        $location.path('/friends');
    };

    $scope.logout = function () {
        console.log("Called");
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