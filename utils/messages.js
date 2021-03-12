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

function findOldMessages(chatID) {
  Message.find({ chatId: chatID}).lean().exec(function (err, docs) {
      if (err){
          console.log('an error has occured' + err);
      }
      else{
          documents = docs;
          console.log(docs);
          return documents;
      }
    });
}


function formatOldMessage(uname, message, date) {
  return {
    username: uname,
    msg: message,
    time: date
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

module.exports = {Message, formatMessage, saveMessage, findOldMessages};
