(function(){
'use strict';

angular.module('solarApp')
    .factory('infoWindowServices', ['gmapServices', infoWindowServices]);

    function infoWindowServices (gmapServices) {
        var service = {};

        var uniqueId = 0;
        var openList = [];
        var closeList = [];

        service.addInfoWindow = addInfoWindow;
        service.clearInfoWindows = clearInfoWindows;

        function addInfoWindow(position) {
            var infoWindow = gmapServices.createCanvasInfoWindow();
            infoWindow.uniqueId = uniqueId++;
            infoWindow.setPosition(position);
            infoWindow.open();
            openList.push(infoWindow);
        }

        function clearInfoWindows() {
            while (openList.length > 0) {
                var infoWindow = openList[openList.length - 1];
                openList.splice(openList.length - 1, 1);
                gmapServices.hideCanvasInfoWindow(infoWindow);
                closeList.push(infoWindow);
            }
        }

        return service;
    }
}());