(function(){
    'use strict';

    angular
        .module('solarApp', ['ngMaterial', 'ngAnimate', 'restangular', 'oitozero.ngSweetAlert', 'ngFileUpload', 'treasure-overlay-spinner', 'angularInlineEdit', 'colorpicker.module', 'md.data.table'])

        .config(['RestangularProvider', function(RestangularProvider) {
            //set the base url for api calls on our RESTful services
            var baseUrl = window.location.origin + '/api';
            RestangularProvider.setBaseUrl(baseUrl);
        }])

        .value('SOLAR_STATUSES', [
            'In-Process',
            'Submitted',
            'Approved'
        ]);

    //.run(function (editableOptions, editableThemes) {
    //    editableThemes['angular-material'] = {
    //        formTpl: '<form class="editable-wrap"></form>',
    //        noformTpl: '<span class="editable-wrap"></span>',
    //        controlsTpl: '<md-input-container class="editable-controls" ng-class="{\'md-input-invalid\': $error}"></md-input-container>',
    //        inputTpl: '',
    //        errorTpl: '<div ng-messages="{message: $error}"><div class="editable-error" ng-message="message">{{$error}}</div></div>',
    //        buttonsTpl: '<span class="editable-buttons"></span>',
    //        submitTpl: '<md-button type="submit" class="md-primary"><md-icon style="color:white;">save</md-icon></md-button>',
    //        cancelTpl: '<md-button type="button" class="md-warn" ng-click="$form.$cancel()">cancel</md-button>'
    //    };
    //
    //    editableOptions.theme = 'angular-material';
    //});

    //.config(function ($mdThemingProvider) {
    //    $mdThemingProvider.theme('default')
    //        .primaryPalette('red')
    //        .accentPalette('pink');
    //});

    console.log('solar app initialized!');

}());

