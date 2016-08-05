(function(){
'use strict';

angular.module('solarApp')
    .controller('updateSolarPanelController', ['solar', 'panel', 'modalServices', updateSolarPanelController]);

    function updateSolarPanelController (solar, panel, modalServices) {
        var vm = this;

        vm.initialize = initialize;
        vm.updatePanel = updatePanel;
        vm.closeModal = closeModal;

        vm.initialize();

        /* Controller Functions here */

        function initialize () {
            vm.solar = solar;
            vm.panel = panel;
            vm.paneldata = angular.copy(panel);

            console.log('update solar panel controller intialized!');
        }

        function updatePanel() {
            solar.one('panels', vm.paneldata.id).customPUT(vm.paneldata)
                .then(function (response) {
                    modalServices.hideModalWithReponse(response);
                }, function (err) {
                    console.log('solar panel update error response: ');
                    console.log(err);
                });
        }

        function closeModal () {
            modalServices.closeModal();
        }
    }
}());