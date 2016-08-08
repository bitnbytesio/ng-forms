# ng-forms
Form Handler for angular js

# Usage

```javascript
var myApp = angular.module('myApp', ['ngRoute', 'ngForms']);
```

```javascript



$scope.handleLogin = $ngForm.handle($scope.loginForm, {

        url: 'login',

        method: 'post',

        errPrefix: 'loginForm', // prefix helps to find error placeholder in case you have multiple forms on single page

        multipart: false // make it true in case of file upload

    }, {

        errorHandler: function (errors) {


        },

        success: function (o) {



        }

    });
    
    
     $request = $ngForm.handle($scope.signupForm, {

                url: 'register',

                method: 'post',

                errPrefix: 'signupForm',

                multipart: true,

                scope:$scope // bind scope to implement watcher

            }, {

                success: function (o) {

                   

                }

            });


```
