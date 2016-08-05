(function(){
'use strict';

angular.module('solarApp')
    .factory('screenshotServices', ['$rootScope', '$timeout', '$q','gmapServices', 'modalServices', 'utilServices', 'infoWindowServices', 'loaderServices', screenshotServices]);

    function screenshotServices ($rootScope, $timeout, $q, gmapServices, modalServices, utilServices, infoWindowServices, loaderServices) {
        var service = {};

        service.drawingManager = null;
        service.drawingCompleteListener = null;

        service.screenShotDrawingManager = null;
        service.screenshotDrawingListener = null;

        service.shapes = [];
        service.selectedShape = null;
        service.lineWidth = 1.0;

        var circleOptions = null;
        var polygonOptions = null;
        var polylineOptions = null;
        var rectangleOptions = null;

        $rootScope.hasScreenshotSelectedShape = false;

        var mapInitialTransform = '';

        var drawingListeners = {
            'deleteSelectedListener': null,
            'addTextBubbleListener': null,
            'startScreenshotListener': null
        };

        /**
         * Functions
         */
        service.startDrawing = startDrawing;
        service.endDrawing = endDrawing;
        service.onClickShape = onClickShape;
        service.selectShape = selectShape;
        service.selectLastShape = selectLastShape;
        service.deleteShapeAtIndex = deleteShapeAtIndex;
        service.deleteSelected = deleteSelected;

        service.solar = null;

        var screenshotCancelledListener = null;
        var mapClickListener = null;

        function startDrawing (solar, local) {
            service.solar = solar;
            // Copy of local to reference [solar, gmap_controller_scope]
            service.local = local;

            initDrawingManager();

            initScreenshotListeners();

            // Always Hide Modal if any
            modalServices.resolveHideModal();

            showScreenshotTools();
            watchShapeAtrributesValue();

            $(document).keyup(cancelScreenshotOnEsc);
        }

        function watchShapeAtrributesValue () {
            $rootScope.$watch('screenshotShapeStrokeColor', onChangeStrokeColor);

            $rootScope.$watch('screenshotShapeFillColor', onChangeFillColor);

            $rootScope.$watch('screenshotShapeStrokeWidth', onChangeStrokeWidth);

            drawingListeners.deleteSelectedListener = $rootScope.$on('delete-selected', deleteSelected);

            drawingListeners.addTextBubbleListener = $rootScope.$on('add-screenshot-text-bubble', addTextBubble);

            drawingListeners.startScreenshotListener = $rootScope.$on('start-screenshot', startScreenshot);
        }

        function startScreenshot() {
            if (!service.screenshotDrawingManager) {
                service.screenshotDrawingManager = gmapServices.createDrawingManager();
                gmapServices.showDrawingManager(service.screenshotDrawingManager);
            }

            if (!service.screenshotDrawingListener) {
                service.screenshotDrawingListener = gmapServices.addListener(
                    service.screenshotDrawingManager, 'overlaycomplete', onFinishScreenshot);
            }

            var setDragTool = {drawingMode: null};
            service.screenshotDrawingManager.setOptions(setDragTool);

            var drawOptions = {
                drawingMode: google.maps.drawing.OverlayType.RECTANGLE,
                drawingControl: false,
                rectangleOptions: {
                    fillOpacity: 0,
                    strokeOpacity: 0.9,
                    strokeColor: '#ffffff',
                    zIndex: 3
                }
            };
            service.screenshotDrawingManager.setOptions(drawOptions);
            hideScreenshotTools();

            /* Listen for ESC Key here to exit from capture screenshot mode */


        }

        function destroyListeners() {
            for (var key in drawingListeners) {
                if (drawingListeners.hasOwnProperty(key)) {
                    if (drawingListeners[key]) {
                        drawingListeners[key]();
                        drawingListeners[key] = null;
                    }
                }
            }
        }

        function stopScreenshot() {
            if (service.screenshotDrawingManager) {
                gmapServices.hideDrawingManager(service.screenshotDrawingManager);
                service.screenshotDrawingManager = null;
            }

            if (service.screenshotDrawingListener) {
                gmapServices.removeListener(service.screenshotDrawingListener);
                service.screenshotDrawingListener = null;
            }
        };

        function onFinishScreenshot (eArgs) {
            loaderServices.showLoader();
            stopScreenshot();

            var rectangle = eArgs.overlay;
            gmapServices.hidePolygon(rectangle);

            var bounds = rectangle.getBounds();
            var upperRight = gmapServices.fromLatLngToContainerPixel(bounds.getNorthEast());
            var lowerLeft = gmapServices.fromLatLngToContainerPixel(bounds.getSouthWest());
            var box = {
                x: lowerLeft.x,
                y: upperRight.y,
                width: upperRight.x - lowerLeft.x,
                height: lowerLeft.y - upperRight.y
            };

            convertMapTransformToLeftRight();

            $timeout(function () {
                html2canvas(document.getElementById('map-canvas'), {
                    "logging": true,
                    "imageTimeout": 120000,
                    "proxy": "/html2canvasproxy"
                }).then(function (canvas) {
                    loaderServices.hideLoader(true);

                    revertMapTransform();
                    initDrawingManager();

                    var tmpCanvas = document.createElement('canvas');
                    tmpCanvas.width = box.width;
                    tmpCanvas.height = box.height;

                    var context = tmpCanvas.getContext('2d');
                    context.drawImage(canvas, box.x, box.y, box.width, box.height, 0, 0, box.width, box.height);

                    var toBlobFunction = function (blob) {
                        var file = blob;
                        var options = {
                            file: file,
                            caption: 'Screenshot'
                        };

                        modalServices.showScreenshotImageConfirmation(options)
                            .then(function (result) {
                                service.endDrawing();
                                var broadcast = $rootScope.$broadcast('screenshot-taken', file);
                                broadcast = null;
                                // endDrawing opens modal again
                            }, function () {
                                //
                            });
                    };

                    tmpCanvas.toBlob(toBlobFunction);
                });
            });
        }

        /**
         * Fix for screenshot when Google Map is scrolled or panned.
         * Thanks for answer from: http://stackoverflow.com/questions/24046778/html2canvas-does-not-work-with-google-maps-pan
         */
        function convertMapTransformToLeftRight() {
            mapInitialTransform = $(".gm-style>div:first>div").css("transform");
            var comp = mapInitialTransform.split(",") //split up the transform matrix
            var mapleft = parseFloat(comp[4]) //get left value
            var maptop = parseFloat(comp[5])  //get top value
            $(".gm-style>div:first>div").css({ //get the map container. not sure if stable
                "transform": "none",
                "left": mapleft,
                "top": maptop
            });
        };

        function revertMapTransform() {
            $(".gm-style>div:first>div").css({
                "transform": mapInitialTransform,
                left: 0,
                top: 0
            });
        }

        function addTextBubble () {
            if (!mapClickListener) {
                mapClickListener = gmapServices.addMapListener('click', function(e){
                    infoWindowServices.addInfoWindow(e.latLng);
                    cancelAddTextBubble();
                });
                gmapServices.setMapCursorCrosshair();
            }

            if (service.screenshotDrawingManager) {
                var setDragTool = {drawingMode: null};
                service.screenshotDrawingManager.setOptions(setDragTool);
            }
        }

        function cancelAddTextBubble() {
            if (mapClickListener) {
                gmapServices.setMapCursorDefault();
                gmapServices.removeListener(mapClickListener);
                mapClickListener = null;
            }
        }

        function onChangeFillColor() {
            var color = $rootScope.screenshotShapeFillColor;
            if(!color) return;

            var rgba = /rgba\(([0-9\.]+),([0-9\.]+),([0-9\.]+),([0-9\.]+)\)/.exec(color);
            var colorHexString = '#'
                + utilServices.byteToHex(parseFloat(rgba[1]))
                + utilServices.byteToHex(parseFloat(rgba[2]))
                + utilServices.byteToHex(parseFloat(rgba[3]));

            circleOptions = setDrawingOption('circleOptions', ['fillColor', 'fillOpacity'], [colorHexString, parseFloat(rgba[4])]);
            polygonOptions = setDrawingOption('polygonOptions', ['fillColor', 'fillOpacity'], [colorHexString, parseFloat(rgba[4])]);
            polylineOptions = setDrawingOption('polylineOptions', ['fillColor', 'fillOpacity'], [colorHexString, parseFloat(rgba[4])]);
            rectangleOptions = setDrawingOption('rectangleOptions', ['fillColor', 'fillOpacity'], [colorHexString, parseFloat(rgba[4])]);

            updateSelectedShape();
        }

        function onChangeStrokeColor () {
            var color = $rootScope.screenshotShapeStrokeColor;
            if (!color) return;

            var rgba = /rgba\(([0-9\.]+),([0-9\.]+),([0-9\.]+),([0-9\.]+)\)/.exec(color);
            var colorHexString = '#'
                + utilServices.byteToHex(parseFloat(rgba[1]))
                + utilServices.byteToHex(parseFloat(rgba[2]))
                + utilServices.byteToHex(parseFloat(rgba[3]));

            circleOptions = setDrawingOption('circleOptions', ['strokeColor', 'strokeOpacity'], [colorHexString, parseFloat(rgba[4])]);
            polygonOptions = setDrawingOption('polygonOptions', ['strokeColor', 'strokeOpacity'], [colorHexString, parseFloat(rgba[4])]);
            polylineOptions = setDrawingOption('polylineOptions', ['strokeColor', 'strokeOpacity'], [colorHexString, parseFloat(rgba[4])]);
            rectangleOptions = setDrawingOption('rectangleOptions', ['strokeColor', 'strokeOpacity'], [colorHexString, parseFloat(rgba[4])]);

            updateSelectedShape();
        }

        function onChangeStrokeWidth () {
            var lineWidth = $rootScope.screenshotShapeStrokeWidth;

            $timeout(function () {
                service.lineWidth = lineWidth;
            });

            circleOptions = setDrawingOption('circleOptions', ['strokeWeight'], [lineWidth]);
            polygonOptions = setDrawingOption('polygonOptions', ['strokeWeight'], [lineWidth]);
            polylineOptions = setDrawingOption('polylineOptions', ['strokeWeight'], [lineWidth]);
            rectangleOptions = setDrawingOption('rectangleOptions', ['strokeWeight'], [lineWidth]);

            updateSelectedShape();
        }

        function initScreenshotListeners() {
            if( !screenshotCancelledListener) {
                screenshotCancelledListener = $rootScope.$on('screenshot-cancelled', service.endDrawing);
            }
        }

        function showScreenshotTools () {
            // Show Map Cancel button
            $rootScope.showScreenshotButtons = true;
        }

        function initDrawingManager() {
            if (service.drawingManager) {
                // Reinitialize Drawing Listener
                initDrawingListener();
                console.log('Reinitialize Drawing Listener on Screenshot Services');
                return;
            }

            service.drawingManager = gmapServices.createDrawingToolsManager();
            gmapServices.showDrawingManager(service.drawingManager);

            initDrawingListener();
        }

        function initDrawingListener() {
            if (gmapServices.apiAvailable()) {
                if ( !service.drawingCompleteListener) {
                    service.drawingCompleteListener = gmapServices.addListener(
                        service.drawingManager, 'overlaycomplete', overlayCompleteListener);
                }

                $timeout(function () {
                    showScreenshotTools();
                });
            }
        }

        function overlayCompleteListener(eventArgs) {
            var object = {
                shape: eventArgs.overlay,
                type: eventArgs.type,
                listener: gmapServices.addListener(
                    eventArgs.overlay, 'click', service.onClickShape
                )
            }
            service.shapes.push(object);
            service.selectLastShape();
        }

        function onClickShape() {
            var index = _.findIndex(service.shapes, {shape: this})
            if (index >= 0) service.selectShape(service.shapes[index]);
        }

        function selectShape(shape) {
            if (service.selectedShape) {
                service.selectedShape.shape.setDraggable(false);
                if (service.selectedShape.type != google.maps.drawing.OverlayType.MARKER)
                    service.selectedShape.shape.setEditable(false);
            }

            var _shape = shape;
            $timeout(function () {
                service.selectedShape = _shape;
                if (service.selectedShape && service.selectedShape.shape) {
                    service.selectedShape.shape.setDraggable(true);
                    if (service.selectedShape.type != google.maps.drawing.OverlayType.MARKER)
                        service.selectedShape.shape.setEditable(true);

                    $rootScope.hasScreenshotSelectedShape = true;
                }
                ;
            });
        }

        function selectLastShape () {
            if (service.shapes.length > 0) {
                service.selectShape(service.shapes[service.shapes.length - 1]);
            } else {
                service.selectShape(null);
            }
        }

        function deleteSelected () {
            if (service.selectedShape) {
                deleteShapeAtIndex(_.indexOf(service.shapes, service.selectedShape));

                if(service.shapes.length <= 0) {
                    $rootScope.hasScreenshotSelectedShape = false;
                }
            }
        }

        function deleteShapeAtIndex(index) {
            if (index >= 0) {
                var object = service.shapes[index];
                service.shapes.splice(index, 1);
                gmapServices.removeListener(object.listener);
                gmapServices.hidePolygon(object.shape);
                delete object.shape;
                delete object.listener;
                service.selectedShape = null;
                service.selectLastShape();
            }
        }

        function endDrawing () {
            while (service.shapes.length > 0)
                service.deleteShapeAtIndex(service.shapes.length - 1);

            infoWindowServices.clearInfoWindows();
            hideScreenshotTools();
            destroyDrawingManager();
            
            //modalServices.showModal();
            // or
            var solar = service.local[0],
                dialog = service.local[1].showSolarDetailInfowindow;


            dialog(solar);

            console.log('endDrawing is called');

            console.log('scope local trigger destroy: ');
            console.log(service.local[2]);
            service.local[2].$destroy();
            service.local[2] = null;

            $rootScope.solarDetailSelectedTab = 2;
        }

        function hideScreenshotTools () {
            if (service.drawingManager) {
                gmapServices.hideDrawingManager(service.drawingManager);
                service.drawingManager = null;
            }

            if (service.drawingCompleteListener) {
                gmapServices.removeListener(service.drawingCompleteListener);
                service.drawingCompleteListener = null;
            }

            cancelAddTextBubble();

            $rootScope.showScreenshotButtons = false;
            $rootScope.showStrokeWidth = false;
        }

        function setDrawingOption(optionName, propertyNames, values) {
            if (service.drawingManager) {
                var options = service.drawingManager.get(optionName);
                if (options) {
                    for (var i = 0; i < propertyNames.length && i < values.length; i++) {
                        var propertyName = propertyNames[i];
                        var value = values[i];
                        if (options.hasOwnProperty(propertyName)) {
                            options[propertyName] = value;
                        }
                    }
                    service.drawingManager.set(optionName, options);
                    return options;
                }
            }
            return null;
        }

        function updateSelectedShape() {
            if (!service.selectedShape) return;

            if (service.selectedShape.type == google.maps.drawing.OverlayType.MARKER) {

            } else if (service.selectedShape.type == google.maps.drawing.OverlayType.POLYLINE) {
                service.selectedShape.shape.setOptions(polylineOptions);
            } else if (service.selectedShape.type == google.maps.drawing.OverlayType.CIRCLE) {
                service.selectedShape.shape.setOptions(circleOptions);
            } else if (service.selectedShape.type == google.maps.drawing.OverlayType.POLYGON) {
                service.selectedShape.shape.setOptions(polygonOptions);
            } else if (service.selectedShape.type == google.maps.drawing.OverlayType.RECTANGLE) {
                service.selectedShape.shape.setOptions(rectangleOptions);
            }
        }

        function destroyDrawingManager() {
            if (service.drawingManager) {
                gmapServices.hideDrawingManager(service.drawingManager);
                service.drawingManager = null;
            }

            if (service.drawingCompleteListener) {
                gmapServices.removeListener(service.drawingCompleteListener);
                service.drawingCompleteListener = null;
            }

            if (screenshotCancelledListener) {
                screenshotCancelledListener();
                screenshotCancelledListener = null;
            }

            destroyListeners();
        }

        function cancelScreenshotOnEsc(e) {
            // on press ESC cancel taking screenshot
            if (e.keyCode == 27) {
                loaderServices.hideLoader();
                endDrawing();
            }
        }

        return service;
    }
}());