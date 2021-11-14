// Handle errors.
let handleError = function(err){
    console.log("Error: ", err);
};

// Query the container to which the remote stream belong.
let remoteContainer = document.getElementById("remote-container");

// Add video streams to the container.
function addVideoStream(elementId){
    // Creates a new div for every stream
    let streamDiv = document.createElement("div");
    // Assigns the elementId to the div.
    streamDiv.id = elementId;
    // Takes care of the lateral inversion
    streamDiv.style.transform = "rotateY(180deg)";
    // Adds the div to the container.
    remoteContainer.appendChild(streamDiv);
};

// Remove the video stream from the container.
function removeVideoStream(elementId) {
    let remoteDiv = document.getElementById(elementId);
    if (remoteDiv) remoteDiv.parentNode.removeChild(remoteDiv);
};


let client = AgoraRTC.createClient({
    mode: "rtc",
    codec: "vp8",
});

client.init("7bdb68aad9d24e18bb6a44c87f20918e", function() {
    console.log("client initialized");
}, function(err) {
    console.log("client init failed ", err);
});

// Join a channel
client.join(null, "myChannel", null, (uid)=>{
    
    let localStream = AgoraRTC.createStream({
        audio: true,
        video: true,
    });
    // Initialize the local stream
    localStream.init(()=>{
        // Play the local stream
        localStream.play("me");
        // Publish the local stream
        client.publish(localStream, handleError);
    }, handleError);

  }, handleError);


  // Subscribe to the remote stream when it is published
client.on("stream-added", function(evt){
    client.subscribe(evt.stream, handleError);
});
// Play the remote stream when it is subsribed
client.on("stream-subscribed", function(evt){
    let stream = evt.stream;
    let streamId = String(stream.getId());
    addVideoStream(streamId);
    stream.play(streamId);
});


// Remove the corresponding view when a remote user unpublishes.
client.on("stream-removed", function(evt){
    let stream = evt.stream;
    let streamId = String(stream.getId());
    stream.close();
    removeVideoStream(streamId);
});
// Remove the corresponding view when a remote user leaves the channel.
client.on("peer-leave", function(evt){
    let stream = evt.stream;
    let streamId = String(stream.getId());
    stream.close();
    removeVideoStream(streamId);
});







client.on('stream-subscribed', function (evt) {
    console.log("Subscribe remote stream successfully: " + evt.stream.getId());
  });
  
  // remove the remote-container when a user leaves the channel
  client.on("peer-leave", function(evt) {
    console.log("Remote stream: " + evt.stream.getId() + "has left");
  });
  
  // show mute icon whenever a remote has muted their mic
  client.on("mute-audio", function (evt) {
    console.log("Remote stream: " +  evt.uid + "has muted audio");
  });
  
  client.on("unmute-audio", function (evt) {
    console.log("Remote stream: " +  evt.uid + "has muted audio");
  });
  
  // show user icon whenever a remote has disabled their video
  client.on("mute-video", function (evt) {
    console.log("Remote stream: " +  evt.uid + "has muted video");
  });
  
  client.on("unmute-video", function (evt) {
    console.log("Remote stream: " +  evt.uid + "has un-muted video");
  });

// video streams for channel
function createCameraStream(uid) {
    var localStream = AgoraRTC.createStream({
      streamID: uid,
      audio: true,
      video: true,
      screen: false
    });
    localStream.setVideoProfile(cameraVideoProfile);
    localStream.init(function() {
      console.log("getUserMedia successfully");
      // TODO: add check for other streams. play local stream full size if alone in channel
      localStream.play('local-video'); // play the given stream within the local-video div
      // publish local stream
      client.publish(localStream, function (err) {
        console.log("[ERROR] : publish local stream error: " + err);
      });
    
      enableUiControls(localStream); // move after testing
      localStreams.camera.stream = localStream; // keep track of the camera stream for later
    }, function (err) {
      console.log("[ERROR] : getUserMedia failed", err);
    });
  }
  
  function leaveChannel() {
    client.leave(function() {
      console.log("client leaves channel");
    }, function(err) {
      console.log("client leave failed ", err); //error handling
    });
  }
    