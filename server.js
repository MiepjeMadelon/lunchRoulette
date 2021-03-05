const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");
const session = require('express-session');
const { ExpressOIDC } = require('@okta/oidc-middleware');
require('dotenv').config();

const oidc = new ExpressOIDC({
  appBaseUrl: process.env.APP_BASE_URL,
  issuer: process.env.ISSUER,
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  loginRedirectUri: 'http://localhost:3000/authorization-code/callback',
  logoutRedirectUri: 'http://localhost:3000/logged_out', //post_logout_redirect_uri or logoutRedirectUri
  scope: 'openid profile'
});

// session support is required to use ExpressOIDC
app.use(session({
  secret: process.env.CLIENT_SECRET,
  resave: true,
  saveUninitialized: false
}));
// ExpressOIDC attaches handlers for the /login and /authorization-code/callback routes
app.use(oidc.router);
app.all('*', oidc.ensureAuthenticated()); //should be after app.use, appearently the order does matter
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get('/room', (req, res) => {
  res.redirect(`/room${uuidV4()}`);

});

app.get('/', (req, res) => {
  res.render('button');
});

app.get('/room:room', (req,res) => {
  res.render('room', { roomId: req.params.room });

});


io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    console.log(roomId, userId);
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId);
    })
  });
});


server.listen(3000);
