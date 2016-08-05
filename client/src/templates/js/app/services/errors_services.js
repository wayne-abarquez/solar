(function(){
'use strict';
//TODO error handler to display in angular material way coming from flask response
angular.module('solarApp')
    .factory('errorServices', [errorServices]);
    
    function errorServices() {
        var service = {};
        
        return service;
    }

}());