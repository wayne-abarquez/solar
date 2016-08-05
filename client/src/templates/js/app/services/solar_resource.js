(function(){
'use strict';

angular.module('solarApp')
    .factory('Solars', ['Restangular', 'Upload', Solars]);
    
    function Solars (Restangular, Upload) {
        var solarModel = Restangular.all('solars');

        Restangular.extendModel('solars', function (model) {

            model.deletePanel = function (panel_id) {
                return model
                    .one('panels', panel_id)
                    .remove();
            };

            model.upload = function (_file, _caption) {
                var uploadUrl = model.getRestangularUrl() + '/' + 'photos',
                    caption = _caption || '';

                console.log('custom solar method : upload');

                return Upload.upload({
                           url: uploadUrl,
                           method: 'POST',
                           data: {file: _file, caption: caption}
                       });
            };

            model.updateSolarPhoto = function (_file, solarFileId) {
                var uploadUrl = model.getRestangularUrl() + '/photos/' + solarFileId;

                console.log('custom solar method : updateSolarPhoto');

                return Upload.upload({
                    url: uploadUrl,
                    method: 'POST',
                    data: {file: _file}
                });
            };

            model.deletePhoto = function (photo) {
                console.log('custom solar method : deletePhoto');

                return model
                    .one('photos', photo.id)
                    .remove();
            };

            model.updatePhotoCaption = function (solarFile, newCaption) {
                console.log('custom solar method : updatePhotoCaption');

                return model
                        .one('photos', solarFile.id)
                        .customPUT({caption: newCaption});
            };

            return model;
        });

        return solarModel;
    }
}());