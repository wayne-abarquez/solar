(function(){
'use strict';

angular.module('solarApp')
    .factory('webRequestServices', ['$http', 'Upload', webRequestServices]);
    
    function webRequestServices($http, Upload) {
        var service = {};

        // fix 401 errors being automatically handled by browsers
        var baseUrl = location.protocol + "//" + "user:pass@" + location.host + "/";

        function buildParams(params) {
            if (params != null && params.isObject)
                return _.map(params, function (key, val) {
                    return key + "=" + value;
                }).join("&");
            return "";
        };


        service.get = function (url, params) {
            return $http.get(baseUrl + url + "?" + buildParams(params));
        };


        service.post = function (url, params) {
            return $http({
                url: baseUrl + url,
                method: "POST",
                data: JSON.stringify(params),
                headers: {'Content-Type': 'application/json'}
            });
        };


        service.put = function (url, params) {
            return $http({
                url: baseUrl + url,
                method: "PUT",
                data: JSON.stringify(params),
                headers: {'Content-Type': 'application/json'}
            });
        };


        service.delete = function (url) {
            return $http.delete(url);
        };


        service.upload = function (url, fields, file) {
            return Upload.upload({
                url: baseUrl + url,
                method: 'POST',
                fields: fields,
                file: file
            });
        };


        return service;
    }

}());