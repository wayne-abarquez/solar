(function(){
'use strict';

angular.module('solarApp')
    .directive('fixed', ['$compile', '$window', fixed]);

    function fixed($compile, $window) {
        console.log('fixed called');
        function postLink(scope, element, attrs) {
            var table = copyAttrs(jQLite('<table>'), element.parent());
            var clone = element.clone().removeAttr('fixed').removeAttr('ng-if');

            table.css({
                'position': 'absolute',
                'backgroundColor': '#fff',
                'zIndex': 1
            }).addClass('fixed');

            element.css('visibility', 'hidden');

            grandParent().prepend($compile(table.append(clone))(scope));

            var height = clone.prop('clientHeight');

            grandParent().css('position', 'relative').on('scroll', function () {
                if (grandParent().prop('scrollTop') === 0) {
                    table.removeClass('md-whiteframe-1dp');
                } else if (!table.hasClass('md-whiteframe-1dp')) {
                    table.addClass('md-whiteframe-1dp');
                }
                clone.children().css('height', grandParent().prop('scrollTop') + height + 'px');
            });

            function cells() {
                return clone.prop('rows')[0].cells.length;
            }

            function copyAttrs(newElement, oldElement) {
                var attrs = oldElement.prop('attributes');

                for (var attr in attrs) {
                    newElement.attr(attrs[attr].name, attrs[attr].value);
                }

                return newElement;
            }

            function getCells(row) {
                return Array.prototype.filter.call(row.cells, function (cell) {
                    return !cell.classList.contains('ng-leave');
                });
            }

            function grandParent() {
                return element.parent().parent();
            }

            function jQLite(node) {
                return angular.element(node);
            }

            function update() {
                getCells(clone.prop('rows')[0]).map(jQLite).forEach(function (copy, index) {
                    if (copy.hasClass('clone')) {
                        return;
                    }

                    copy.addClass('clone');

                    var cell = element.find('th').eq(index);
                    var style = $window.getComputedStyle(cell[0]);

                    copy.css('paddingBottom', (height / 2) - (cell.children().prop('clientHeight') / 2) + 'px');

                    var getWidth = function () {
                        return style.width;
                    };

                    var setWidth = function () {
                        copy.css('minWidth', style.width);
                    };

                    var listener = scope.$watch(getWidth, setWidth);

                    $window.addEventListener('resize', setWidth);

                    copy.on('$destroy', function () {
                        listener();
                        $window.removeEventListener('resize', setWidth);
                    });

                    cell.on('$destroy', function () {
                        copy.remove();
                    });
                });
            }

            scope.$watch(cells, update);

            element.on('$destroy', function () {
                table.remove();
            });
        }

        return {
            link: postLink
        };
    }
}());




