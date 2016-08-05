(function(){
'use strict';

angular.module('solarApp')
    .controller('uploadSolarFileController', ['$rootScope', 'modalServices', 'solar', 'file', uploadSolarFileController]);

    function uploadSolarFileController ($rootScope, modalServices, solar, file) {
        var vm = this;

        vm.initialize = initialize;
        vm.closeModal = closeModal;

        vm.initialize();

        /* Controller Functions here */

        function initialize () {
            console.log('upload solar file controller initialized!');

            console.log('solar: ');
            console.log(solar);

            console.log('file: ');
            console.log(file);
        }

        function closeModal() {
            modalServices.closeModal();
            //$rootScope.$broadcast('show-solar-detail');
        }

        /* Non Scope Functions here */

    }
}());