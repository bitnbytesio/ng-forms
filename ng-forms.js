/*
 * ng-forms
 * @author: Harcharan Singh <artisangang@gmail.com>
 * @version 1.1
 * @git: https://github.com/artisangang/ng-forms
 */

(function (window, angular, undefined) {
    'use strict';
    angular.module('ngForms', ['ng']).provider('$ngForm', function () {


        this.$get = function ($http, $location) {

            var ngForm = {};

            var $http = $http;
            var $location = $location;

            ngForm.create = function ($config, $callbacks) {


                function ngFormHandler($config, $callbacks) {

                    var ngFormInstance = this;

                    $callbacks = $callbacks || {};
                    this.data = {};

                    this.internalScope = {};

                    this.callbacks = angular.extend({
                        success: function () {}
                    }, $callbacks);

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

                ngFormHandler.prototype.handle = function () {

                	var ngFormInstance = this;
                    var config = ngFormInstance.config;
                    var callbacks = ngFormInstance.callbacks;
                    
                    if (ngFormInstance.config.multipart) {

                        config.transformRequest = angular.identity;
                        config.headers['Content-Type'] = undefined;

                        config.data = new FormData();

                        for (var index in ngFormInstance.data) {
                            var key = index;
                            var value = ngFormInstance.data[index];
                            config.data.append(key, value);
                        }

                    } else {
                        config.params = ngFormInstance.data;
						config.paramSerializer = '$httpParamSerializerJQLike';
                    }


                    $http(config).success(function (o) {

                        callbacks.success(o);

                            if (o.errors) {

                                if (typeof callbacks.errorHandler == 'function') {
                                    callbacks.errorHandler(o.errors);
                                } 

                            }
                        
                        ngFormInstance.internalScope[config.path].response = o;

                        if (typeof o.alert != undefined) {
                        	ngFormInstance.internalScope.dismiss = function () {
                        		ngFormInstance.internalScope[config.path].response.alert = null;
                        	}
                        }
                        


                    }).error(function (err) {
                        console.log(err);
                    });
                };

                return new ngFormHandler($config, $callbacks);

            };

            return ngForm;
        };

    }).directive("fileModel", ['$parse', function ($parse) {
        return {
            restrict: 'A',
            scope: {
                fileModel: "="
            },
            link: function (scope, element, attrs) {

                element.bind("change", function (changeEvent) {

                    scope.$apply(function () {
                        scope.fileModel = element[0].files[0];

                    });


                });
            }
        }

    }]);

})(window, window.angular);
