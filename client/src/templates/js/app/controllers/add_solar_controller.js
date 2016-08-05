(function(){
'use strict';

angular.module('solarApp')
    .controller('addSolarController', ['$log', '$rootScope', '$scope', 'usStates', 'modalServices', 'locationServices', 'gmapServices', 'drawingServices', 'Solars', 'alertServices', addSolarController]);

    function addSolarController($log, $rootScope, $scope, usStates, modalServices, locationServices, gmapServices, drawingServices, Solars, alertServices) {
        var vm = this;

        vm.states = usStates;

        vm.currentMarker = null;
        vm.areaPolygon = null;

        /*
        Represents the SOLAR Model
        TODO: Need to change it to Backbone Model or Breeze
        */
        vm.solar = {};

        var saveAreaListener = null;
        var cancelListener = null;
        var deleteSelectedListener = null;


        /* Scope Functions here */

        vm.initialize = initialize;
        vm.getCurrentLocation = getCurrentLocation;
        vm.pointCurrentLocation = pointCurrentLocation;
        vm.startDrawSite = startDrawSite;
        vm.stopDrawingMode = stopDrawingMode;
        vm.closeModal = closeModal;
        vm.saveSolar = saveSolar;

            vm.initialize();


        function initialize() {

            $scope.$watch(angular.bind(vm, function() {
                if(vm.currentMarker) {
                    return vm.currentMarker.getPosition();
                }
            }), currentLocationChanged);

            $rootScope.$on('overlay-complete', function() {
                $rootScope.$apply(function(){
                    $rootScope.showSaveAreaBtn = true;
                    $rootScope.showDeleteSelectedBtn = true;
                });
            });

            // Called everytime
            // when modal is closed/dismissed
            $scope.$on('$destroy', function(){
                cleanUp();
            });

        };


        function saveSolar () {
            if(vm.areaPolygon) {
                vm.solar.area = drawingServices.getAreaFormData(vm.areaPolygon);
            }

            Solars.post(vm.solar)
                .then( function(response){
                    console.log('Save Solar Response : ' + JSON.stringify(response));
                    modalServices.hideModalWithReponse(response.solar);
                }, function(response) {
                    console.log('error');
                    var error = response.data.errors;
                    var errorStr = JSON.stringify(error);
                    alertServices.showInvalidDataMessages(errorStr);
                });
        }


        function getCurrentLocation () {
          locationServices.getCurrentLocation()
              .then(function(position){
                  // Clear current marker to
                  // display only one current marker
                  clearCurrentMarker();

                  gmapServices.setZoomIfGreater(gmapServices.ZOOM_IN_LEVEL);

                  // a watch triggers geocoding on the currentMarker
                  vm.currentMarker = locationServices.showCurrentLocation(position);
              });
        }


        function pointCurrentLocation () {
            // Clear current marker to
            // display only one current marker
            clearCurrentMarker();

            vm.currentMarker = locationServices.showDraggableLocation();

            gmapServices.addListener(vm.currentMarker, 'dragend', function(val) {
                gmapServices.setZoomIfGreater(gmapServices.ZOOM_IN_LEVEL);
                $scope.$apply();
            });
        }


        function startDrawSite() {
            hideAreaPolygon();

            // Show Cancel Map button
            $rootScope.showMapCancelBtn = true;

            drawingServices.startDrawingMode();

            saveAreaListener = $rootScope.$on('save-area', saveArea);
            cancelListener = $rootScope.$on('cancel-drawing', cancelDrawing);
            deleteSelectedListener = $rootScope.$on('delete-selected', deleteSelected);
        }


        function stopDrawingMode() {
            drawingServices.stopDrawingMode();

            hideDrawingButtons();

            if (cancelListener) {
                cancelListener();
                cancelListener = null;
            }

            if(saveAreaListener) {
                saveAreaListener();
                saveAreaListener = null;
            }
        }


        function closeModal() {
            modalServices.closeModal();
        }

        /* Functions here */

        function hideDrawingButtons() {
            $rootScope.showMapCancelBtn = false;
            $rootScope.showDeleteSelectedBtn = false;
            $rootScope.showSaveAreaBtn = false;
        }

        function clearCurrentMarker() {
            if (vm.currentMarker) {
                gmapServices.destroyMarker(vm.currentMarker);
            }
        }

        function currentLocationChanged() {
            // Reverse Geocode position
            if (vm.currentMarker) {
                gmapServices.centerMarker(vm.currentMarker);

                vm.solar.coordinates = vm.currentMarker.getPosition().toJSON();

                gmapServices.reverseGeocode(vm.solar.coordinates)
                    .then(function (result) {
                        var formatted_address = result[0].formatted_address;
                        $log.info(formatted_address);
                        vm.solar.address = formatted_address;
                    });
            }
        }


        function saveArea() {
            if (!drawingServices.overlay) {
                alertServices.showWarningDrawSiteArea();
                return;
            }

            vm.solar.area = drawingServices.overlayDataArray;

            if (vm.areaPolygon) {
                if (!vm.areaPolygon.getMap()) {
                    vm.areaPolygon.setMap(gmapServices.map);
                }
                gmapServices.updatePolygon(vm.areaPolygon, vm.solar.area);
            } else {
                vm.areaPolygon = gmapServices.createPolygon(vm.solar.area);
            }

            vm.stopDrawingMode();
        }


        function cancelDrawing() {
            if (vm.areaPolygon && !vm.areaPolygon.getMap()) {
                gmapServices.showPolygon(vm.areaPolygon);
            } else {
                vm.areaPolygon = null;
            }

            vm.stopDrawingMode();
        }


        function deleteSelected() {
            if (drawingServices.overlay) {
                drawingServices.clearOverlay();
                $rootScope.showDeleteSelectedBtn = false;
                $rootScope.showSaveAreaBtn = false;
            }
        }


        function cleanUp() {
            hideAreaPolygon();
            hideCurrentMarker();
            vm.stopDrawingMode();
            vm.areaPolygon = null;
            vm.currentMarker = null;
        }


        function hideCurrentMarker() {
            if (vm.currentMarker) {
                gmapServices.hideMarker(vm.currentMarker);
            }
        }


        function hideAreaPolygon() {
            if (vm.areaPolygon) {
                gmapServices.hidePolygon(vm.areaPolygon);
            }
        }

    }
}());