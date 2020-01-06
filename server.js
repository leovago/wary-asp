'use strict';

const express     = require('express');
const session     = require('express-session');
const bodyParser  = require('body-parser');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');
const auth        = require('./app/auth.js');
const routes      = require('./app/routes.js');
const mongo       = require('mongodb').MongoClient;
const passport    = require('passport');
const cookieParser= require('cookie-parser')
const app         = express();
const http        = require('http').Server(app);
const sessionStore= new session.MemoryStore();
const io = require('socket.io')(http);
const passportSocketIo = require('passport.socketio');
const cors = require('cors');

console.clear();
console.log('esto empieza aqui');

app.use(cors());

fccTesting(app); //For FCC testing purposes

app.use('/public', express.static(process.cwd() + '/public'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'pug')

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  key: 'express.sid',
  store: sessionStore,
}));


mongo.connect(process.env.DATABASE, {useNewUrlParser: true, useUnifiedTopology: true}, (err, connection) => {
    if(err) console.log('Database error: ' + err);
  
    console.log('Successful database connection');
    
    const db = connection.db();
  
    auth(app, db);
    routes(app, db);
      
    http.listen(process.env.PORT || 3000);

  
    //start socket.io code  
    io.use(passportSocketIo.authorize({
      cookieParser: cookieParser,
      secret: process.env.SESSION_SECRET,
      key: 'express.sid',
      store: sessionStore
    }));
  
  
  
    let currentUsers = 0;
    io.on('connection', socket => {
      console.log('A user has connected');
      console.log(`User ${socket.request.user.name} connected`);
      ++currentUsers;
      io.emit('user count', currentUsers);
      io.emit('user', {name: socket.request.user.name, currentUsers, currentUsers, connected: true});
      
      socket.on('disconnect', () => {
        console.log("User has disconnected");
        --currentUsers;
        io.emit('user count', currentUsers);
        io.emit('user', {name: socket.request.user.name, currentUsers, currentUsers, connected: false});
      });
      
      socket.on('chat message', function(message){
        console.log(message);
        io.emit('chat message', {name: socket.request.user.name, message: message});
      });
  
      
    });
  
  

    //end socket.io code
  
  
});
