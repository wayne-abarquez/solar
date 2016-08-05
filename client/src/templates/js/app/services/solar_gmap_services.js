(function(){
'use strict';

angular.module('solarApp')
    .factory('solarGmapServices', ['$rootScope', 'gmapServices', solarGmapServices]);

    function solarGmapServices($rootScope, gmapServices) {
        var service = {};

        service.solarMarkers = [];

        service.gmapService = gmapServices;

        service.initialize = initialize;
        service.initializeSolarMarkers = initializeSolarMarkers;
        service.showSolarMarkers = showSolarMarkers;
        service.hideSolarMarkers = hideSolarMarkers;
        service.findMarkerById = findMarkerById;
        service.openSolarInfoWindowById = openSolarInfoWindowById;
        service.resetZoom = resetZoom;

        service.initialize();

        function initialize () {
            gmapServices.createMap('map-canvas');
        }

        function findMarkerById(solarId) {
            if (!service.solarMarkers.length) return;

            var solarMarker = null;

            service.solarMarkers.forEach(function (marker, key) {
                if(!marker.solar) return null;

                if (marker.solar.id == solarId) {
                    solarMarker = marker;
                    return false;
                }
            });
            return solarMarker;
        }

        function openSolarInfoWindowById(solarId) {
            var marker = service.findMarkerById(solarId);

            if(marker !== null) {
                google.maps.event.trigger(marker, 'click');
            }
        }

        function initializeSolarMarkers (solars) {
            if(solars == null || solars == 'undefined') {
                hideSolarMarkers();
                return;
            }

            // Close any infowindow
            gmapServices.closeAllInfoBox();

            //solars.forEach(function (solar, key) {
            //    if ('undefined' === typeof service.solarMarkers[key])
            //        service.solarMarkers[key] = [];
            //
            //    var marker = gmapServices.createCustomMarker(solar.coordinates);
            //    marker.infowindow = initInfowindow(solar);
            //    marker.solar = solar;
            //
            //    service.solarMarkers.push(marker);
            //
            //    gmapServices.addListener(marker, 'click', onClickSolarMarker);
            //});
            for (var i=0; i < service.solarMarkers.length || i < solars.length; i++) {
                var solar = solars[i];

                if (i >= service.solarMarkers.length) {
                    var marker = gmapServices.createCustomMarker(solar.coordinates);
                    marker.infowindow = initInfowindow(solar);
                    marker.solar = solar;
                    service.solarMarkers.push(marker);
                    gmapServices.addListener(marker, 'click', onClickSolarMarker);
                }
                else if (i >= solars.length) {
                    if (service.solarMarkers[i])
                        service.solarMarkers[i].solar = null;
                    gmapServices.hideMarker(service.solarMarkers[i]);
                }
                else if (service.solarMarkers[i]) {
                    service.solarMarkers[i].solar = solar;
                    service.solarMarkers[i].setPosition(solar.coordinates);
                    gmapServices.showMarker(service.solarMarkers[i]);
                }
            }
        }
        /* End of showSolarMarkers */


        function onClickSolarMarker () {
            gmapServices.openInfoBox(this.infowindow, this);
            gmapServices.panTo(this.getPosition());

            // Refresh variable
            //$rootScope.selectedSolar = null;

            // this refers to clicked marker
            $rootScope.selectedSolar = this.solar;
        }

        function showSolarMarkers () {
            if (!service.solarMarkers || service.solarMarkers.length <= 0) return;

            gmapServices.showMarkers(service.solarMarkers);
        }

        function hideSolarMarkers () {
            if(!service.solarMarkers || service.solarMarkers.length <= 0) return;

            gmapServices.hideMarkers(service.solarMarkers);

            // Close any infowindow
            gmapServices.closeAllInfoBox();
        }

        function resetZoom () {
            gmapServices.setZoomDefault();
        }

        function initInfowindow(solar) {
            var template = createInfowindowTemplate(solar);
            return gmapServices.createInfoBox(template);
        }

        function createInfowindowTemplate(solar) {
            return '<div class="marker_info none" id="marker_info">' +
                   '<div class="info" id="info">' +
                   '<h4>' + solar.project_name + '<span></span></h4>' +
                   '<span>' + solar.state + '</span>' +
                   '<a href="#!" class="infowindow_btn btn_view_solar_detail">More info</a>' +
                   '<span class="arrow"></span>' +
                   '</div>' +
                   '</div>';
        }

        return service;
    }
}());