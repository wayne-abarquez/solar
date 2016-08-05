CanvasInfoWindow.prototype = new google.maps.OverlayView();


function CanvasInfoWindow(map, position) {
    if (typeof draw === 'function') {
        this.draw = draw;
    }


    this.position = position || null;
    this.map = map;
}

CanvasInfoWindow.prototype.computeShapeSize = function (w, h) {
    return {
        width: w * 0.32,
        height: this.inputField.scrollHeight + 30
    };
};

CanvasInfoWindow.prototype.computeShapeCoordinates = function () {
    // var shapeSize = this.computeShapeSize(w, h);

    // return {
    //     x: (w - shapeSize.width) * 0.5,
    //     y: (h - shapeSize.height) * 0.47
    // };
    return {
        x: (this.canvas.width * 0.335),
        y: (this.canvas.height * 0.42)
    };
};


CanvasInfoWindow.prototype.initObserver = function () {
    if (window.attachEvent) {
        this.observe = function (element, event, handler) {
            element.attachEvent('on' + event, handler);
        };
    }
    else {
        this.observe = function (element, event, handler) {
            element.addEventListener(event, handler, false);
        };
    }
};


CanvasInfoWindow.prototype.onAdd = function () {
    var that = this;


    //container size
    that.width = 500;
    that.height = 300;


    that.canvas = document.createElement('canvas');
    that.canvas.width = that.width;
    that.canvas.height = that.height;
    that.canvas.style.position = 'absolute';
    that.canvas.draggable = true;
    that.context = this.canvas.getContext('2d');

    that.inputField = document.createElement('textarea');
    that.inputField.cols = '18';
    that.inputField.rows = '1';
    that.inputField.style.resize = 'none';
    that.inputField.style.overflow = 'hidden';
    that.inputField.placeholder = 'Enter text...';
    that.inputField.style.font = '13px Roboto,Arial,sans-serif';
    that.inputField.style.position = 'absolute';


    var shapeCoords = that.computeShapeCoordinates(),
        shapeSize = that.computeShapeSize(that.width, that.height);

    that.shapeX = shapeCoords.x;
    that.shapeY = shapeCoords.y;
    that.shapeWidth = shapeSize.width;
    that.shapeHeight = shapeSize.height;

    that.contentHolder = document.createElement('p');
    that.contentHolderDefaultTextHeight = that.shapeHeight - 5;
    that.contentHolder.style.maxWidth = (that.shapeWidth - 16) + 'px';
    that.contentHolder.style.position = 'absolute';
    that.contentHolder.style.wordWrap = 'break-word';
    that.contentHolder.style.font = 'bold 13px Roboto,Arial,sans-serif';
    that.contentHolder.style.visbility = 'hidden';

    that.closeContainer = document.createElement('div');
    that.closeContainer.style.width = '15px';
    that.closeContainer.style.height = '15px';
    that.closeContainer.style.overflow = 'hidden';
    that.closeContainer.style.position = 'absolute';
    that.closeContainer.style.opacity = '0.7';
    that.closeContainer.style.cursor = 'pointer';
    that.closeContainer.style.zIndex = '10000';
    that.closeContainer.onmouseover = function () {
        that.closeContainer.style.opacity = '1';
    };
    that.closeContainer.onmouseout = function () {
        that.closeContainer.style.opacity = '0.7';
    };
    that.closeContainer.onclick = function () {
        that.onRemove();
    };

    that.closeButton = document.createElement('img');
    that.closeButton.style.width = '59px';
    that.closeButton.style.height = '492px';

    that.closeButton.style.left = '-2px';
    that.closeButton.style.top = '-336px';

    that.closeButton.src = 'https://maps.gstatic.com/mapfiles/api-3/images/mapcnt6.png';
    that.closeButton.style.position = 'absolute';
    that.closeButton.style.padding = '0px';
    that.closeButton.style.margin = '0px';
    that.closeButton.style.border = '0px';

    that.closeContainer.appendChild(that.closeButton);


    that.isResizeDrag = false;
    that.expectResize = -1;
    that.selected = false;
    that.moveHandler = false;

    that.shape = new Shape(that.context,
        that.shapeX,
        that.shapeY,
        that.shapeWidth,
        that.shapeHeight
    );


    // fixes mouse co-ordinate problems when there's a border or padding
    // see getMouse for more detail
    if (document.defaultView && document.defaultView.getComputedStyle) {
        this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(this.canvas, null)['paddingLeft'], 10) || 0;
        this.stylePaddingTop = parseInt(document.defaultView.getComputedStyle(this.canvas, null)['paddingTop'], 10) || 0;
        this.styleBorderLeft = parseInt(document.defaultView.getComputedStyle(this.canvas, null)['borderLeftWidth'], 10) || 0;
        this.styleBorderTop = parseInt(document.defaultView.getComputedStyle(this.canvas, null)['borderTopWidth'], 10) || 0;
    }

    // Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
    // They will mess up mouse coordinates and this fixes that
    var html = document.body.parentNode;
    this.htmlTop = html.offsetTop;
    this.htmlLeft = html.offsetLeft;

    /* Listeners */

    google.maps.event.addDomListener(
        that.map.getDiv(),
        'mouseleave',
        function () {
            google.maps.event.trigger(that.canvas, 'mouseup');
        }
    );

    google.maps.event.addDomListener(
        that.map.getDiv(),
        'click',
        function (e) {
            var mouse = that.getMouse(e);

            that.selected = that.shape.contains(mouse.x, mouse.y);
            that.draw();
        }
    );


    google.maps.event.addDomListener(
        this.canvas,
        'mousedown',
        function (e) {

            if (that.expectResize !== -1) {
                that.isResizeDrag = true;
                return;
            }

            var mouse = that.getMouse(e);

            if (that.shape.contains(mouse.x, mouse.y)) {
                that.selected = true;

                // Move this to mouse move
                this.style.cursor = 'move';
                that.map.set('draggable', false);
                that.set('origin', e);

                that.moveHandler = google.maps.event.addDomListener(
                    that.map.getDiv(),
                    'mousemove',
                    function (e) {
                        var mouse = that.getMouse(e);

                        var projection = that.getProjection(),
                            origin = that.get('origin'),
                            left = origin.clientX - e.clientX,
                            top = origin.clientY - e.clientY,
                            pos = projection.fromLatLngToDivPixel(that.position),
                            latLng = projection.fromDivPixelToLatLng(new google.maps.Point(pos.x - left,
                                pos.y - top));
                        that.set('origin', e);
                        that.set('position', latLng);
                        that.draw();
                    });
            }
            else {
                that.selected = false;
                that.draw();
            }

        });


    google.maps.event.addDomListener(this.canvas, 'mousemove',
        function (e) {

            that.map.setOptions({draggable: false});

            var offsetX = e.offsetX,
                offsetY = e.offsetY;


            // check here if not on top of selection handles
            // then drag shape
            if (that.isResizeDrag) {
                e.stopPropagation();

                if (( offsetX >= (that.canvas.width - 5)
                    || offsetX <= 5
                    || offsetY >= (that.canvas.height - 5)
                    || offsetY <= 5)) {
                    return;
                }

                var oldx = that.shape.x;
                var oldy = that.shape.y;

                if (that.expectResize === 8) {
                    that.shape.px = offsetX;
                    that.shape.py = offsetY;

                    that.draw();
                }
            }


            if (that.selected && !that.isResizeDrag) {

                var mouse = that.getMouse(e);
                var cur = that.shape.selectionHandles[8];

                if (mouse.x >= cur.x
                    && mouse.x <= (cur.x + that.shape.selectionData.boxSize)
                    && mouse.y >= cur.y
                    && mouse.y <= (cur.y + that.shape.selectionData.boxSize)
                ) {
                    // we found one!
                    that.expectResize = 8;
                    that.canvas.style.cursor = 'move';

                    return;
                }

                // not over a selection box, return to normal
                that.isResizeDrag = false;
                that.expectResize = -1;
                that.canvas.style.cursor = 'auto';
            }

            that.map.setOptions({draggable: true});

        });


    google.maps.event.addDomListener(
        that.map.getDiv(),
        'mouseup',
        function () {
            google.maps.event.trigger(that.canvas, 'mouseup');
        }
    );


    google.maps.event.addDomListener(
        that.canvas,
        'mouseup',
        function () {
            that.map.set('draggable', true);
            this.style.cursor = 'default';

            google.maps.event.removeListener(that.moveHandler);
            that.selected = false;

            that.isResizeDrag = false;
            that.expectResize = -1;
        });

    var saveTextValueListener = function (inputFieldElement) {
        that.inputField.style.visibility = 'hidden';
        that.contentHolder.style.visibility = 'visible';

        that.contentHolder.innerHTML = inputFieldElement.value.replace(/\r\n|\r|\n/g, "<br />");
    };


    that.contentHolder.addEventListener('click', function (e) {
        that.contentHolder.style.visibility = "hidden";
        that.inputField.style.visibility = "visible";
        that.inputField.style.zIndex = "2";
        that.contentHolder.style.zIndex = "1";
    });


    that.initObserver();

    function resize(e) {
        that.inputField.style.height = 'auto';
        that.inputField.style.height = that.inputField.scrollHeight + 'px';

        // resize canvas
        that.shape.h = that.inputField.scrollHeight + 10;
        that.draw();
    }

    /* 0-timeout to get the already changed text */
    function delayedResize(e) {
        var key = e.which || e.keyCode;

        if (key && key === 13) {
            saveTextValueListener(this);
            return;
        }

        window.setTimeout(resize, 0);
    }

    that.observe(that.inputField, 'change', resize);
    that.observe(that.inputField, 'cut', delayedResize);
    that.observe(that.inputField, 'paste', delayedResize);
    that.observe(that.inputField, 'drop', delayedResize);
    that.observe(that.inputField, 'keydown', delayedResize);


    this.getPanes().floatPane.appendChild(this.canvas);
    this.getPanes().floatPane.appendChild(this.inputField);
    this.getPanes().floatPane.appendChild(this.contentHolder);
    this.getPanes().floatPane.appendChild(this.closeContainer);
};
/* End of onAdd  */


CanvasInfoWindow.prototype.open = function () {
    this.setMap(this.map);
};

CanvasInfoWindow.prototype.draw = function () {

    var projection = this.getProjection();

    if (projection) {

        this.clear();

        var pos = projection.fromLatLngToDivPixel(this.position);

        var canvasPos = {
            x: (pos.x - this.shape.w * 0.5),
            y: (pos.y - (this.canvas.height * 0.48))
        };

        this.canvas.style.left = canvasPos.x + 'px';
        this.canvas.style.top = canvasPos.y + 'px';

        var inputPosX = canvasPos.x + (this.shape.w * 1.08),
            inputPosY = (canvasPos.y + this.canvas.height * 0.435);

        this.inputField.style.left = inputPosX + 'px';
        this.inputField.style.top = inputPosY + 'px';

        this.contentHolder.style.left = inputPosX + 'px';
        this.contentHolder.style.top = inputPosY + 'px';

        this.closeContainer.style.left = (inputPosX + (this.shape.w * 0.87)) + 'px';
        this.closeContainer.style.top = (inputPosY - 5) + 'px';

        this.canvas.x = pos.x;
        this.canvas.y = pos.y;

        //this.context.fillStyle = "#FF0000";
        //this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        //this.context.fill();

        if (this.selected) {
            this.shape.draw(true);
            this.closeContainer.style.display = 'inline-block';
        } else {
            this.shape.draw();
            this.closeContainer.style.display = 'none';
        }

    }
};
/* End of draw  */


function mouseMoveEvent(e, that) {
    var mouse = that.getMouse(e);

    if (that.shape.contains(mouse.x, mouse.y)) {
        var projection = that.getProjection(),
            origin = that.get('origin'),
            left = origin.clientX - e.clientX,
            top = origin.clientY - e.clientY,
            pos = projection.fromLatLngToDivPixel(that.position),
            latLng = projection.fromDivPixelToLatLng(new google.maps.Point(pos.x - left,
                pos.y - top));
        that.set('origin', e);
        that.set('position', latLng);
        that.draw();
    }
};

CanvasInfoWindow.prototype.setPosition = function (position) {
    this.position = position;
    this.draw();
};

CanvasInfoWindow.prototype.hideInfowindow = function () {
    this.onRemove();
};

CanvasInfoWindow.prototype.getMouse = function (e) {
    var rect = this.canvas.getBoundingClientRect();

    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
};

CanvasInfoWindow.prototype.clear = function () {
    if (this.context) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};
/* End of clear */

CanvasInfoWindow.prototype.onRemove = function () {
    if (this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
        this.inputField.parentNode.removeChild(this.inputField);
        this.contentHolder.parentNode.removeChild(this.contentHolder);
        this.closeContainer.parentNode.removeChild(this.closeContainer);
    }
};
/* End of onRemove */


/* SHAPE  CLASS HERE  */
// Box object to hold data
function Shape(context, x, y, w, h, px, py, fill) {
    this.context = context;
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 1;
    this.h = h || 1;
    this.px = px || this.x + (this.w * -0.5);
    this.py = py || this.y + (this.h * 0.5);
    this.fill = fill || '#FFFFFF';
    this.content = "";

    // New, holds the 8 tiny boxes that will be our selection handles
    // the selection handles will be in this order:
    // 0  1  2
    // 3     4
    // 5  6  7
    this.selectionHandles = [];

    this.selectionData = {
        color: '#CC0000',
        width: 2,
        boxColor: 'darkred',
        boxSize: 6
    };

}

// New methods on the Box class
Shape.prototype = {
    // we used to have a solo draw function
    // but now each box is responsible for its own drawing
    // mainDraw() will call this with the normal canvas
    // myDown will call this with the ghost canvas with 'black'
    draw: function (isSelected, optionalColor) {

        var selected = isSelected || false;

        this.context.fillStyle = this.fill;

        var r = this.x + this.w;
        var b = this.y + this.h;

        if (this.py < this.y || this.py > this.y + this.h) {
            var con1 = Math.min(Math.max(this.x, this.px - 10), r - 20);
            var con2 = Math.min(Math.max(this.x + 20, this.px + 10), r);
        }
        else {
            var con1 = Math.min(Math.max(this.y, this.py - 10), b - 20);
            var con2 = Math.min(Math.max(this.y + 20, this.py + 10), b);
        }

        var dir;

        if (this.py < this.y) dir = 2;

        if (this.py > this.y) dir = 3;

        if (this.px < this.x && this.py >= this.y && this.py <= b) dir = 0;

        if (this.px > this.x && this.py >= this.y && this.py <= b) dir = 1;

        if (this.px >= this.x && this.px <= r && this.py >= this.y && this.py <= b) dir = -1;

        this.context.beginPath();
        this.context.strokeStyle = this.fill;
        this.context.lineWidth = "1";

        this.context.fillRect(this.x, this.y, this.w, this.h);

        this.context.moveTo(this.x, this.y);

        if (dir == 2) {
            this.context.lineTo(con1, this.y);
            this.context.lineTo(this.px, this.py);
            this.context.lineTo(con2, this.y);
            this.context.lineTo(r, this.y);
        } else this.context.lineTo(r, this.y);

        // Removed this to eliminate line on square
        // this.context.moveTo(r, this.y);

        if (dir == 1) {
            this.context.lineTo(r, con1);
            this.context.lineTo(this.px, this.py);
            this.context.lineTo(r, con2);
            this.context.lineTo(r, b);
        } else this.context.lineTo(r, b);

        // Removed this to eliminate line on square
        // this.context.moveTo(r, b);

        if (dir == 3) {
            this.context.lineTo(con2, b);
            this.context.lineTo(this.px, this.py);
            this.context.lineTo(con1, b);
            this.context.lineTo(this.x, b);
        } else this.context.lineTo(this.x, b);

        this.context.moveTo(this.x, b);

        if (dir == 0) {
            this.context.lineTo(this.x, con2);
            this.context.lineTo(this.px, this.py);
            this.context.lineTo(this.x, con1);
            this.context.lineTo(this.x, this.y);
        } else this.context.lineTo(this.x, this.y);

        this.context.moveTo(this.x, this.y);

        this.context.fill();
        this.context.stroke();

        // Add Context or Text here
        // if(this.content) {
        //      // this.context.textAlign = 'right';
        //      // this.context.textBaseline = 'right';
        //      this.context.fillStyle = "black";
        //      this.context.font='bold 13px Roboto,Arial,sans-serif';
        //      this.context.fillText(this.content, this.x + 9, this.y + 20);
        // }


        /* SElection handles here */

        if (this.selectionHandles.length < 9) {
            for (var i = 0; i < 9; i++) {
                var rect = new Shape();
                this.selectionHandles.push(rect);
            }
        }

        // draw selection
        // this is a stroke along the box and also 8 new selection handles
        if (selected) {
            this.updateSelectionHandles();
        }

    } // end draw

}

// Determine if a point is inside the shape's bounds
Shape.prototype.contains = function (mx, my) {

    // All we have to do is make sure the Mouse X,Y fall in the area between
    // the shape's X and (X + Width) and its Y and (Y + Height)
    return (this.x <= mx)
        && (this.x + this.w >= mx)
        && (this.y <= my)
        && (this.y + this.h >= my);
}

Shape.prototype.reComputeArrow = function () {
    this.px = this.x + (this.w * 0.5);
    this.py = this.y + (this.h * 1.5);
}


Shape.prototype.updateSelectionHandles = function () {

    for (var i = 0; i < 9; i++) {
        var cur = this.selectionHandles[i];
        this.context.clearRect(cur.x, cur.y, this.selectionData.boxSize, this.selectionData.boxSize);
    }

    this.context.strokeStyle = this.selectionData.color;
    this.context.lineWidth = this.selectionData.width;
    this.context.strokeRect(this.x, this.y, this.w, this.h);

    // draw the boxes

    var half = this.selectionData.boxSize / 2;

    // 0  1  2
    // 3     4
    // 5  6  7

    // top left, middle, right
    this.selectionHandles[0].x = this.x - half;
    this.selectionHandles[0].y = this.y - half;

    this.selectionHandles[1].x = this.x + this.w / 2 - half;
    this.selectionHandles[1].y = this.y - half;

    this.selectionHandles[2].x = this.x + this.w - half;
    this.selectionHandles[2].y = this.y - half;

    //middle left
    this.selectionHandles[3].x = this.x - half;
    this.selectionHandles[3].y = this.y + this.h / 2 - half;

    //middle right
    this.selectionHandles[4].x = this.x + this.w - half;
    this.selectionHandles[4].y = this.y + this.h / 2 - half;

    //bottom left, middle, right
    this.selectionHandles[6].x = this.x + this.w / 2 - half;
    this.selectionHandles[6].y = this.y + this.h - half;

    this.selectionHandles[5].x = this.x - half;
    this.selectionHandles[5].y = this.y + this.h - half;

    this.selectionHandles[7].x = this.x + this.w - half;
    this.selectionHandles[7].y = this.y + this.h - half;

    // arrow
    this.selectionHandles[8].x = this.px - half;
    this.selectionHandles[8].y = this.py - half;


    this.context.fillStyle = this.selectionData.color;

    for (var i = 0; i < 9; i++) {
        var cur = this.selectionHandles[i];
        this.context.fillRect(cur.x, cur.y, this.selectionData.boxSize, this.selectionData.boxSize);
    }
}
