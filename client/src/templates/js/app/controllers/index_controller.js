(function(){
'use strict';

angular.module('solarApp')
    .controller('indexController', ['$scope', '$rootScope', '$timeout', 'modalServices', 'gmapServices',
        function ($scope, $rootScope, $timeout, modalServices, gmapServices) {
            var vm = this;

            // Selected tab in Solar Detail Dialog
            $rootScope.solarDetailSelectedTab = 0;

            // last SOLAR clicked
            $rootScope.selectedSolar = null;

            // Cancel button on drawing
            $rootScope.showMapCancelBtn = false;

            // Delete Selected Area when drawing
            $rootScope.showDeleteSelectedBtn = false;

            // Show Solar List on Bottom
            $rootScope.showSolarList = false;

            // Save Area Button on Creating/Updating SOLAR
            $rootScope.showSaveAreaBtn = false;

            // Screenshot Buttons
            $rootScope.showScreenshotButtons = false;

            $rootScope.showStrokeWidth = false;

            $rootScope.screenshotShapeFillColor = '';
            $rootScope.screenshotShapeStrokeColor = '';

            // Show Treasure Overlay Spinner
            $rootScope.spinner = {
                active: false
            };

            // Save Button for Creating/Updating Solar Panels
            // within Update Solar Feature
            //$rootScope.showSavePanelBtn = false;


            vm.initialize = initialize;
            vm.showAddSolarModal = showAddSolarModal;
            vm.toggleSolarList = toggleSolarList;
            vm.saveArea = saveArea;
            vm.cancelDrawing = cancelDrawing
            vm.deleteSelected = deleteSelected;

            vm.showStrokeWidthOptions = showStrokeWidthOptions;
            vm.endScreenshotMode = endScreenshotMode;
            vm.addTextBubble = addTextBubble;
            vm.startScreenshot = startScreenshot;

            vm.screenshotShapeFillColor = '';
            vm.screenshotShapeStrokeColor = '';
            vm.screenshotShapeStrokeWidth = '';

            vm.initialize();

            function initialize() {
                console.log('initialize called');

                watchScreenshotModels();
            }

            function watchScreenshotModels () {
                $scope.$watch(angular.bind(vm, function () {
                    return vm.screenshotShapeStrokeColor;
                }), function (newVal) {
                    //console.log('screenshot shape stroke color is changed: ' + newVal);
                    $rootScope.screenshotShapeStrokeColor = newVal;
                });

                $scope.$watch(angular.bind(vm, function () {
                    return vm.screenshotShapeFillColor;
                }), function (newVal) {
                    //console.log('screenshot shape fill color is changed: ' + newVal);
                    $rootScope.screenshotShapeFillColor = newVal;
                });

                $scope.$watch(angular.bind(vm, function () {
                    return vm.screenshotShapeStrokeWidth;
                }), function (newVal) {
                    //console.log('screenshot shape stroke color is changed: ' + newVal);
                    $rootScope.screenshotShapeStrokeWidth = newVal;
                });
            }


            function showAddSolarModal(ev) {
                // This will trigger "modal-opened" event
                modalServices.showAddSolar(ev).then(
                  function (result) {
                      gmapServices.setZoomDefault();
                      var solar = result;
                      $timeout(function () {
                          $rootScope.solarList.push(solar);
                      //    $scope.filterScips();
                      });
                  }, function (reason) {
                      gmapServices.setZoomDefault();
                      //$timeout(function () {
                      //    $scope.filterScips();
                      //});
                  }
              );
            }

            function toggleSolarList () {
                $rootScope.showSolarList = !$rootScope.showSolarList;
            }

            /**
             * Drawing Functions
             */

            function saveArea () {
                $rootScope.$broadcast('save-area');
            }

            function cancelDrawing () {
                $rootScope.$broadcast('cancel-drawing');
            }

            function deleteSelected () {
                $rootScope.$broadcast('delete-selected');
            }

            /* Screenshot Functions */
            function startScreenshot () {
                $rootScope.$broadcast('start-screenshot');
            }

            function addTextBubble () {
                $rootScope.$broadcast('add-screenshot-text-bubble');
            }

            function showStrokeWidthOptions () {
                console.log('stroke width options clicked');
                $rootScope.showStrokeWidth = !$rootScope.showStrokeWidth;
            }

            function endScreenshotMode () {
                console.log('broadcasting screenshot-cancelled');
                $rootScope.$broadcast('screenshot-cancelled');
            }

    }]);
}());