const chatForm = document.getElementById('chat-form');
const socket = io('/');

socket.emit('join-chat', CHAT_ID, USERNAME, USERID);

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let msg = e.target.elements.msg.value;
  msg = msg.trim();
  if (!msg) {
    return false;
  }
  socket.emit('chatMessage', msg, CHAT_ID, USERNAME, USERID);
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

socket.on('oldMessages', listOfMessages => {
  for (var i = 0; i < listOfMessages.length; i++) {
    date = listOfMessages[i].createdAt;
    uname = listOfMessages[i].username;
    message = listOfMessages[i].message;
    msg = {
      username: uname,
      msg: message,
      time: date
    };
    makeMessage(msg);
  }
  console.log(listOfMessages);
})

socket.on('message', formattedMessage => {
  makeMessage(formattedMessage);
  console.log('formattedMessage');
})


function makeMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.msg;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}
