(function(){
'use strict';

angular.module('solarApp')
    .factory('uploadServices', ['$q', 'loaderServices', 'alertServices', uploadServices]);

    function uploadServices ($q, loaderServices, alertServices) {
        var service = {};

        service.uploadSolarPhoto = uploadSolarPhoto;
        service.updateSolarPhoto = updateSolarPhoto;
        service.parseScreenshotPhoto = parseScreenshotPhoto;


        function uploadSolarPhoto (file, solar) {
            var f = file;
            var dfd = $q.defer();

            if(f) {
                loaderServices.showLoader();
                // if file is valid
                // trigger a modal to show progress and
                solar.upload(file)
                    .then( function (response) {
                        alertServices.showFileUploadSuccess();
                        dfd.resolve(response.data);
                    }, function(errResponse){
                        alertServices.showInvalidFileUpload();
                        dfd.reject(errResponse);
                    })
                    .finally(function(){
                        loaderServices.hideLoader();
                    });
            }
            return dfd.promise;
        }

        function updateSolarPhoto(file, solar, solarFile) {
            var dfd = $q.defer();

            if (file) {
                loaderServices.showLoader();
                // if file is valid
                // trigger a modal to show progress and
                solar.updateSolarPhoto(file, solarFile.id)
                    .then(function (response) {
                        alertServices.showFileUploadSuccess();
                        dfd.resolve(response.data);
                    }, function (errResponse) {
                        alertServices.showInvalidFileUpload();
                        dfd.reject(errResponse);
                    })
                    .finally(function () {
                        loaderServices.hideLoader();
                    });
            }
            return dfd.promise;
        }

        function parseScreenshotPhoto (blob) {
            var file = null;

            var date = new Date();
            var dateString = date.getTime();
            var filename = "screenshot-" + dateString + ".png";

            try {
                file = new File([blob], filename, {type: blob.type});
            } catch (err) {
                file = blob;
                file.name = filename;
                file.type = blob.type;
            }
            return file;
        }

        return service;
    }
}());