(function(){
'use strict';

angular.module('solarApp')
    .factory('utilServices', [utilServices]);

    function utilServices () {
        var service = {};

        var hexChar = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];

        service.byteToHex = byteToHex;

        /**
         * 0-255 to 00-ff
         * @param b
         */
        function byteToHex(b) {
            return hexChar[(b >> 4) & 0x0f] + hexChar[b & 0x0f];
        }

        return service;
    }
}());