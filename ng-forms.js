/*
 * ng-forms
 * @author: Harcharan Singh <artisangang@gmail.com>
 * @version 1.5.4
 * @git: https://github.com/artisangang/ng-forms
 */

(function (window, angular, undefined) {
    'use strict';
    angular.module('ngForms', ['ng']).provider('$ngForm', function () {
        
      

        this.$get = ['$http','$location','$httpParamSerializerJQLike', function ($http, $location, $httpParamSerializerJQLike) {

            var ngForm = {};

            var $http = $http;
            var $location = $location;

            

            ngForm.create = function ($config, $callbacks) {

                var callbacks = {success: function () {}};


                function ngFormHandler($config, $callbacks) {

                    var ngFormInstance = this;

                    this.data = {};

                    this.internalScope = {};

                    this.callbacks = angular.extend(callbacks, $callbacks || {});

                    this.config = angular.extend({
                        url: $config.url || '/',
                        method: 'post',
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        multipart: false
                    }, $config);
                    this.data = {};

                    if (typeof this.config.scope != 'undefined' && typeof this.config.scope[this.config.path] != 'undefined') {

                        this.data = this.config.scope[this.config.path];

                        this.internalScope = this.config.scope;

                        var ref_path = this.config.path;

                        // watch scope
                        this.config.scope.$watch(ref_path, function (v) {
                            ngFormInstance.data = v;
                        });
                    }
         

                }

                ngFormHandler.prototype.parseValues = function (data) {

                    var instance = this;

                    var parsedData = {};
                    if (data) {
                        angular.forEach(data, function (value,key) {
                            if (value != null && value != 'null') {
                                if (value instanceof Array) {
                                    value = instance.parseValues(value);
                                }
                                parsedData[key] = value;
                            }
                        });
                    }

                    return parsedData;

                };

                ngFormHandler.prototype.handle = function () {

                    var ngFormInstance = this;
                    var config = ngFormInstance.config;
                    var callbacks = ngFormInstance.callbacks;

                    if (typeof ngFormInstance.data['response'] != 'undefined') {
                        delete ngFormInstance.data['response'];
                    }
                    
                    if (ngFormInstance.config.multipart === true) {
                        ngFormInstance.config.method == 'post'
                        config.transformRequest = angular.identity;
                        config.headers['Content-Type'] = undefined;

                         config.data = new FormData();
                        

                        for (var index in ngFormInstance.parseValues(ngFormInstance.data)) {
                            var key = index;
                            var value = ngFormInstance.data[index];
                            
                           

                             if (value instanceof Array) {
                                
                              for (var child in value) {
                                config.data.append(key +'[]', value[child]);
                              }

                            } else if (value instanceof FileList) {
                                for (var i=0; i<=value.length-1; i++) {
                                    config.data.append(key+ '['+i+']', value[i]);
                              }
                            } else {
                              config.data.append(key, value);
                            }
                            
                        }

                    } else if (ngFormInstance.config.method == 'post') {
                        config.headers['Content-Type'] = 'application/x-www-form-urlencoded;';
                         config.data = $httpParamSerializerJQLike(ngFormInstance.data);
                     
                   } else {
                        config.headers['Content-Type'] = 'application/x-www-form-urlencoded;';
                        config.params = ngFormInstance.data;
                        config.paramSerializer = '$httpParamSerializerJQLike';
                    }


                    $http(config).then(function (o) {

                    var o = o.data;
                
                        ngFormInstance.internalScope[config.path].response = o;

                        callbacks.success(o);

                        if (o.location != 'undefined') {
                            $location.path(o.location);
                        }

                        ngFormInstance.internalScope[config.path].response.hasError = function (key) {
                            return typeof o.errors == 'udefined' || o.errors[key] != 'undefined';
                        };

                        ngFormInstance.internalScope[config.path].response.error = function (key) {

                            if (typeof o.errors == 'undefined' || typeof o.errors[key] == 'undefined') return;

                            return (o.errors[key] == 'String') ? o.errors[key] : o.errors[key][0];
                        };

                        if (o.errors) {

                            if (typeof callbacks.errorHandler == 'function') {
                                callbacks.errorHandler(o.errors, ngFormInstance.path, ngFormInstance.scope);
                            } 

                        }
                        
                        

                        if (typeof o.alert != undefined) {
                                ngFormInstance.internalScope.dismiss = function () {
                                ngFormInstance.internalScope[config.path].response.alert = null;
                            }
                        }
                        


                    }, function (err) {

                        var o = {};

                        if (err.status == 422) {

                            ngFormInstance.internalScope[config.path].response = {};

                            ngFormInstance.internalScope[config.path].response.errors = err.data;

                            ngFormInstance.internalScope[config.path].response.hasError = function (key, index) {


                                if (typeof index != 'undefined') {
                                    return typeof err.data[index] != 'undefined' && typeof err.data[index][key] != 'undefined';
                                }

                                return typeof err.data[key] != 'undefined';
                            };

                            ngFormInstance.internalScope[config.path].response.error = function (key, index) {

                       
                                if (typeof index == 'undefined' && typeof err.data[key] == 'undefined') return;

                                if (typeof index != 'undefined' && typeof err.data[index] != 'undefined' && typeof err.data[index][key] != 'undefined') {
                                    return (err.data[index][key] instanceof Array) ? err.data[index][key][0] : err.data[index][key];
                                }

                                return (err.data[key] instanceof Array) ? err.data[key][0] : err.data[key];
                            };

                            if (typeof callbacks.errorHandler == 'function') {
                                callbacks.errorHandler(err.data, ngFormInstance.path, ngFormInstance.scope);
                            } 


                        }
                        
                        if (typeof callbacks.exceptionHandler == 'function') {
                                callbacks.exceptionHandler(err);
                        } 

                    });
                };

                return new ngFormHandler($config, $callbacks);

            };

            return ngForm;
        }];

    }).directive("fileModel", ['$parse', function ($parse) {
        return {
            restrict: 'A',
            scope: {
                fileModel: "="
            },
            link: function (scope, element, attrs) {

                element.bind("change", function (changeEvent) {

                    scope.$apply(function () {
                         if (attrs.multiple) {
                            scope.fileModel = element[0].files;
                        } else {
                            scope.fileModel = element[0].files[0];
                        }

                    });


                });
            }
        }

    }]);

})(window, window.angular);
