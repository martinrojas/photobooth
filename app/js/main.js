/**
 * Grabs the camera feed from the browser, requesting
 * video from the selected device. Requires the permissions
 * for videoCapture to be set in the manifest.
 *
 * @see http://developer.chrome.com/apps/manifest.html#permissions
 */

var curStream = null; // keep track of current stream
var oauth_token, oauth_token_secret;

function getCamera() {
    var cameraSrcId = $('select').value;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

    // constraints allow us to select a specific video source
    var constraints = {
        video: {
            mandatory: {
                minWidth: 1280,
                minHeight: 720
            },
            optional: [{
                sourceId: cameraSrcId
            }]
        },
        audio: false
    }


    navigator.getUserMedia(constraints, function(stream) {
        var videoElm = document.querySelector('video');
        videoElm.src = URL.createObjectURL(stream);

        stream.onended = function() {
            updateButtonState();
        }

        videoElm.onplay = function() {
            if (curStream !== null) {
                // stop previous stream
                curStream.stop();
            }

            curStream = stream;
            updateButtonState();
        }
    }, function(e) {
        curStream = null;
        console.error(e);
    });
}




/**
 * Updates button state according to Camera stream status
 */

function updateButtonState() {
    var btn = $('#camBtn');

    if ((!curStream) || (!curStream.active)) {
        btn.text("Enable Camera");

    } else {
        btn.text("Disable Camera");

    }
}

/**
 * Populate camera sources drop down
 */

getVideoSources(function(cameras) {
    var ddl = $('select');
    if (cameras.length == 1) {
        // if only 1 camera is found drop down can be disabled
        ddl.disabled = true;
        //		console.log("Only one camera");
    }

    cameras.forEach(function(camera) {
        $('<option>').val(camera.id).text(camera.label).appendTo(ddl);

    });
});

/**
 * This retrieves video sources and passes them to callback parameter
 */

function getVideoSources(callback) {
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

    // MediaStreamTrack.enumerateDevices(function(sources){
    // 	sources.forEach(function(source,index){
    // 		if(source.kind === 'video') {
    // 			// we only need to enlist video sources
    // 			videoSources.push({
    // 				id: source.id,
    // 				label: source.label || 'Camera '+(videoSources.length+1)
    // 			});
    // 		}
    // 	});
    // 	callback(videoSources);
    // });
}

$(function() {

    $('#camBtn').on('click', function() {
        // camera is active, stop stream
        if (curStream && curStream.active) {
            curStream.getTracks()[0].stop();
            $('video').src = "";
        } else {
            getCamera();
        }
    });

    $('#snapBtn').on('click', function() {
        var canvas = document.getElementById("snapShot").getContext("2d");
        var video = document.getElementById("feed");
        canvas.drawImage(video, 0, 0, 1280, 720, 0, 0, 640, 360);
        canvas.globalCompositeOperation = "source-over";
        canvas.drawImage(document.getElementById("logo"), 30, 20, 220, 26);

        //		var img = canvas.toDataURL("image/png");
        //		document.getElementById('snapShot').src = img;
        $('#pictureTaken').openModal();

    });


    /**
     * Change stream source according to dropdown selection
     */
    $('#camSelect').on('change', function() {
        if (curStream && curStream.active) {
            getCamera();
        }
    });

    $('.modal-trigger').leanModal();

    getCamera();
});
