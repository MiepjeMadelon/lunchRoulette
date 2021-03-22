const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
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
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('oldMessages', (listOfMessages, userID) => {
  for (var i = 0; i < listOfMessages.length; i++) {
    date = listOfMessages[i].createdAt;
    uname = listOfMessages[i].username;
    message = listOfMessages[i].message;
    ownMessage = false;
    if (userID == listOfMessages[i].userId ) {
      ownMessage = true;
    }
    msg = {
      username: uname,
      msg: message,
      time: date
    };
    makeMessage(msg, ownMessage);
  }
  console.log(listOfMessages);
})

socket.on('message', (formattedMessage, ownMessage) => {
  makeMessage(formattedMessage, ownMessage);
  console.log('formattedMessage');
})

//green: #AAFD32
//blue: #1CAAFC
//purple: #AA25FC
//pink:#FD1BAA
//orange: #FEAA29
function makeMessage(message, ownMessage) {
  const div = document.createElement('div');
  if (ownMessage) {
    div.classList.add('own-message');
  }
  var x = Math.floor((Math.random() * 4) + 1);
  div.classList.add(`message${x}`);
  div.classList.add('message');
  const p = document.createElement('h4');
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
