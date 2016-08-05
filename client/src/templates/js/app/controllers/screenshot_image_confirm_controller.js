(function(){
'use strict';

angular.module('solarApp')
    .controller('screenshotImageConfirmController', ['$scope', '$timeout', 'modalServices', '$mdDialog', 'imagePreview', screenshotImageConfirmController]);

    function screenshotImageConfirmController ($scope, $timeout, modalServices, $mdDialog, imagePreview) {
        var vm = this;

        vm.imagePreview = {
            src: '',
            file: null
        };

        vm.initialize = initialize;
        vm.save = save;
        vm.cancel = cancel;

        vm.initialize();

        /* Controller Functions here */

        function initialize () {
            $scope.$watch('imagePreview', updateImage);

            vm.imagePreview = imagePreview;
        }

        function updateImage () {
            if (vm.imagePreview && vm.imagePreview.file) {
                var a = new FileReader();
                a.onload = function (e) {
                    var dataURI = e.target.result;
                    $timeout(function () {
                        vm.imagePreview.src = dataURI;
                    });
                }
                a.readAsDataURL(vm.imagePreview.file);
            }
        }

        function save () {
            console.log('saving');
            modalServices.resolveHideModal();
        }

        function cancel () {
            console.log('cancel');
            modalServices.closeModal();
        }

        /* Non Scope Functions here */
    }
}());