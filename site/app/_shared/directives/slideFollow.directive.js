/* eslint-disable no-unused-lets */
module.exports = function ($timeout) {
    return {
        restrict: 'E',     //Element
        replace: true,
        template: "<li ng-repeat = 'd in text'><span title='{{d}}'>{{d}}</span></li>",
        link: function (scope, elem) {
            $timeout(function () {
                let ul = $("." + elem.parent().get(0).className);
                let i = 1, t;
                let liLength = ul.children("li").length;
                let liHeight = ul.children("li").height() +
                    parseInt(ul.children("li").css('border-bottom-width'));
                ul.html(ul.html() + ul.html());
                t = setInterval(slide, 2000);
                function slide() {
                    if (parseInt(ul.css("margin-top")) > (-liLength * liHeight)) {
                        ul.stop(true, true).animate({marginTop: -liHeight * i++ + "px"}, "fast");
                    } else {
                        i = 0;
                        ul.css("margin-top", "0px");
                        ul.stop(true, true).animate({marginTop: -liHeight * i++ + "px"}, "fast");
                    }
                }

                //hover and stop slide flow
                ul.hover(function () {
                    clearInterval(t);
                }, function () {
                    clearInterval(t);
                    t = setInterval(slide, 2000);
                });
            }, 0);
        }
    };
};
