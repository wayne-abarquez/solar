(function(){
'use strict';

angular.module('solarApp')
    .factory('loaderServices', ['$rootScope', loaderServices]);

    function loaderServices ($rootScope) {
        var service = {};

        service.showLoader = showLoader;
        service.hideLoader = hideLoader;

        function showLoader () {
            $rootScope.spinner.active = true;
        }

        function hideLoader (_doApply) {
            var doApply = _doApply || false;
            if(doApply) {
                $rootScope.$apply(function () {
                    $rootScope.spinner.active = false;
                });
            } else {
                $rootScope.spinner.active = false;
            }
        }
        

        return service;
    }
}());