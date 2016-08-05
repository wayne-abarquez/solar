(function(){
'use strict';

angular.module('solarApp')
    .factory('webServices', ['webRequestServices', webServices]);
    
    function webServices(webRequestServices) {
        var service = {};

        service.getSolars = getSolars;
        service.getSolarDetail = getSolarDetail;
        service.updateSolar = updateSolar;

        function getSolars () {
            return webRequestServices.get('/api/solars');
        }

        function getSolarDetail (solarId) {
            console.log('getsolardetail solarID : ' + solarId);

            return webRequestServices.get('/api/solars/' + solarId);
        }

        function updateSolar (solarId, data) {
            return webRequestServices.put('/api/solars/' + solarId, data);
        }
        
        return service;
    }

}());