const socket = io('/');
const myPeer = new Peer(undefined, {
  host: '/',
  port:'3001'
});
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then( stream => {

})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
});
socket.on('user-connected', userId => {
  console.log("user connected! " + userId);
});

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener = 
}
