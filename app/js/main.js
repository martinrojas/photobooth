var canvasBuffer = require('electron-canvas-to-buffer')
var fs = require('fs')

jQuery(function($) {
    'use strict';

    var BOOTH = {
        curStream: null,
        snap: 0,
        videoSources: [],

        init: function() {
            BOOTH.bind();
            BOOTH.getVideoSources();
            BOOTH.getCamera();

        },

        bind: function() {
            $('.modal-trigger').leanModal();
            $('#moreBtn').on('click', BOOTH.onMore);
            $('#snapBtn').on('click', BOOTH.onSnaps);
            $('select').on('change', BOOTH.streamChange);
            BOOTH.canvas = [
                document.getElementById("snapShot1").getContext("2d"),
                document.getElementById("snapShot2").getContext("2d"),
                document.getElementById("snapShot3").getContext("2d"),
                document.getElementById("snapShot4").getContext("2d")
            ];
            BOOTH.canvasId = [
                document.getElementById("snapShot1"),
                document.getElementById("snapShot2"),
                document.getElementById("snapShot3"),
                document.getElementById("snapShot4")
            ];

            BOOTH.video = document.getElementById("feed");


        },
        onMore: function(e) {
            e.preventDefault();
            $('.step1').css('height', '100vh');
            $('.step2').css('height', 0);
        },
        onSnaps: function(e) {
            e.preventDefault();
            BOOTH.snap = 0;
            BOOTH.theNextPicture();
        },
        theNextPicture: function() {
            if (BOOTH.snap < 4) {
                COUNTDOWN.addTimer();
                setTimeout(function() {
                    BOOTH.snap++;
                    BOOTH.theNextPicture();
                }, 6000);
            } else if (BOOTH.snap == 4) {
                $('.step1').css('height', 0);
                $('.step2').css('height', '100vh');

                BOOTH.canvasId.forEach(function(canva) {
                    var buffer = canvasBuffer(canva, 'image/png')
                    var d = new Date();
                    var n = d.getTime();
                    // write canvas to file
                    fs.writeFile('./party/' + n + '.png', buffer, function(err) {
                        throw err;
                    })
                })
            }
        },
        takePicture: function() {

            BOOTH.canvas[BOOTH.snap].drawImage(BOOTH.video, 0, 0, 1280, 720, 0, 0, 1280, 720);
            BOOTH.canvas[BOOTH.snap].globalCompositeOperation = "source-over";
            BOOTH.canvas[BOOTH.snap].drawImage(document.getElementById('moji' + BOOTH.snap), 0, 0, 1280, 720, 0, 0, 1280, 720);

            //		var img = canvas.toDataURL("image/png");
            //		document.getElementById('snapShot').src = img;
            //            $('#pictureTaken').openModal();


        },


        streamChange: function() {
            BOOTH.curStream = $('#camSelect').value;
            if (BOOTH.curStream && BOOTH.curStream.active) {

                BOOTH.getCamera();
            }
        },

        getCamera: function() {
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

            // constraints allow us to select a specific video source
            var constraints = {
                video: {
                    mandatory: {
                        minWidth: 1280,
                        minHeight: 720
                    },
                    optional: [{
                      sourceId: $('#camSelect').value
                    }]
                },
                audio: false
            }

            navigator.getUserMedia(constraints, function(stream) {
                var videoElm = document.querySelector('video');
                videoElm.src = URL.createObjectURL(stream);

                //                stream.onended = function() {};

                videoElm.onplay = function() {
                    if (BOOTH.curStream !== null) BOOTH.curStream.stop;
                    BOOTH.curStream = stream;
                };

            }, function(e) {
                console.error(e);
            });
        },

        getVideoSources: function(callback) {
            var ddl = $('#camSelect');

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
                            BOOTH.videoSources.push({
                                id: device.deviceId,
                                label: device.label || 'Camera ' + (BOOTH.videoSources.length + 1)
                            });
                            $('<option>').val(device.deviceId).text(device.label).appendTo(ddl);
                            BOOTH.curStream = BOOTH.videoSources[0].id;
                        }
                    });
                })
                .catch(function(err) {
                    console.log(err.name + ": " + err.message);
                });
        }
    };

    var COUNTDOWN = {
        timerTxt: "<div class='circle center'><div class='count'>4</div><div class='l-half'></div><div class='r-half'></div></div>",

        init: function() {
            COUNTDOWN.bind();
            //            COUNTDOWN.addTimer();
        },

        bind: function() {
            COUNTDOWN.$timer = $('.timer');
        },

        addTimer: function() {

            COUNTDOWN.$timer.html(COUNTDOWN.timerTxt);
            COUNTDOWN.timeVal = 4;
            COUNTDOWN.$interval = setInterval(COUNTDOWN.tick, 1000);
        },

        tick: function() {
            if (COUNTDOWN.timeVal >= 0) {
                $('.count').html(COUNTDOWN.timeVal);
            }
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
