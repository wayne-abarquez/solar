(function(){
'use strict';

angular.module('solarApp')
    .factory('solarPanelServices', ['$q', '$timeout', 'drawingServices', 'gmapServices', solarPanelServices]);

    function solarPanelServices ($q, $timeout, drawingServices, gmapServices) {
        var service = {};

        service.panels = [];
        service.panelStrokeColor = '#ff0000';
        service.lastSelectedPanel = null;

        service.initializeDrawPanel = initializeDrawPanel;
        service.initializePanels = initializePanels;
        service.hidePanels = hidePanels;
        service.hidePanelById = hidePanelById;
        service.showPanelById = showPanelById;
        service.createPanelPolygon = createPanelPolygon;
        service.createPanel = createPanel;
        service.savePanel = savePanel;
        service.updatePanel = updatePanel;
        service.findPanelById = findPanelById;
        service.deletePanel = deletePanel;
        service.onPanelClick = onPanelClick;
        service.clearSelectedPanel = clearSelectedPanel;
        //service.fillPanel = fillPanel;
        //service.removeFillPanel = removeFillPanel;

        function initializeDrawPanel () {
            drawingServices.startDrawingMode(service.panelStrokeColor);
        }

        function initializePanels (rawPanels) {
            if (rawPanels.length) {
                service.panels = angular.copy(rawPanels);
                // Show Solar Panels
                // by creating polygons on map
                service.panels.forEach(function (panel, index) {
                    service.panels[index].polygon = gmapServices.createPolygon(panel.area, service.panelStrokeColor);
                });
                console.log('panels initialied');
            }
        }

        function hidePanels () {
            service.panels.forEach(function (panel) {
                if (panel.polygon) {
                    gmapServices.hidePolygon(panel.polygon);
                    panel.polygon = null;
                }
            });

            service.panels = [];
        }

        // id which is primary key in database
        function hidePanelById (panelId) {
            var panel = findPanelById(panelId);

            if(panel.polygon) {
                gmapServices.hidePolygon(panel.polygon);
                return panel;
            }
            return null;
        }

        function showPanelById (panelId) {
            var panel = findPanelById(panelId);

            if (panel.polygon) {
                gmapServices.showPolygon(panel.polygon);
                return panel;
            }
            return null;
        }

        function createPanelPolygon (pointsArray) {
            return gmapServices.initPolygon(pointsArray, service.panelStrokeColor);
        }

        function createPanel (polygon) {
            var time = new Date().getTime();

            return {
                'name': 'Panel-' + time,
                'area': drawingServices.getAreaFormData(polygon)
            };
        }

        function savePanel (solar) {
            var dfd = $q.defer();

            var polygon = service.createPanelPolygon(drawingServices.overlayDataArray);
            var panel = service.createPanel(polygon);

            solar.all('panels').post(panel)
                .then(function (response) {

                    response.polygon = polygon;
                    gmapServices.showPolygon(polygon);

                    var newPanel = response.panel;
                    newPanel.polygon = polygon;

                    service.panels.push(newPanel)

                    dfd.resolve(response);

                }, function (errorResponse) {
                    console.log('error creating panel');
                    console.log(errorResponse);

                    gmapServices.hidePolygon(polygon);
                    polygon = null;

                    dfd.reject(errorResponse);
                });

            return dfd.promise;
        }

        function updatePanel(solar, panel) {
            var dfd = $q.defer();

            var panel = findPanelById(panel.id);
            var polygon = service.createPanelPolygon(drawingServices.overlayDataArray);

            var panelData = {
                'area': drawingServices.getAreaFormData(polygon)
            };

            solar.one('panels', panel.id).customPUT(panelData)
                .then(function (response) {
                    console.log('solar panel update response: ');
                    console.log(response);

                    gmapServices.showPolygon(polygon);

                    var newPanel = response.panel;
                    newPanel.polygon = polygon;
                    service.panels[panel.index] = newPanel;

                    dfd.resolve(response);

                }, function (err) {
                    console.log('solar panel update error response: ');
                    console.log(err);
                });

            return dfd.promise;
        }

        // id which is primary key in database
        function findPanelById (panelId) {
            var findPanel = null;

            service.panels.forEach(function(panel, index){
               if(panel.id == panelId) {
                   findPanel = panel;
                   findPanel.index = index;
                   return;
               }
            });
            return findPanel;
        }

        function onPanelClick (panel) {
            var panel = findPanelById(panel.id);

            if(panel) {
                if(service.lastSelectedPanel) {
                    gmapServices.resetPolygonFill(service.lastSelectedPanel);
                }

                if (panel.polygon) {
                    service.lastSelectedPanel = panel.polygon;
                    gmapServices.fillPolygon(service.lastSelectedPanel);
                    gmapServices.panToPolygon(panel.polygon);
                }

                // Remove Fill Polygon after 3 seconds
                $timeout(function () {
                    gmapServices.resetPolygonFill(service.lastSelectedPanel);
                }, 3000);
            }
        }

        function deletePanel(solar, panel) {
            var dfd = $q.defer();

            var panelId = panel.id;

            solar.deletePanel(panelId)
                .then(function (response) {

                    var panel = findPanelById(panelId);

                    gmapServices.hidePolygon(panel.polygon);
                    service.panels.splice(panel.index, 1);

                    dfd.resolve(response);
                }, function (errorResponse) {
                    dfd.reject(errorResponse);
                });
            return dfd.promise;
        }

        function clearSelectedPanel () {
            drawingServices.clearOverlay();
        }

        return service;
    }
}());