(function(){
'use strict';

angular.module('solarApp')
    .factory('locationServices', ['$q', 'gmapServices', locationServices]);

    function locationServices($q, gmapServices) {
        var service = {};

        service.getCurrentLocation = function () {
            if(!navigator.geolocation) {
                console.log('Browser doesnt support Geolocation');
                return false;
            }
            var defer = $q.defer();

            navigator.geolocation.getCurrentPosition(function(position) {
               defer.resolve(position);
            });

            return defer.promise;
        };

        // Parameter must be a latLng
        service.showCurrentLocation = function (position) {
            var latLng = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            var marker = gmapServices.showCurrentLocation(latLng);
            var offset = 0.002;


            gmapServices.panToOffsetLeft(latLng, offset);
            gmapServices.setZoomInDefault();

            return marker;
        };

        service.showDraggableLocation = function () {
            var draggable = true,
                latLng = gmapServices.map.getCenter();

            var marker = gmapServices.showCurrentLocation(latLng, draggable);

            //gmapServices.panToOffsetLeft(latLng);

            return marker;
        };

        return service;
    }

}());