//priyankakushwaha533@gmail.com

var socket = io("/");
const videoBox = document.getElementById("video-box");
const myVideo = document.createElement("video");
let textMessage = document.querySelector("#type_here_box");
let sendButton = document.getElementById("send_button");
let sentMessages = document.querySelector(".sent_messages_box");
const inviteButton = document.querySelector("#invite_button");
const micButton = document.querySelector("#mic_button");
const videoButton = document.querySelector("#video_button");
const leaveButton = document.querySelector("#leave_button");
const screenShareButton = document.querySelector('#screenshare_button');
const video = document.getElementsByTagName('video');

///////////////////////////////////////////////////////////////////////////////////

myVideo.muted = true;
const peersConnected = {}
const user = prompt("Enter your name for this meet");
var currentPeer;
var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443"
});

let my_videoStream;
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {
    my_videoStream = stream;
    add_videoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (user_videoStream) => {
        add_videoStream(video, user_videoStream);
        currentPeer = call.peerConnection
      });
    });

/////////////////////////////////////////////////////////////////////////////

    socket.on("user-connected", (userId) => {
      setTimeout(()=>{
        connect_NewUser(userId, stream)
      },50)
      })
      
    });

////////////////////////////////////////////////////////////////////////////////

peer.on("open", (id) => {
  socket.emit("join-room", Room_Id, id, user);
});

///////////////////////////////////////////////////////////////////////////////

socket.on('user-disconnected', userId => {
  if (peersConnected[userId]) 
  peersConnected[userId].close()
});

///////////////////////////////////////////////////////////////////////////////

socket.on("createMessage", (message, userName) => {
  sentMessages.innerHTML =
  sentMessages.innerHTML+
    `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${
          userName === user ? "me" : userName
        }</span> </b>
        <span>${message}</span>
    </div>`;
});

//////////////////////////////////////////////////////////////////////////////

const connect_NewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (user_videoStream) => {
    add_videoStream(video, user_videoStream);
    currentPeer=call.peerConnection
  });
  call.on('close',() => {
    video.remove()
  })
  peersConnected[userId] = call
};

////////////////////////////////////////////////////////////////////////////////

const add_videoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    videoBox.append(video);
    video.classList.add("border_background")
  });
};

///////////////////////////////////////////////////////////////////////////////

sendButton.addEventListener("click", (e) => {
  if (textMessage.value.length !== 0) {
    socket.emit("message", textMessage.value);
    textMessage.value = "";
  }
});

//////////////////////////////////////////////////////////////////////////////

textMessage.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && textMessage.value.length !== 0) {
    socket.emit("message", textMessage.value);
    textMessage.value = "";
  }
});

///////////////////////////////////////////////////////////////////////////////

micButton.addEventListener("click", () => {
  const enabled = my_videoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    my_videoStream.getAudioTracks()[0].enabled = false;
    html = `<i class="fas fa-microphone-slash"></i>`;
    micButton.classList.toggle("background__red");
    micButton.innerHTML = html;
  } else {
    my_videoStream.getAudioTracks()[0].enabled = true;
    html = `<i class="fas fa-microphone"></i>`;
    micButton.classList.toggle("background__red");
    micButton.innerHTML = html;
  }
});

//////////////////////////////////////////////////////////////////////////////

videoButton.addEventListener("click", () => {
  const enabled = my_videoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    my_videoStream.getVideoTracks()[0].enabled = false;
    html = `<i class="fas fa-video-slash"></i>`;
    videoButton.classList.toggle("background__red");
    videoButton.innerHTML = html;
  }
  else {
    my_videoStream.getVideoTracks()[0].enabled = true;
    html = `<i class="fas fa-video"></i>`;
    videoButton.classList.toggle("background__red");
    videoButton.innerHTML = html;
  }
});

///////////////////////////////////////////////////////////////////////////////

screenShareButton.addEventListener("click", () => {
  screenShareButton.classList.add("background__orange");
         navigator.mediaDevices.getDisplayMedia( {
            video: {
                cursor: "none"
                
            },
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
            }
        } ).then((stream) => {
          let videoTrack = stream.getVideoTracks()[0];
          videoTrack.onended = function(){
            stopScreenShare();
          }
          let sender = currentPeer.getSenders().find(function(s){
            return s.track.kind == videoTrack.kind;
          })
          sender.replaceTrack(videoTrack)
        }).catch((err)=>{
             console.log("--------error----------"+err)
        })
  });

////////////////////////////////////////////////////////////////////////////

  myVideo.addEventListener("dblclick",function(){
    if(myVideo.requestFullScreen){
      myVideo.requestFullScreen();
    } 
    else if(myVideo.webkitRequestFullScreen){
      myVideo.webkitRequestFullScreen();
    } 
    else if(myVideo.mozRequestFullScreen){
      myVideo.mozRequestFullScreen();
    }
  })

//////////////////////////////////////////////////////////////////////////////

  function stopScreenShare(){
    let videoTrack = my_videoStream.getVideoTracks()[0];
    var sender = currentPeer.getSenders().find(function(s){
      return s.track.kind == videoTrack.kind;
    })  
    sender.replaceTrack(videoTrack)
    screenShareButton.classList.remove("background__orange");
  }

/////////////////////////////////////////////////////////////////////////////

inviteButton.addEventListener("click", (e) => {
  prompt(
    "Copy this link and send it to people you want to add",
    window.location.href
  );
});

/////////////////////////////////////////////////////////////////////////////
 
leaveButton.addEventListener("click",() => {
  navigator.mediaDevices.getUserMedia({video: true, audio: false})
  .then(mediaStream => {
    const stream = mediaStream;
    const tracks = stream.getTracks();
    tracks[0].stop;
  })
  
});






