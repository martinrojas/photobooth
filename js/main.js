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
	if(cameras.length == 1) {
		// if only 1 camera is found drop down can be disabled
		ddl.disabled = true;
		//		console.log("Only one camera");
	}

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

function getAccounts(){
	var Login = Parse.Object.extend("logins");
	var accountsQuery = new Parse.Query(Login);
	accountsQuery.find({
		success:function(results) {
			console.log("Total: "+results.length);
//			results[1].attributes.name
		},
		error:function(error) {
			alert("Error when getting objects!");
		}
	});

}

$(function() {
	Parse.initialize("PqtPwDU77RRbNK7xAKJ3RCWAWwaYrkolbTsi7AmY", "2ZWBzjdCeyD64Dlnwkx3f4UlfOTth5hMc0ZY43EZ");

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

	$('#snapBtn').on('click', function(){
		var canvas = document.getElementById("snapShot").getContext("2d");
		var video = document.getElementById("feed");
		canvas.drawImage(video, 0, 0, 1280, 720, 0, 0, 640, 360);
		canvas.globalCompositeOperation="source-over";
		canvas.drawImage(document.getElementById("logo"),30,20,220,26);

		//		var img = canvas.toDataURL("image/png");
		//		document.getElementById('snapShot').src = img;
		$('#pictureTaken').openModal();

	});

	/**
 * Change stream source according to dropdown selection
 */
	$('#camSelect').on('change',function() {
		if(curStream && curStream.active) {
			getCamera();
		}
	});

	$('.modal-trigger').leanModal();

	getCamera();
	getAccounts();
});