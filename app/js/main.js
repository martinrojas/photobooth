jQuery(function ($) {
    'use strict';

    var BOOTH = {
        curStream: null,

        init: function () {
            BOOTH.bind();
            BOOTH.getCamera();
        },

        bind: function () {
            $('.modal-trigger').leanModal();
            $('#snapBtn').on('click', COUNTDOWN.addTimer);
            BOOTH.canvas = document.getElementById("snapShot").getContext("2d");
            BOOTH.video = document.getElementById("feed");

        },

        takePicture: function () {

            BOOTH.canvas.drawImage(BOOTH.video, 0, 0, 1280, 720, 0, 0, 1280, 720);
            BOOTH.canvas.globalCompositeOperation = "source-over";
            BOOTH.canvas.drawImage(document.getElementById("logo"), 30, 20, 220, 26);

            //		var img = canvas.toDataURL("image/png");
            //		document.getElementById('snapShot').src = img;
            //            $('#pictureTaken').openModal();
            $('.step1').css('height', 0);
            $('.step2').css('height', '100vh');

        },

        getCamera: function () {
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

            // constraints allow us to select a specific video source
            var constraints = {
                video: {
                    mandatory: {
                        minWidth: 1280,
                        minHeight: 720
                    }
                },
                audio: false
            }

            navigator.getUserMedia(constraints, function(stream) {
                var videoElm = document.querySelector('video');
                videoElm.src = URL.createObjectURL(stream);

                stream.onended = function() {};

                videoElm.onplay = function() {
                    if (BOOTH.curStream !== null) BOOTH.curStream.stop();
                    BOOTH.curStream = stream;
                };

            }, function(e) {
                console.error(e);
            });
        },

        getVideoSources: function (callback) {
            var videoSources = [];
            callback = callback || function() {};

            if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
                console.log("enumerateDevices() not supported.");
                return;
            }

            navigator.mediaDevices.enumerateDevices()
                .then(function(devices) {
                devices.forEach(function(device) {
                    // console.log(device.kind + ": " + device.label +	" id = " + device.deviceId);
                    if (device.kind === 'videoinput') {
                        // we only need to enlist video sources
                        videoSources.push({
                            id: device.deviceId,
                            label: device.label || 'Camera ' + (videoSources.length + 1)
                        });
                    }

                    callback(videoSources);
                });
            })
                .catch(function(err) {
                console.log(err.name + ": " + err.message);
            });

        }
    };

    var COUNTDOWN = {
        timerTxt: "<div class='circle center'><div class='count'>4</div><div class='l-half'></div><div class='r-half'></div></div>",

        init: function () {
            COUNTDOWN.bind();
            //            COUNTDOWN.addTimer();
        },

        bind: function () {
            COUNTDOWN.$timer = $('.timer');
        },

        addTimer: function (e) {
            e.preventDefault();

            COUNTDOWN.$timer.html(COUNTDOWN.timerTxt);
            COUNTDOWN.timeVal = 4;
            COUNTDOWN.$interval = setInterval(COUNTDOWN.tick, 1000);
        },

        tick: function () {
            console.log(COUNTDOWN.timeVal);
            if (COUNTDOWN.timeVal >= 0) { $('.count').html(COUNTDOWN.timeVal); }
            if (COUNTDOWN.timeVal === 0) { 
                clearInterval(COUNTDOWN.$interval);
                BOOTH.takePicture(); 
                COUNTDOWN.$timer.html('');
            }
            COUNTDOWN.timeVal--;
        }
    };

    COUNTDOWN.init();
    BOOTH.init();
}($));
