const moment = require('moment');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  chatId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
}, {timestamps: true});

const Message = mongoose.model('message', messageSchema);


function formatMessage(username, msg) {
  return {
    username,
    msg,
    time: moment().format('h:mm a')
  };
}

function saveMessage(uname, uID, msg, chatID) {
  const message = new Message({
    username: uname,
    userId: uID,
    chatId: chatID,
    message: msg
  });

  message.save()
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
    });
}

module.exports = {Message, formatMessage, saveMessage};
