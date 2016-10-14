jQuery(function ($) {
    'use strict';

    var COUNTDOWN = {
        timerTxt: "<div class='circle center'><div class='count'>5</div><div class='l-half'></div><div class='r-half'></div></div>",

        init: function () {
            COUNTDOWN.binEvents();
//            COUNTDOWN.addTimer();
        },

        binEvents: function () {
            COUNTDOWN.$timer = $('.timer');
        },

        addTimer: function (callback) {
            callback = callback || function () {};
            
            COUNTDOWN.$timer.html(COUNTDOWN.timerTxt);
            var n = 5;
            setInterval(function () {
                if (n >= 0) { $('.count').html(n--); }
                if (n === 0) { callback();  }
                
            }, 1000);
        },
                        

    };

    COUNTDOWN.init();
}($));
