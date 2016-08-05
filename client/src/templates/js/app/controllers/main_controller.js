(function(){
'use strict';

angular.module('solarApp')
    .controller('mainController', ['$mdSidenav', mainController]);

    function mainController ($mdSidenav) {
        var vm = this;

        /* Side Nav Menus */
        vm.menu = [
            {
                link: '#',
                title: 'Admin',
                icon: 'group'
            },
            {
                link: '/logout',
                title: 'Logout',
                icon: 'exit_to_app'
            }
        ];

        vm.initialize = initialize;
        vm.toggleSideNav = buildToggler('sidenav');

        vm.initialize();

        /* Controller Functions here */
        function initialize () {

        }

        /* Non Scope Functions here */
        function buildToggler(navID) {
            return function () {
                $mdSidenav(navID)
                    .toggle()
                    .then(function () {
                        console.log("toggle " + navID + " is done");
                    });
            }
        }
    }
}());