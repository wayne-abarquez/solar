(function () {
'use strict';

angular.module('solarApp')
    .factory('alertServices', ['SweetAlert', '$mdToast', alertServices]);

    function alertServices(SweetAlert, $mdToast) {
        var service = {};

        service.showWarningDrawSiteArea = showWarningDrawSiteArea;
        service.showInvalidDataMessages = showInvalidDataMessages;
        service.showWarningDrawSolarPanelArea = showWarningDrawSolarPanelArea;
        service.showInvalidFileUpload = showInvalidFileUpload;
        service.showFileUploadSuccess = showFileUploadSuccess;

        function showWarningDrawSiteArea () {
            SweetAlert.swal({
                title: 'Please draw site area.',
                type: 'warning'
            });
        }

        function showWarningDrawSolarPanelArea() {
            SweetAlert.swal({
                title: 'Please Draw Solar Panel area.',
                type: 'warning'
            });
        }

        function showInvalidFileUpload () {
            SweetAlert.swal({
                title: 'Invalid File Uploaded.',
                type: 'error'
            });
        }

        function showFileUploadSuccess () {
            $mdToast.show(
                $mdToast.simple()
                    .textContent('File Successfully Uploaded.')
                    .position('top right')
                    .hideDelay(3000)
            );
        }

        function showInvalidDataMessages (errorStr) {
            SweetAlert.swal({
                title: 'Invalid Data',
                text: errorStr,
                type: 'error',
                confirmButtonText: 'Close'
            });
        }

        return service;
    }
}());