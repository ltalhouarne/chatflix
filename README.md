# chatflix
**Google chrome extension** to chat with friends and sync to their Netflix shows. Uses a **Firebase** database.

## App screenshots:

<img src="https://github.com/ltalhouarne/chatflix/blob/master/img/Screen%20Shot%202016-12-03%20at%205.24.32%20PM.png" width="250">
<img src="https://github.com/ltalhouarne/chatflix/blob/master/img/Screen%20Shot%202016-12-03%20at%205.24.49%20PM.png" width="250">
<img src="https://github.com/ltalhouarne/chatflix/blob/master/img/Screen%20Shot%202016-12-03%20at%205.25.14%20PM.png" width="250">
<img src="https://github.com/ltalhouarne/chatflix/blob/master/img/Screen%20Shot%202016-12-03%20at%205.25.38%20PM.png" width="250">

## Firebase rules:

```
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid",
        ".validate": "newData.hasChildren(['name', 'username', 'profilePic', 'public'])",
        "name": {
          ".read": "auth != null && auth.uid == $uid",
          ".write": "auth != null && auth.uid == $uid"
        },
        "username": {
          ".read": "auth != null && auth.uid == $uid",
          ".write": "auth != null && auth.uid == $uid && root.child('usernames/' + newData.val()).exists() != true"
        },
        "profilePic": {
          ".read": "auth != null && auth.uid == $uid",
          ".write": "auth != null && auth.uid == $uid"
        },
        "public": {
          ".read": "auth != null && auth.uid == $uid || root.child('users/' + $uid + '/friends/' + auth.uid).exists()",
          ".write": "auth != null && auth.uid == $uid"
        },
        "friends": {
          ".read": "auth != null && auth.uid == $uid",
          //TODO: prevent user form adding himself/herself
          ".write": "auth != null && auth.uid == $uid"
        },
        "conversations": {
          ".read": "auth != null && auth.uid == $uid",
          ".write": "auth != null && auth.uid == $uid || root.child('users/' + $uid + '/friends/' + auth.uid).exists()"
        },
        "requests": {
          ".read": "auth != null && auth.uid == $uid",
          ".write": "auth != null && auth.uid == $uid || ((data.child(auth.uid).child('accepted').val() == false || data.child(auth.uid).exists() == false) && newData.child(auth.uid).child('accepted').val() == false && newData.child(auth.uid).child('uid').val() == auth.uid)",
          ".indexOn": "accepted"
        },
        "$other": {
          ".validate": false
        },
      }
    },
    "usernames": {
      ".read": "auth != null && auth.uid != null",
      "$username": {
        ".write": "auth != null && auth.uid != null && root.child('usernames/' + $username).exists() != true"
      },
      ".indexOn": "value"
    }
  }
}
```
