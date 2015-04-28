/**
 * Grabs the camera feed from the browser, requesting
 * video from the selected device. Requires the permissions
 * for videoCapture to be set in the manifest.
 *
 * @see http://developer.chrome.com/apps/manifest.html#permissions
 */

var curStream = null; // keep track of current stream

function getCamera() {
	var cameraSrcId = $('select').value;

	// constraints allow us to select a specific video source 
	var constraints = {
		video: {
			optional: [{
				sourceId: cameraSrcId
			}]
		},
		audio:false
	}

	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia

	navigator.getUserMedia(constraints, function(stream) {
		var videoElm = document.querySelector('video');
		videoElm.src = URL.createObjectURL(stream);

		stream.onended = function() {
			updateButtonState();
		}

		videoElm.onplay = function() {
			if(curStream !== null) {
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

	if((!curStream) || (!curStream.active)) {
		btn.text("Enable Camera");
	}
	else {
		btn.text("Disable Camera"); 
	}
}

/**
 * Populate camera sources drop down
 */

getVideoSources(function(cameras){
	var ddl = $('select');
//	if(cameras.length == 1) {
//		// if only 1 camera is found drop down can be disabled
//		ddl.disabled = true;
////		console.log("Only one camera");
//	}

	cameras.forEach(function(camera){
		$('<option>').val(camera.id).text(camera.label).appendTo(ddl);
		
	});   
}); 

/**
 * This retrieves video sources and passes them to callback parameter
 */

function getVideoSources(callback) {
	var videoSources = [];
	callback = callback || function(){};

	MediaStreamTrack.getSources(function(sources){
		sources.forEach(function(source,index){
			if(source.kind === 'video') {
				// we only need to enlist video sources
				videoSources.push({
					id: source.id,
					label: source.label || 'Camera '+(videoSources.length+1)
				});  
			}
		});

		callback(videoSources);
	});
}

$(function() {
	$('#camBtn').on('click', function(){
		// camera is active, stop stream
		if(curStream && curStream.active) {
			curStream.stop();
			$('video').src = "";
		}
		else {
			getCamera();
		}
	});

	/**
 * Change stream source according to dropdown selection
 */
	$('select').on('change',function() {
		if(curStream && curStream.active) {
			getCamera();
		}
	});
});