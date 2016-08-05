(function(){
'use strict';

angular.module('solarApp')
    .controller('gmapController', ['$rootScope', '$timeout', 'solarGmapServices', 'modalServices', gmapController]);

    function gmapController($rootScope, $timeout, solarGmapServices, modalServices) {

        var vm = this;

        vm.initialize = initialize;
        vm.showSolarDetailInfowindow = showSolarDetailInfowindow;

        // Call initialize when loading controller
        vm.initialize();

        function initialize () {
            $rootScope.$watchCollection('solars', function () {
                console.log('solars changed!');

                // Dont show markers if Screenshot mode is on
                //if ($rootScope.showScreenshotButtons || $rootScope.updateSolarModalOpened) return;

                solarGmapServices.initializeSolarMarkers($rootScope.solars);
            });

            //$rootScope.$watch('selectedSolar', function () {
            //    vm.showSolarDetailInfowindow($rootScope.selectedSolar);
            //});

            /*
             *  Listen for modal-opened event then
             *  hide all markers and infowindow
             *  and hide list table
             */
            $rootScope.$on('modal-opened', hideMarkers);

            /*
            *  Listen for modal-dismissed event then
            *  show all markers
            */
            $rootScope.$on('modal-dismissed', showMarkers);

            $rootScope.$on('show-solar-detail', function (event, args) {
                vm.showSolarDetailInfowindow(args.solar);
            });

            /*
            *  Trigger a modal
            *  show Solar Detail
            */
            $(document).on('click', '.btn_view_solar_detail', function() {
               $rootScope.solarDetailSelectedTab = 0;
               vm.showSolarDetailInfowindow($rootScope.selectedSolar);
            });
        }

        function showSolarDetailInfowindow (_solar) {
            if(!(_solar && _solar.id)) return;

            solarGmapServices.hideSolarMarkers();

            var defered = modalServices.showUpdateSolar(_solar, vm, event);
            defered.then(function (response) {
                console.log('modalServices.showUpdateSolar response:');
                console.log(response);

                    if (!response) return;

                    solarGmapServices.gmapService.setZoomDefault();
                    solarGmapServices.showSolarMarkers();

                    if($rootScope.selectedSolar && response) {
                        $rootScope.selectedSolar.coordinates = response.coordinates;
                    }
                }, function (errorResponse) {

                    solarGmapServices.gmapService.setZoomDefault();
                    solarGmapServices.showSolarMarkers();


                    console.log('show update solar detail failed');
                    console.log(errorResponse);
                });
            //defered.finally(function(response){
            //    console.log('finally response: ');
            //    console.log(response);
            //    solarGmapServices.showSolarMarkers();
            //    solarGmapServices.gmapService.setZoomDefault();
            //});
        }


        function showMarkers () {
            solarGmapServices.showSolarMarkers();
            solarGmapServices.resetZoom();
        }


        function hideMarkers () {
            console.log('called from event : modal-opened');
            console.log('gmapcontroller hide markers');
            solarGmapServices.hideSolarMarkers();
            // Hide Solar List Table
            $rootScope.showSolarList = false;
        }

    }
}());