(function(){
'use strict';

angular.module('solarApp')
    .factory('modalServices', ['$rootScope', '$q', '$mdDialog', '$mdMedia', 'Solars', modalServices]);

    function modalServices($rootScope, $q, $mdDialog, $mdMedia, Solars) {

            var service = {};

            service.customFullscreen = $mdMedia('xs') || $mdMedia('sm');

            service.solarAddModal = null;
            service.showUpdateModal = null;
            service.showUploadSolarFileModal = null;
            service.showScreenshotImageConfirmationModal = null;
            service.previewImageModal = null;

            /* Service Functions */
            service.showAddSolar = showAddSolar;
            service.showUpdateSolar = showUpdateSolar;
            service.showUploadSolarFile = showUploadSolarFile;
            service.hideModalWithReponse = hideModalWithReponse;
            service.showScreenshotImageConfirmation = showScreenshotImageConfirmation;
            service.previewImage = previewImage;
            service.showUpdateSolarPanelDetails = showUpdateSolarPanelDetails;
            service.closeModal = closeModal;
            service.hideModal = hideModal;
            service.showModal = showModal;
            service.resolveHideModal = resolveHideModal;


            function showAddSolar(ev) {
                var deferred = $q.defer();

                if (service.solarAddModal) {
                    // prevent multiple modals from being opened
                    deferred.reject("Modal already opened");
                } else {
                    $rootScope.$broadcast("modal-opened");

                    service.solarAddModal = $mdDialog.show({
                        controller: 'addSolarController',
                        controllerAs: 'addSolarCtl',
                        templateUrl: '/solar/add',
                        parent: angular.element(document.querySelector('#solar-container')),
                        targetEvent: ev,
                        hasBackdrop: false,
                        fullscreen: service.customFullscreen,
                        onComplete: function (scope, element, options) {
                            //$('.md-dialog-container').addClass('flex-50');
                            //$('.md-dialog-container').addClass('display-left-md-dialog-container');
                            $('.md-scroll-mask').css('z-index', '0');
                        }
                    });

                    service.solarAddModal.then(function (result) {
                        service.solarAddModal = null;
                        deferred.resolve(result);

                    }, function (reason) {
                        $rootScope.$broadcast("modal-dismissed");

                        service.solarAddModal = null;
                        deferred.reject(reason);
                    });
                }

                return deferred.promise;
            }


            function showUpdateSolar(_solar, callerScope, event) {
                var deferred = $q.defer();

                console.log(event);

                if (service.showUpdateModal) {
                    service.showUpdateModal = null;
                    // prevent multiple modals from being opened
                    deferred.reject("Modal already opened");
                } else {
                    $rootScope.$broadcast("modal-opened");

                    var openModal = function(solarData) {
                        service.showUpdateModal = $mdDialog.show({
                            controller: 'updateSolarController',
                            controllerAs: 'updateSolarCtl',
                            templateUrl: '/solar/edit',
                            parent: angular.element(document.querySelector('#solar-container')),
                            targetEvent: event,
                            hasBackdrop: false,
                            locals: {local: [_solar, callerScope]},
                            fullscreen: service.customFullscreen,
                            resolve: {
                                solar: function () {
                                    return angular.copy(solarData);
                                }
                            },
                            onComplete: function (scope, element, options) {
                                $('.md-scroll-mask').css('z-index', '0');
                            }
                        });
                        service.showUpdateModal.then(function (result) {
                            service.showUpdateModal = null;
                            deferred.resolve(result);
                        }, function (reason) {
                            $rootScope.$broadcast("modal-dismissed");
                            service.showUpdateModal = null;
                            deferred.reject(reason);
                        });
                    };

                    // load Solar details before opening modal
                    var onGetSolarSucceed = function (result) {
                        console.log('on get solar succeed result: ');
                        console.log(result);
                        openModal(result);
                    };
                    var onGetSolarFail = function (result) {
                        if (result.status == 0 || result.status == 502) {
                            deferred.reject(result);
                        }
                    };

                    Solars.get(_solar.id).then(onGetSolarSucceed, onGetSolarFail);
                }
                return deferred.promise;
            }


            function showUploadSolarFile (solarFile, solarModel) {
                var deferred = $q.defer();

                if (service.showUploadSolarFileModal) {
                    // prevent multiple modals from being opened
                    deferred.reject("Modal already opened");
                } else {
                    $rootScope.$broadcast("modal-opened");

                    service.showUploadSolarFileModal = $mdDialog.show({
                        controller: 'uploadSolarFileController',
                        controllerAs: 'uploadSolarFileCtl',
                        templateUrl: '/solar/upload',
                        parent: angular.element(document.body),
                        fullscreen: service.customFullscreen,
                        hasBackdrop: false,
                        resolve: {
                            solar: function () {
                                return angular.copy(solarModel);
                            },
                            file: function () {
                                return angular.copy(solarFile)
                            }
                        },
                        onComplete: function (scope, element, options) {
                            $('.md-scroll-mask').css('z-index', '0');
                        }
                    });

                    service.showUploadSolarFileModal.then(function (result) {
                        service.showUploadSolarFileModal = null;
                        deferred.resolve(result);
                    }, function (reason) {
                        $rootScope.$broadcast("modal-dismissed");
                        service.showUploadSolarFileModal = null;
                        deferred.reject(reason);
                    });
                }
                return deferred.promise;
            }

            function showScreenshotImageConfirmation (model) {
                console.log('showScreenshotImageConfirmation called');
                var deferred = $q.defer();
                if (service.showScreenshotImageConfirmationModal) {
                    // prevent multiple modals from being opened
                    deferred.reject("Modal already opened");
                } else {
                    service.showScreenshotImageConfirmationModal = $mdDialog.show({
                        controller: 'screenshotImageConfirmController',
                        controllerAs: 'screenshotImageConfirmCtl',
                        templateUrl: '/image/screenshot/confirm',
                        parent: angular.element(document.body),
                        hasBackdrop: false,
                        fullscreen: service.customFullscreen,
                        resolve: {
                            imagePreview: function () {
                                return model;
                            }
                        },
                        onComplete: function (scope, element, options) {
                            $('.md-scroll-mask').css('z-index', '0');
                        }
                    });

                    service.showScreenshotImageConfirmationModal.then( function(result) {
                        console.log('show screenshot modal save');
                        service.showScreenshotImageConfirmationModal = null;

                        deferred.resolve(result);
                    }, function (reason) {
                        console.log('show screenshot modal canceled');
                        service.showScreenshotImageConfirmationModal = null;
                        deferred.reject(reason);
                    });
                }

                return deferred.promise;
            }

            function previewImage(event, photo, _locals) {
                var deferred = $q.defer();
                if (service.previewImageModal) {
                    // prevent multiple modals from being opened
                    deferred.reject("Modal already opened");
                } else {
                    service.previewImageModal = $mdDialog.show({
                        controller: 'previewImageController',
                        controllerAs: 'previewImageCtl',
                        templateUrl: '/image/preview',
                        parent: angular.element(document.body),
                        hasBackdrop: false,
                        targetEvent: event,
                        fullscreen: service.customFullscreen,
                        clickOutsideToClose: true,
                        resolve: {
                            photo: function () {
                                return photo;
                            }
                        },
                        onComplete: function (scope, element, options) {
                            $('.md-scroll-mask').css('z-index', '0');
                        }
                    });

                    service.previewImageModal.then(function (result) {
                        console.log('show screenshot modal save');
                        service.previewImageModal = null;
                        deferred.resolve(result);
                    }, function (reason) {
                        console.log('show screenshot modal canceled');
                        service.previewImageModal = null;
                        deferred.reject(reason);
                    });
                }

                return deferred.promise;
            }

            function showUpdateSolarPanelDetails (event, solar, panel) {
                var dfd = $q.defer();

                if (service.showUpdateSolarPanelModal) {
                    // prevent multiple modals from being opened
                    dfd.reject("Modal already opened");
                } else {
                    service.showUpdateSolarPanelModal = $mdDialog.show({
                        controller: 'updateSolarPanelController',
                        controllerAs: 'ctl',
                        templateUrl: '/solar/panel/edit',
                        parent: angular.element(document.body),
                        hasBackdrop: false,
                        targetEvent: event,
                        autoWrap: false,
                        fullscreen: service.customFullscreen,
                        locals: {'solar': solar, 'panel': panel},
                        onComplete: function (scope, element, options) {
                            $('.md-scroll-mask').css('z-index', '0');
                        }
                    });

                    service.showUpdateSolarPanelModal.then(function (result) {
                        console.log('show update solar panel modal save');
                        service.showUpdateSolarPanelModal = null;
                        dfd.resolve(result);
                    }, function (reason) {
                        console.log('show update solar panel modal canceled');
                        service.showUpdateSolarPanelModal = null;
                        dfd.reject(reason);
                    });
                }

                return dfd.promise;
            }

            function hideModalWithReponse(data) {
                $mdDialog.hide(data);
            }

            // Temporarily Hide Infowindow
            function hideModal() {
                $('.md-dialog-container').css('display', 'none');
            }

            function showModal() {
                $('.md-dialog-container').css('display', 'flex');
            }

            function resolveHideModal() {
                $mdDialog.hide();
            }

            // Close Modal
            function closeModal() {
              $mdDialog.cancel();
            }

            return service;
     }
}());