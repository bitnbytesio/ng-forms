(function (window, angular, undefined) {
    'use strict';
    angular.module('ngForms', ['ng']).provider('$ngForm', function () {


        this.$get = function ($http, $location) {

            var ngForm = {};

            var $http = $http;
            var $location = $location;

            ngForm.handle = function ($form, $config, $callbacks) {


                function ngFormHandler($form, $config, $callbacks) {

                    var ngFormInstance = this;

                    $callbacks = $callbacks || {};

                    this.form = $form;


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

                    if (typeof this.config.scope != 'undefined') {
                        var ref_path = this.config.scopePath;

                        this.config.scope.$watch(ref_path, function (v) {
                            ngFormInstance.form = v;
                        });
                    }

                }

                ngFormHandler.prototype.handle = function () {


                    var config = this.config;

                    var callbacks = this.callbacks;
                    var $form = this.form;


                    if (this.config.multipart) {

                        config.transformRequest = angular.identity;
                        config.headers['Content-Type'] = undefined;

                        config.data = new FormData();
                        for (var index in this.form) {
                            var key = index;
                            var value = this.form[index];
                            config.data.append(key, value);
                        }
                    } else {
                        config.data = $.param(this.form);
                    }


                    $http(config).success(function (o) {

                        if (jQuery(document).find('form')) {
                            $(document).find('form .has-error').each(function () {

                                $(this).removeClass('has-error');
                                $(this).find('.help-block').html('');

                            });
                        }


                        callbacks.success(o);

                            if (o.errors) {

                                if (typeof callbacks.errorHandler == 'function') {
                                    callbacks.errorHandler(o.errors);
                                } else {

                                    var err_prefix = config.errPrefix;
                                    for (var e_index in o.errors) {


                                        var ele = '[ng-model="' + err_prefix + '.' + e_index + '"], [file-model="' + err_prefix + '.' + e_index + '"]';

                                        var eleObject = jQuery(document).find(ele);

                                        eleObject.parent().find('.help-block').html(o.errors[e_index][0]);
                                        jQuery(eleObject).parent().before().addClass('has-error');
                                    }
                                }
                            }

                        if (o.message) {
                            //$('#myId').closest('form');
                        }



                    }).error(function (err) {
                        console.log(err);
                    });
                };

                return new ngFormHandler($form, $config, $callbacks);

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

                // var model = $parse(attrs.fileModel);
                // var modelSetter = model.assign;

                element.bind("change", function (changeEvent) {


                    scope.$apply(function () {
                        //scope[attributes.fileModel] = element[0].files[0];
                        scope.fileModel = element[0].files[0];
                        // modelSetter(scope, element[0].files[0]);
                        // modelSetter(scope, element[0].files[0]);

                    });


                });
            }
        }

    }]);

})(window, window.angular);