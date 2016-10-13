'use strict';

window.onload = function() {
    var n = $('.count').html() - 1;
    setInterval(function() {
        if (n >= 0) {
            $('.count').html(n--);
        }
    }, 1000);
};
