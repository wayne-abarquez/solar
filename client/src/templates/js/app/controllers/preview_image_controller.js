(function () {
    'use strict';

    angular.module('solarApp')
        .controller('previewImageController', ['$scope', '$timeout', 'modalServices', 'photo', previewImageController]);

    function previewImageController($scope, $timeout, modalServices, photo) {
        var vm = this;
        vm.photo = null;

        vm.initialize = initialize;
        vm.close = close;

        vm.initialize();

        /* Controller Functions here */

        function initialize() {
            vm.photo = photo;
        }

        function close() {
            console.log('cancel');
            modalServices.resolveHideModal();
        }
    }
}());