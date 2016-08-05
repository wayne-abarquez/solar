(function(){
    'use strict';

    angular.module('solarApp')
        .factory('gmapServices', ['$log', '$q', gmapServices]);

    function gmapServices($log, $q) {
        var service = {};

        var MapTypeId = {
            USGSTopo: "USGS Topo"
        };

        service.MARKER_ICONS = {
            // IN-PROCESS
            RED: '/resources/images/red-dot.png',
            // SUBMITTED
            YELLOW: '/resources/images/yellow-dot.png',
            // APPROVED
            GREEN: '/resources/images/green-dot.png',
            // INVALID
            ERROR: '/resources/images/caution.png'
        };

        //infowindow balloons
        service.INFO_WINDOWS = [];

        service.ZOOM_OUT_LEVEL = 6;
        service.ZOOM_IN_LEVEL = 17;

        service.map = null;
        service.overlayView = null;

        service.geocoder = null;

        service.markers = [];

        service.defaultZoom = service.ZOOM_OUT_LEVEL;

        service.defaultLatLng = new google.maps.LatLng(32.7577, -88.4376);

        // Maintain only one infobox
        // Prevent from opening multiple infoboxes
        service.lastInfoboxOpen = null;
        service.infoboxes = [];

        /**
         * Service Functions
         */
        service.apiAvailable = apiAvailable;
        service.createMap = createMap;
        service.createInfoBox = createInfoBox;
        service.openInfoBox = openInfoBox;
        service.closeInfoBox = closeInfoBox;
        service.closeAllInfoBox = closeAllInfoBox;
        service.setMapCursorCrosshair = setMapCursorCrosshair;
        service.setMapBounds = setMapBounds;
        service.getBoundsFromPath = getBoundsFromPath;
        service.setMapCursorDefault = setMapCursorDefault;
        service.addMapListener = addMapListener;
        service.getDistanceOfPath = getDistanceOfPath;
        service.fromLatLngToContainerPixel = fromLatLngToContainerPixel;
        service.fromLatLngToDivPixel = fromLatLngToDivPixel;
        service.fromLatLngToPoint = fromLatLngToPoint;
        service.createCoordinate = createCoordinate;
        service.createInfoWindow = createInfoWindow;
        service.createCanvasInfoWindow = createCanvasInfoWindow;
        service.hideCanvasInfoWindow = hideCanvasInfoWindow;
        service.showInfoWindow = showInfoWindow;
        service.hideInfoWindow = hideInfoWindow;
        service.clearInstanceListeners = clearInstanceListeners;
        service.initMarker = initMarker;
        service.createMarker = createMarker;
        service.createCustomMarker = createCustomMarker;
        service.createCircleMarker = createCircleMarker;
        service.panTo = panTo;
        service.panToOffsetLeft = panToOffsetLeft;
        service.showMarker = showMarker;
        service.showMarkers = showMarkers;
        service.hideMarker = hideMarker;
        service.hideMarkers = hideMarkers;
        service.destroyMarker = destroyMarker;
        service.centerMarker = centerMarker;
        service.setMapCenter = setMapCenter;
        service.setMapCenterDefault = setMapCenterDefault;
        service.setZoom = setZoom;
        service.setZoomIfGreater = setZoomIfGreater;
        service.setZoomDefault = setZoomDefault;
        service.setZoomInDefault = setZoomInDefault;
        service.createDrawingManager = createDrawingManager;
        service.createDrawingToolsManager = createDrawingToolsManager;
        service.showDrawingManager = showDrawingManager;
        service.hideDrawingManager = hideDrawingManager;
        service.setEnableDrawingManager = setEnableDrawingManager;
        service.createCircle = createCircle;
        service.updateCircle = updateCircle;
        service.initPolygon = initPolygon;
        service.createPolygon = createPolygon;
        service.updatePolygon = updatePolygon;
        service.showPolygon = showPolygon;
        service.hidePolygon = hidePolygon;
        service.resetPolygonFill = resetPolygonFill;
        service.fillPolygon = fillPolygon;
        service.panToPolygon = panToPolygon;
        service.createPolyline = createPolyline;
        service.updatePolyline = updatePolyline;
        service.showPolyline = showPolyline;
        service.hidePolyline = hidePolyline;
        service.addListener = addListener;
        service.addListenerOnce = addListenerOnce;
        service.clearInstanceListeners = clearInstanceListeners;
        service.clearListeners = clearListeners;
        service.removeListener = removeListener;
        service.trigger = trigger;
        service.showCurrentLocation = showCurrentLocation;
        service.reverseGeocode = reverseGeocode;
        service.WMSGetTopoUrl = WMSGetTopoUrl;
        service.createWMSTopoMapType = createWMSTopoMapType;


        function apiAvailable() {
            return typeof window.google === 'object';
        }

        function createMap(mapId) {
            var mapIdLoc = mapId || 'map3d';
            var myMapId = '#' + mapIdLoc;

            if (service.map) return service.map;
            if (!service.apiAvailable()) return null;

            var mapOptions = {
                zoom: service.defaultZoom,
                minZoom: 2,
                center: service.defaultLatLng,
                mapTypeId: google.maps.MapTypeId.HYBRID,
                mapTypeControlOptions: {
                    position: google.maps.ControlPosition.LEFT_TOP,
                    mapTypeIds: [google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.SATELLITE, MapTypeId.USGSTopo]
                },
                zoomControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_BOTTOM
                },
                panControl: false
            };

            $(myMapId).height($(window).height() - (42));

            service.map = new google.maps.Map(document.getElementById(mapIdLoc), mapOptions);

            // initialize geocoder
            service.geocoder = new google.maps.Geocoder();

            // handle window resize event
            google.maps.event.addDomListener(window, 'resize', function () {
                $(myMapId).height($(window).height() - (42));
                var center = service.map.getCenter();
                google.maps.event.trigger(service.map, 'resize');
                service.map.setCenter(center);
            });

            var overlayView = new google.maps.OverlayView();
            overlayView.draw = function () {
            };
            overlayView.setMap(service.map);
            service.overlayView = overlayView;

            // Initialize USGS TOPO Map Layer
            service.createWMSTopoMapType();

            return service.map;
        }

        function createInfoBox(template) {
            return new InfoBox({
                content: template || '',
                disableAutoPan: true,
                maxWidth: 0,
                pixelOffset: new google.maps.Size(25, -115),
                //closeBoxMargin: '15px 5px',
                closeBoxURL: 'static/resources/images/close-icon.png',
                isHidden: false,
                pane: 'floatPane',
                enableEventPropagation: true
            });
        }

        function openInfoBox(infobox, marker) {
            if( !(service.map && infobox && marker)) return;

            // Close last infobox open
            if (service.lastInfoboxOpen) service.lastInfoboxOpen.close();

            infobox.open(service.map, marker);

            service.lastInfoboxOpen = infobox;
            service.infoboxes.push(infobox);
        }

        function closeAllInfoBox() {
            service.infoboxes.forEach(function(infobox, index) {
               if(infobox) {
                   infobox.close();
               }
            });
        }

        function closeInfoBox() {
            if (service.lastInfoboxOpen) service.lastInfoboxOpen.close();
        }

        function addMapListener(eventName, callback) {
            if (service.map) {
                return service.addListener(service.map, eventName, callback);
            }
            return null;
        }

        function setMapCursorDefault() {
            if (service.map) service.map.setOptions({draggableCursor: null});
        }

        function setMapCursorCrosshair() {
            if (service.map) service.map.setOptions({draggableCursor: 'crosshair'});
        }

        function setMapBounds(bounds) {
            if (service.map) service.map.fitBounds(bounds);
        }

        function getBoundsFromPath(path) {
            if (!service.apiAvailable()) return null;
            var bounds = new google.maps.LatLngBounds();
            for (var index = 0; index < path.length; index++) {
                var point = path[index];
                bounds.extend(point);
            }
            return bounds;
        }

        function getDistanceOfPath(path) {
            if (!service.apiAvailable()) return 0;
            return google.maps.geometry.spherical.computeLength(path);
        }

        function fromLatLngToContainerPixel(latlng) {
            if (service.overlayView) {
                return service.overlayView.getProjection().fromLatLngToContainerPixel(latlng);
            }
            return new google.maps.Point();
        }

        function fromLatLngToDivPixel(latlng) {
            if (service.overlayView) {
                return service.overlayView.getProjection().fromLatLngToDivPixel(latlng);
            }
            return new google.maps.Point();
        }

        function fromLatLngToPoint(latlng) {
            if (service.map) {
                var numTiles = 1 << service.map.getZoom();
                var projection = new MercatorProjection();
                var worldCoordinate = projection.fromLatLngToPoint(latlng);
                return new google.maps.Point(
                    worldCoordinate.x * numTiles,
                    worldCoordinate.y * numTiles
                );
            } else {
                return new google.maps.Point();
            }
        }

        function createCoordinate(latitude, longitude) {
            return new google.maps.LatLng(latitude, longitude);
        }

        function createInfoWindow(content) {
            if (!service.apiAvailable()) return null;
            return new google.maps.InfoWindow({content: content});
        }

        function createCanvasInfoWindow() {
            if (!service.apiAvailable()) return null;

            return new CanvasInfoWindow(service.map);
        }

        function hideCanvasInfoWindow(infoWindow) {
            if (infoWindow) infoWindow.hideInfowindow();
        };

        function showInfoWindow(infoWindow, target) {
            if (infoWindow) infoWindow.open(service.map, target);
        }

        function hideInfoWindow(infoWindow) {
            if (infoWindow) infoWindow.close();
        }

        function clearInstanceListeners(_instance) {
            google.maps.event.clearInstanceListeners(_instance);
        }

        function initMarker(_position, _icon, _opts) {
            if (!service.apiAvailable()) return null;

            var additionalOpts = _opts || {};

            var opts = angular.extend({}, {
                position: _position,
                map: service.map,
                icon: _icon
            }, additionalOpts);

            return new google.maps.Marker(opts);
        }

        function createMarker(_position, _color) {
            _color = _color || service.MARKER_ICONS.RED;
            var marker = service.initMarker(_position, _color);

            service.markers.push(marker);

            return marker;
        }

        function createCustomMarker(_position, _icon, _opts) {
            var opts = _opts || {},
                icon = _icon || 'images/markers/default-solar-marker.png';

            return service.initMarker(_position, icon, opts);
        }

        function createCircleMarker(_position, color) {
            var icon = {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 5,
                fillColor: color || '#6ac1ff',
                fillOpacity: 1,
                strokeColor: 'black',
                strokeWeight: 1
            };

            var marker = service.initMarker(_position, icon);
            service.markers.push(marker);

            return marker;
        }

        function panTo(_position) {
            if (!service.map) return;

            service.map.panTo(_position);
        }

        function panToOffsetLeft(_position, _offset) {
            var offset = _offset || 0.013;
            var latLng = {};

            if(_position instanceof google.maps.LatLng) {
                console.log('object latlng');
                latLng.lat = _position.lat();
                latLng.lng = _position.lng() + offset;
            } else{
                latLng = _position;
                latLng.lng += offset;
            }

            this.panTo(latLng);
        }

        function showMarker(marker) {
            if (marker && marker instanceof google.maps.Marker) marker.setMap(service.map);
        }

        function showMarkers(markerArray) {
            markerArray.forEach(function (marker) {
                service.showMarker(marker);
            });
        }

        function hideMarker(marker) {
            if (marker && marker instanceof google.maps.Marker) marker.setMap(null);
        }

        function hideMarkers(markerArray) {
            markerArray.forEach( function(marker) {
                service.hideMarker(marker);
            });
        }

        function destroyMarker(marker) {
            service.hideMarker(marker);
            marker = null;
        }

        function centerMarker(marker) {
            if (service.map) {
                service.map.setCenter(marker.position);
                //service.map.setZoom(service.defaultZoom);
            }
        }

        function setMapCenter(coordinates) {
            if (service.map) {
                service.map.setCenter(coordinates);
            }
        }

        function setMapCenterDefault() {
            service.setMapCenter(service.defaultLatLng);
        }

        function setZoom(zoomValue) {
            if (service.map) {
                service.map.setZoom(zoomValue);
            }
        }

        function setZoomIfGreater(zoomValue) {
            if (zoomValue > service.map.getZoom())
                service.setZoom(zoomValue);
        }

        function setZoomDefault() {
            service.setZoom(service.defaultZoom);
        }

        function setZoomInDefault() {
            service.setZoom(service.ZOOM_IN_LEVEL);
        }

        function createDrawingManager(_color) {
            if (!service.apiAvailable()) return null;

            var strokeColor = _color || '#0000ff';

            var drawingManager = new google.maps.drawing.DrawingManager({
                drawingMode: null,
                drawingControl: true,
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: [
                        google.maps.drawing.OverlayType.POLYGON,
                        google.maps.drawing.OverlayType.RECTANGLE
                    ]
                },
                polygonOptions: {
                    clickable: true,
                    draggable: true,
                    editable: true,
                    geodesic: true,
                    fillColor: '#ffffff',
                    fillOpacity: 0,
                    strokeColor: strokeColor,
                    strokeOpacity: 0.9,
                    strokeWeight: 2,
                    zIndex: 1
                },
                rectangleOptions: {
                    clickable: true,
                    draggable: true,
                    editable: true,
                    fillColor: '#ffffff',
                    fillOpacity: 0,
                    strokeColor: strokeColor,
                    strokeOpacity: 0.9,
                    strokeWeight: 2,
                    zIndex: 1
                }
            });
            service.drawingManager = drawingManager;
            return drawingManager;
        }

        function createDrawingToolsManager() {
            if (!service.apiAvailable()) return null;
            var drawingManager = new google.maps.drawing.DrawingManager({
                drawingMode: null,
                drawingControl: true,
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: [
                        google.maps.drawing.OverlayType.MARKER,
                        google.maps.drawing.OverlayType.CIRCLE,
                        google.maps.drawing.OverlayType.POLYGON,
                        google.maps.drawing.OverlayType.POLYLINE,
                        google.maps.drawing.OverlayType.RECTANGLE
                    ]
                },
                markerOptions: {
                    icon: service.MARKER_ICONS.RED
                },
                circleOptions: {
                    clickable: true,
                    draggable: false,
                    editable: false,
                    fillColor: '#0000ff',
                    fillOpacity: 0.2,
                    strokeColor: '#0000ff',
                    strokeOpacity: 0.8,
                    strokeWeight: 1,
                    zIndex: 1
                },
                polygonOptions: {
                    clickable: true,
                    draggable: false,
                    editable: false,
                    geodesic: true,
                    fillColor: '#0000ff',
                    fillOpacity: 0.2,
                    strokeColor: '#0000ff',
                    strokeOpacity: 0.8,
                    strokeWeight: 1,
                    zIndex: 1
                },
                polylineOptions: {
                    clickable: true,
                    draggable: false,
                    editable: false,
                    strokeColor: '#0000ff',
                    strokeOpacity: 0.8,
                    strokeWeight: 1,
                    zIndex: 1
                },
                rectangleOptions: {
                    clickable: true,
                    draggable: false,
                    editable: false,
                    fillColor: '#0000ff',
                    fillOpacity: 0.2,
                    strokeColor: '#0000ff',
                    strokeOpacity: 0.8,
                    strokeWeight: 1,
                    zIndex: 1
                }
            });
            service.drawingManager = drawingManager;
            return drawingManager;
        }

        function showDrawingManager(drawingManager) {
            if (drawingManager) {
                if(!drawingManager.getMap()) {
                    drawingManager.setMap(service.map);
                }
                service.setEnableDrawingManager(drawingManager, true);
            }
        }

        function hideDrawingManager(drawingManager) {
            if (drawingManager) {
                drawingManager.setMap(null);
                service.setEnableDrawingManager(drawingManager, false);
            }
        }

        function setEnableDrawingManager(drawingManager, enabled) {
            if (drawingManager) {
                var drawingOptions = {drawingControl: enabled};
                // if drawing mode is disabled, set current mode to hand pointer.
                if (!enabled) drawingOptions['drawingMode'] = null;
                drawingManager.setOptions(drawingOptions);
            }
        }

        function createCircle(latitude, longitude, radius) {
            if (!service.apiAvailable()) return null;
            var latlng = new google.maps.LatLng(latitude, longitude);
            var circleOptions = {
                center: latlng,
                clickable: false,
                draggable: false,
                editable: false,
                fillColor: '#ffffff',
                fillOpacity: 0,
                map: service.map,
                radius: radius,
                strokeColor: '#0000ff',
                strokeOpacity: 0.9,
                strokeWeight: 2,
                zIndex: 100
            };
            return new google.maps.Circle(circleOptions);
        }

        function updateCircle(circle, latitude, longitude, radius) {
            if (circle) {
                circle.setCenter({lat: latitude, lng: longitude});
                circle.setRadius(radius);
            }
        }

        function initPolygon(path, _color) {
            if (!service.apiAvailable()) return null;

            var strokeColor = _color || '#0000ff';

            var polygonOptions = {
                path: path,
                clickable: false,
                draggable: false,
                editable: false,
                fillColor: strokeColor,
                fillOpacity: 0,
                strokeColor: strokeColor,
                strokeOpacity: 0.9,
                strokeWeight: 2,
                zIndex: 100
            };
            return new google.maps.Polygon(polygonOptions);
        }

        function createPolygon(path, _color) {
            var polygon = service.initPolygon(path, _color);

            polygon.setMap(service.map);

            return polygon;
        }

        function updatePolygon(polygon, path) {
            if (polygon) polygon.setPath(path);
        }

        function showPolygon(polygon) {
            if (polygon) polygon.setMap(service.map);
        }

        function hidePolygon(polygon) {
            if (polygon) polygon.setMap(null);
        }

        function resetPolygonFill(polygon) {
            polygon.setOptions({
                fillOpacity: 0
            });
        }

        function fillPolygon(polygon) {
            polygon.setOptions({
                fillOpacity: 0.5
            });
        }

        function panToPolygon(polygon) {
            if (!service.map || !polygon) return;

            var bounds = new google.maps.LatLngBounds();

            polygon.getPath().forEach( function(path){
                bounds.extend(path);
            });

            service.panTo(bounds.getCenter());
        }

        function createPolyline(path) {
            if (!service.apiAvailable()) return null;
            var polylineOptions = {
                path: path,
                clickable: false,
                draggable: false,
                editable: false,
                map: service.map,
                strokeColor: '#ff0000',
                strokeOpacity: 1,
                strokeWeight: 5,
                zIndex: 100
            };
            return new google.maps.Polyline(polylineOptions);
        }

        function updatePolyline(polyline, path) {
            if (polyline) polyline.setPath(path);
        }

        function showPolyline(polyline) {
            if (polyline) polyline.setMap(service.map);
        }

        function hidePolyline(polyline) {
            if (polyline) polyline.setMap(null);
        }

        function addListener(instance, eventName, handler) {
            if (!service.apiAvailable()) return null;
            return google.maps.event.addListener(instance, eventName, handler);
        }

        function addListenerOnce(instance, eventName, handler, capture) {
            if (!service.apiAvailable()) return null;
            return google.maps.event.addListenerOnce(instance, eventName, handler, capture);
        }

        function clearInstanceListeners(instance) {
            if (service.apiAvailable())
                google.maps.event.clearInstanceListeners(instance);
        }

        function clearListeners(instance, eventName) {
            if (service.apiAvailable())
                google.maps.event.clearListeners(instance, eventName);
        }

        function removeListener(listener) {
            if (service.apiAvailable())
                google.maps.event.removeListener(listener);
        }

        function trigger(instance, eventName, args) {
            if (service.apiAvailable())
                google.maps.event.trigger(instance, eventName, args);
        }

        function showCurrentLocation(_latLng, _isDraggable) {
            var icon = '/images/markers/current-location.png';
            var isDraggable = _isDraggable || false;

            return service.createCustomMarker(_latLng, icon, {draggable: isDraggable});
        }

        function reverseGeocode(latLng) {
            if (!service.geocoder) return;

            var dfd = $q.defer();

            service.geocoder.geocode({'latLng': latLng}, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    dfd.resolve(results);
                } else {
                    var error = "Geocoder failed due to: " + status;
                    $log.error(error);
                    dfd.reject(error);
                }
            });

            return dfd.promise;
        }

        /**
         * Start of TOPOGRAPHY Map Code
         */

        /*The code that reads in the WMS file.  To change the WMS layer the user would update the layers line.  As this is constructed now you need to have this code for each WMS layer.
         Check with your Web Map Server to see what are the required components of the address.  You may need to add a couple of segements.  For example, the ArcServer WMS requires
         a CRS value which is tacked on to the end of the url.  For an example visit http://www.gisdoctor.com/v3/arcserver_wms.html
         */

         function WMSGetTopoUrl(tile, zoom) {
            var projection = service.map.getProjection();
            var zpow = Math.pow(2, zoom);
            var ul = new google.maps.Point(tile.x * 256.0 / zpow, (tile.y + 1) * 256.0 / zpow);
            var lr = new google.maps.Point((tile.x + 1) * 256.0 / zpow, (tile.y) * 256.0 / zpow);
            var ulw = projection.fromPointToLatLng(ul);
            var lrw = projection.fromPointToLatLng(lr);
            //The user will enter the address to the public WMS layer here.  The data must be in WGS84
            var baseURL = "http://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer?&REQUEST=GetMap&SERVICE=WMS&VERSION=1.3&LAYERS="; //begining of the WMS URL ending with a "?" or a "&".
            var format = "image%2Fjpeg"; //type of image returned  or image/jpeg
            //The layer ID.  Can be found when using the layers properties tool in ArcMap
            var layers = "0";
            var srs = "EPSG:4326"; //projection to display. This is the projection of google map. Don't change unless you know what you are doing.
            var bbox = ulw.lat() + "," + ulw.lng() + "," + lrw.lat() + "," + lrw.lng();
            //Add the components of the URL together
            var url = baseURL + layers + "&Styles=default" + "&SRS=" + srs + "&BBOX=" + bbox + "&width=256" + "&height=256" + "&format=" + format + "&BGCOLOR=0xFFFFFF&TRANSPARENT=true" + "&reaspect=false" + "&CRS=EPSG:4326";
            return url;
        }

        function createWMSTopoMapType() {
            if (!service.apiAvailable()) return null;
            // Creating the WMS layer options.  This code creates the Google imagemaptype options for each wms layer.
            // In the options the function that calls the individual wms layer is set.
            var wmsOptions = {
                alt: MapTypeId.USGSTopo,
                getTileUrl: service.WMSGetTopoUrl,
                isPng: false,
                maxZoom: 16,
                minZoom: 1,
                name: MapTypeId.USGSTopo,
                tileSize: new google.maps.Size(256, 256),
                credit: 'USGS'
            };

            // init the USGS Topo map type
            var wmsMapType = new google.maps.ImageMapType(wmsOptions);
            service.map.mapTypes.set(MapTypeId.USGSTopo, wmsMapType);
        }

        return service;
    }
}());

