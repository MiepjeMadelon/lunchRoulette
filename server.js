const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");
const session = require('express-session');
const { ExpressOIDC } = require('@okta/oidc-middleware');
const {Message, formatMessage, saveMessage} = require('./utils/messages');
require('dotenv').config();
const botName = "Chat Bot";
const oidc = new ExpressOIDC({
  appBaseUrl: process.env.APP_BASE_URL,
  issuer: process.env.ISSUER,
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  loginRedirectUri: 'http://localhost:3000/authorization-code/callback',
  logoutRedirectUri: 'http://localhost:3000/logged_out',
  scope: 'openid profile'
});
const mongoose = require('mongoose'); //warning save to ignore: https://developer.mongodb.com/community/forums/t/warning-accessing-non-existent-property-mongoerror-of-module-exports-inside-circular-dependency/15411


const dbURI  = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@companypub.xsm4m.mongodb.net/company-pub?retryWrites=true&w=majority`;
mongoose
.connect(dbURI, {
useUnifiedTopology: true,
useNewUrlParser: true,
})
.then(() => {
  oidc.on('ready', () => {
    server.listen(3000);
  });
})
.catch(err => {
console.log(`DB Connection Error: ${err.message}`);
}); //warning save to ignore: https://developer.mongodb.com/community/forums/t/node-44612-deprecationwarning-listening-to-events-on-the-db-class-has-been-deprecated-and-will-be-removed-in-the-next-major-version/15849

// session support is required to use ExpressOIDC
app.use(session({
  secret: process.env.CLIENT_SECRET,
  resave: true,
  saveUninitialized: false
}));
// ExpressOIDC attaches handlers for the /login and /authorization-code/callback routes
app.use(oidc.router);
app.all('*', oidc.ensureAuthenticated()); //should be after app.use, appearently the order does matter //res.send(JSON.stringify(req.userContext.userinfo));
//{"sub":"00u9w07mybIvtPAWz5d6","name":"Madelon Bernardy","locale":"en-US","preferred_username":"madelon.bernardy@live.nl","given_name":"Madelon","family_name":"Bernardy","zoneinfo":"America/Los_Angeles","updated_at":1614897682}
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get('/room', (req, res) => {
  res.redirect(`/room${uuidV4()}`);
});

app.get('/', (req, res) => {
  if (req.userContext.userinfo) {
    res.redirect(`/home${req.userContext.userinfo.name}${req.userContext.userinfo.sub}`);
  } else {
    res.send('Please Sign In');
  }
});
app.get('/home:username:uid', (req,res) => {
  res.render('home', { username: req.userContext.userinfo.name, uid: req.userContext.userinfo.sub });
});

app.get('/logout', function(req, res, next) {
    req.logout();
    return res.redirect('/logged_out');
});
app.get('/logged_out', (req, res) => {
  res.redirect('/');
});

app.get('/room:room', (req,res) => {
  res.render('room', { roomId: req.params.room, username: req.userContext.userinfo.name, uid: req.userContext.userinfo.sub });

});

app.get('/general', (req, res) => {
  res.render('chat', {username: req.userContext.userinfo.name, uid: req.userContext.userinfo.sub, chatId: "general10"}) //should be general + companyId
});
app.get('/memes', (req, res) => {
  res.render('chat', {username: req.userContext.userinfo.name, uid: req.userContext.userinfo.sub, chatId: "memes10"}) //should be general + companyId
});

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    console.log(roomId, userId);
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId);
    });
  });

  socket.on('join-chat', (chatId, username, userId) => {
    console.log(chatId, username, userId);
    socket.join(chatId);

  });
  socket.on('chatMessage', (msg, chatId, username, userId) => {
    io.to(chatId).emit('message', formatMessage(username, msg));
    saveMessage(username, userId, msg, chatId);
  });
});
