(function(){
'use strict';

angular.module('solarApp')
    .controller('updateSolarController', ['$log', '$rootScope', '$scope', '$q', 'solar', 'SOLAR_STATUSES', 'usStates', 'modalServices', 'locationServices', 'gmapServices', 'drawingServices', 'alertServices', 'screenshotServices', 'uploadServices', 'solarPanelServices', 'local', updateSolarController]);

    function updateSolarController($log, $rootScope, $scope, $q, solar, SOLAR_STATUSES, usStates, modalServices, locationServices, gmapServices, drawingServices, alertServices, screenshotServices, uploadServices, solarPanelServices, local) {
        var vm = this;


        $scope.selectedTab = 0;
        /*
         Represents the SOLAR Model
         TODO: Need to change it to Backbone Model or Breeze
         */

        vm.solar = {
            id: 0,
            panels: []
        };

        vm.currentMarker = null;
        vm.areaPolygon = null;
        vm.local = null;

        /* Drawing Listeners Container */
        var areaListeners = {
            'saveAreaListener': null,
            'cancelListener': null,
            'deleteSelectedListener': null
        };

        /* Drawing Listeners for Panel */
        var panelListeners = {
          'savePanelAreaListener': null,
          'cancelPanelListener': null,
          'deleteSelectedPanelListener': null
        };

        var editPanelListeners = {
            'savePanelAreaListener': null,
            'cancelPanelListener': null,
            'deleteSelectedPanelListener': null
        };

        var screenshotTakenListener = null;
        var screenshotPhotoUploadedListener = null;

        var changePhotoFromScreenshotListener = null;
        var screenshotPhotoUpdateListener = null;

        /* Scope Functions here */
        vm.initialize = initialize;
        vm.updateSolar = updateSolar;
        vm.closeModal = closeModal;

        vm.initialize();

        /* General Info Tab Functions */
        vm.getCurrentLocation = getCurrentLocation;
        vm.pointCurrentLocation = pointCurrentLocation;
        vm.startDrawSite = startDrawSite;
        vm.stopDrawingMode = stopDrawingMode;

        /* Solar Panels Tab Functions */
        vm.addSolarPanel = addSolarPanel;
        vm.deleteSolarPanel = deleteSolarPanel;
        vm.onPanelItemClick = onPanelItemClick;
        vm.editSolarPanelShape = editSolarPanelShape;
        vm.editSolarPanelDetails = editSolarPanelDetails;

        /* Photos Tab Model */
        vm.uploadSolarPhotoModel = null;
        vm.uploadSolarPhotoErrorModel = null;

        /* Photos Tab Functions */
        vm.uploadSolarPhoto = uploadSolarPhoto;
        vm.openPhotoMenu = openPhotoMenu;
        vm.updateSolarPhoto = updateSolarPhoto;
        vm.deletePhoto = deletePhoto;
        vm.editSolarPhotoCaption = editSolarPhotoCaption;
        vm.initializeScreenshot = initializeScreenshot;
        vm.changePhotoFromScreenshot = changePhotoFromScreenshot;
        vm.previewImage = previewImage;


        /* Functions here */

        /* Scope Functions */
        function initialize () {
            vm.states = usStates;
            vm.statuses = SOLAR_STATUSES;

            $rootScope.local = angular.copy(local);
            $rootScope.local.push($scope);

            vm.local = local;
            vm.local.push($scope);

            // Close any infobox
            gmapServices.closeAllInfoBox();

            $scope.$watch(angular.bind(vm, function() {
                return vm.solar;
            }), function (){
                initializeSolar();
                initializeSolarPanels();
            });

            $rootScope.$watch('solarDetailSelectedTab', function(newValue, oldValue){
                $scope.selectedTab = newValue;
            });

            vm.solar = solar;

            $scope.$watch(angular.bind(vm, function () {
                if (vm.currentMarker) {
                    return vm.currentMarker.getPosition();
                }
            }), currentLocationChanged);

            $rootScope.$on('overlay-complete', function () {
                $rootScope.$apply(function () {
                    $rootScope.showSaveAreaBtn = true;
                    $rootScope.showDeleteSelectedBtn = true;
                });
            });

            screenshotPhotoUploadedListener = $rootScope.$on('solar-screenshot-photo-uploaded', function(event, photo) {
               console.log('listen from solar-screenshot-photo-uploaded event!');
               vm.solar.photos.push(photo);
            });

            screenshotPhotoUpdateListener = $rootScope.$on('solar-screenshot-photo-updated', function (event, photo, index) {
                console.log('listen from solar-screenshot-photo-updated event!');
                vm.solar.photos[index] = photo;
            });

            //if( !screenshotTakenListener) {
            //    screenshotTakenListener = $rootScope.$on('screenshot-taken', uploadScreenshotPhoto);
            //}

            $scope.$on('$destroy', function () {
                cleanUp();
            });
        }


        function updateSolar () {
            if (vm.areaPolygon) {
                vm.solar.area = drawingServices.getAreaFormData(vm.areaPolygon);
            }

            postToServer()
                .then( function(response) {
                    modalServices.hideModalWithReponse(response.solar);

                }, function(errorResponse) {
                    // TODO find a way to display error and fixed circular json issue
                    //console.log(errorResponse);
                    //var errorStr = JSON.stringify(errorResponse.data.errors);
                    alertServices.showInvalidDataMessages('Theres a problem processing your data.');

                });
        }

        function closeModal() {
            modalServices.closeModal();
        }

        /* General Info Tab Functions */

        function getCurrentLocation () {
            locationServices.getCurrentLocation()
                .then(function (position) {
                    // Clear current marker to
                    // display only one current marker
                    clearCurrentMarker();

                    // a watch triggers geocoding on the currentMarker
                    vm.currentMarker = locationServices.showCurrentLocation(position);
                });
        }

        function pointCurrentLocation() {
            // Clear current marker to
            // display only one current marker
            clearCurrentMarker();

            vm.currentMarker = locationServices.showDraggableLocation();

            gmapServices.addListener(vm.currentMarker, 'dragend', function (val) {
                $scope.$apply();
            });
        }

        function startDrawSite() {
            hideAreaPolygon();

            drawingServices.startDrawingMode();

            areaListeners.saveAreaListener = $scope.$on('save-area', saveArea);
            areaListeners.cancelListener = $scope.$on('cancel-drawing', cancelDrawing);
            areaListeners.deleteSelectedListener = $scope.$on('delete-selected', deleteSelected);
        }


        function stopDrawingMode() {
            drawingServices.stopDrawingMode();
            hideDrawingButtons();

            for (var key in areaListeners) {
                if (areaListeners.hasOwnProperty(key)) {
                    if (areaListeners[key]) {
                        areaListeners[key]();
                        areaListeners[key] = null;
                    }
                }
            }
            console.log('area listeners cleared');
        }

        /* End General Info Tab Functions */


        /* Solar Panel Tab Functions */

        function editSolarPanelDetails (event, panel, index) {
            var solar = $rootScope.local[0],
                dialog = $rootScope.local[1].showSolarDetailInfowindow;

            modalServices.showUpdateSolarPanelDetails(event, vm.solar, panel)
                .then( function(response){
                    console.log(response);
                    solar.panels[index] = response.panel;
                }, function (err) {
                    console.log(err);
                })
                .finally( function(){
                    dialog(solar);
                    $rootScope.solarDetailSelectedTab = 1;
                });
        }

        function editSolarPanelShape (panel, index) {

            solarPanelServices.initializeDrawPanel();
            // Hide Panel when editing
            solarPanelServices.hidePanelById(panel.id);

            editPanelListeners.savePanelAreaListener = $scope.$on('save-area', function(){
                if (!drawingServices.overlayDataArray.length) {
                    alertServices.showWarningDrawSolarPanelArea();
                    return;
                }
                solarPanelServices.updatePanel(vm.solar, panel)
                    .then(function (response) {
                        // update panel area from vm.solar.panels
                        vm.solar.panels[index] = response.panel;
                    }, function (errorResponse) {
                        console.log('error creating panel');
                        console.log(errorResponse);
                    });

                stopPanelDrawingMode();
            });

            editPanelListeners.cancelPanelListener = $scope.$on('cancel-drawing', function(){
                // show old panel
                solarPanelServices.showPanelById(panel.id);

                drawingServices.stopDrawingMode();
                hideDrawingButtons();

                for (var key in editPanelListeners) {
                    if (editPanelListeners.hasOwnProperty(key)) {
                        if (editPanelListeners[key]) {
                            editPanelListeners[key]();
                            editPanelListeners[key] = null;
                        }
                    }
                }
            });

            editPanelListeners.deleteSelectedPanelListener = $scope.$on('delete-selected', function () {
                console.log('delete selected edit panel is called');
                solarPanelServices.clearSelectedPanel();
                $rootScope.showDeleteSelectedBtn = false;
            });
        }


        function addSolarPanel () {
            // dismiss update modal
            // maintain of displaying the areaPolygon
            // enable drawing mode
            // show drawing controls
            // start draw panel
            solarPanelServices.initializeDrawPanel();

            panelListeners.savePanelAreaListener = $scope.$on('save-area', savePanelArea);
            panelListeners.cancelPanelListener = $scope.$on('cancel-drawing', stopPanelDrawingMode);
            panelListeners.deleteSelectedPanelListener = $scope.$on('delete-selected', deleteSelectedPanel);
            // listen for save event
            // validate ad save solar panel to db
            // disable drawing mode
            // show update modal
        }

        function deleteSolarPanel(panel, index) {
            solarPanelServices.deletePanel(vm.solar, panel)
                .then( function (response) {
                    vm.solar.panels.splice(index, 1);
                }, function (errorResponse) {
                    console.log('cannot delete panel!');
                });
        }

        function savePanelArea() {
            if (!drawingServices.overlayDataArray.length) {
                alertServices.showWarningDrawSolarPanelArea();
                return;
            }

            solarPanelServices.savePanel(vm.solar)
                .then( function(response) {
                    // push to vm.solar.panels the response panel
                    vm.solar.panels.push(response.panel);
                }, function(errorResponse) {
                   console.log('error creating panel');
                   console.log(errorResponse);
                });

            stopPanelDrawingMode();
        }

        function deleteSelectedPanel() {
            console.log('delete selected panel is called');
            solarPanelServices.clearSelectedPanel();
            $rootScope.showDeleteSelectedBtn = false;
        }

        function stopPanelDrawingMode() {
            drawingServices.stopDrawingMode();
            hideDrawingButtons();

            for(var key in panelListeners) {
                if (panelListeners.hasOwnProperty(key)) {
                    if(panelListeners[key]) {
                        panelListeners[key]();
                        panelListeners[key] = null;
                    }
                }
            }
        }

        function onPanelItemClick (panel) {
            solarPanelServices.onPanelClick(panel);
        }

        /* End of Solar Panel Tab Functions */

        /* Photos Tab Functions */

        function initializeScreenshot () {
            screenshotServices.startDrawing(solar, local);

            if (!screenshotTakenListener) {
                screenshotTakenListener = $rootScope.$on('screenshot-taken', uploadScreenshotPhoto);
            }
        }

        function uploadScreenshotPhoto (e, blob) {
            var file = uploadServices.parseScreenshotPhoto(blob);
            if(file) {
                uploadServices.uploadSolarPhoto(file, vm.solar)
                    .then(function(response){
                        var emit = $rootScope.$emit('solar-screenshot-photo-uploaded', response.solar_file);
                        emit = null;
                    }, function(err){
                        console.log(err);
                    });
            }
            if(screenshotTakenListener) {
                screenshotTakenListener();
                screenshotTakenListener = null;
            }
        }

        function editSolarPhotoCaption (newCaption, solarFile) {
            console.log('Edit Photo caption: ' + newCaption);
            var oldCaption = solarFile.caption;

            vm.solar.updatePhotoCaption(solarFile, newCaption)
                .then( function(response) {
                    console.log('success');
                    console.log(response);
                }, function(errorResponse) {
                    console.log('error!');
                    // Set old caption
                    console.log(errorResponse);
                });
        }

        function changePhotoFromScreenshot (photo, index) {
            screenshotServices.startDrawing(vm.solar, local);

            if (!changePhotoFromScreenshotListener) {
                changePhotoFromScreenshotListener = $rootScope.$on('screenshot-taken', function(e, blob){
                    console.log('change photo from screenshot listener called!');

                    var file = uploadServices.parseScreenshotPhoto(blob);
                    if (file) {
                        uploadServices.updateSolarPhoto(file, vm.solar, photo)
                            .then(function (response) {
                                console.log('successfully updated photo!');
                                console.log(response);

                                var emit = $rootScope.$emit('solar-screenshot-photo-updated', response.solar_file, index);
                                vm.solar.photos[index] = response.solar_file;
                                emit = null;

                            }, function (err) {
                                console.log(err);
                            });
                    }
                    if(changePhotoFromScreenshotListener) {
                        changePhotoFromScreenshotListener();
                        changePhotoFromScreenshotListener = null;
                    }
                });
            }
        }

        function uploadSolarPhoto (file, errorFiles) {
            if(file) {
                uploadServices.uploadSolarPhoto(file, vm.solar)
                    .then(function(response){
                        vm.solar.photos.push(response.solar_file);
                    }, function(errorResponse){
                        console.log('upload error');
                        console.log(errorResponse);
                    });
            } else {
                var errFile = errorFiles && errorFiles[0];
                alertServices.showInvalidFileUpload();
            }
        }

        function openPhotoMenu ($mdOpenMenu, ev) {
            $mdOpenMenu(ev);
        }

        function updateSolarPhoto (file, photo, index, errorFiles) {
            console.log('update photo index: '+index);

            if (file) {
                uploadServices.updateSolarPhoto(file, vm.solar, photo)
                    .then(function (response) {
                        console.log('successfully updated photo!');
                        console.log(response);
                        vm.solar.photos[index] = response.solar_file;
                    }, function (errorResponse) {
                        console.log('upload error');
                        console.log(errorResponse);
                    });
            } else {
                var errFile = errorFiles && errorFiles[0];
                alertServices.showInvalidFileUpload();
            }

        }

        function deletePhoto (photo, index) {
            vm.solar.deletePhoto(photo)
                .then( function (response) {
                    vm.solar.photos.splice(index, 1);

                }, function (errorResponse) {

                    console.log(errorResponse);
                    console.log('failed deleting photo');

                });

        }

        function previewImage (ev, photo) {
            modalServices.previewImage(ev, photo, vm.local)
                .then( function(response) {
                    console.log(response);
                }, function(errorResponse) {
                    var solar = $rootScope.local[0],
                        dialog = $rootScope.local[1].showSolarDetailInfowindow;
                    dialog(solar);

                    $rootScope.solarDetailSelectedTab = 2;
                });
        }

        /* End of Photos Tab Functions */


        /* Non-Scope Functions */

        function postToServer() {
            var deferred = $q.defer();

            var tempPanels = vm.solar.panels;
            vm.solar.panels = [];

            // PUT /api/solars/:id
            vm.solar.customPUT(vm.solar)
                .then(function (response) {
                    deferred.resolve(response);
                }, function (errorResponse) {
                    console.log('error Response');
                    deferred.reject(errorResponse);
                }).finally(function(){
                    vm.solar.panels = tempPanels;
                });

            return deferred.promise;
        }


        function cleanUp() {
            console.log('on destroy triggered');
            // Cancel Clean up if Screenshot mode is on
            if($rootScope.showScreenshotButtons) return;

            if(screenshotPhotoUploadedListener) {
                screenshotPhotoUploadedListener();
                screenshotPhotoUploadedListener = null;
            }

            hideAreaPolygon();
            hideCurrentMarker();
            hideSolarPanels();

            //Destroy listener
            destroyListeners();

            vm.stopDrawingMode();
            vm.areaPolygon = null;
            vm.currentMarker = null;

            console.log('done clean up');
        }

        function destroyListeners () {
            if (screenshotTakenListener) {
                screenshotTakenListener();
                screenshotTakenListener = null;
            }

            if(screenshotPhotoUploadedListener) {
                screenshotPhotoUploadedListener();
                screenshotPhotoUploadedListener = null;
            }

            if (changePhotoFromScreenshotListener) {
                changePhotoFromScreenshotListener();
                changePhotoFromScreenshotListener = null;
            }

            if (screenshotPhotoUpdateListener) {
                screenshotPhotoUpdateListener();
                screenshotPhotoUpdateListener = null;
            }
        }


        function clearCurrentMarker() {
            if (vm.currentMarker) {
                gmapServices.destroyMarker(vm.currentMarker);
            }
        }

        function hideCurrentMarker() {
            if (vm.currentMarker) {
                gmapServices.hideMarker(vm.currentMarker);
            }
        }

        function initializeSolar () {
            if (vm.solar == undefined || vm.solar == null) return;

            var solar = vm.solar;

            // Draw Polygon
            if(solar.area) {
                if(vm.areaPolygon) {
                    gmapServices.updatePolygon(vm.areaPolygon, solar.area);
                } else {
                    vm.areaPolygon = gmapServices.createPolygon(solar.area);
                }

                if( !vm.areaPolygon.getMap()) {
                    gmapServices.showPolygon(vm.areaPolygon);
                }
            }

            gmapServices.panTo(solar.coordinates);
            gmapServices.setZoomInDefault();
        }

        function initializeSolarPanels () {
            solarPanelServices.initializePanels(vm.solar.panels);
        }

        function hideAreaPolygon() {
            if (vm.areaPolygon) {
                gmapServices.hidePolygon(vm.areaPolygon);
            }
        }

        function hideSolarPanels() {
            solarPanelServices.hidePanels();
            vm.solar.panels = [];
        }

        /* Functions here */


        /* Drawing Functions */

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

        function hideDrawingButtons() {
            $rootScope.showMapCancelBtn = false;
            $rootScope.showDeleteSelectedBtn = false;
            $rootScope.showSaveAreaBtn = false;
        }

        /* End of Drawing Functions */

        /* Drawing Solar Panel Functions */

        function currentLocationChanged() {
            // Reverse Geocode position
            if (vm.currentMarker) {
                gmapServices.setZoomIfGreater(gmapServices.ZOOM_IN_LEVEL);
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

    }
}());