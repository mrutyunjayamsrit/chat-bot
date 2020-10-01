const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const path = require('path');
const config = require('config');
const {createSocketConnection, currentUser} = require('./socketio');

const {
  getCompletedUserdeatils,
  getDisconnectedUserDetails,
  getTotalUsersVisitedBot
} = require('./utils/dataStore');

const db = require('./database/db');
const {MongoURL} = config;

// Database functions
const {removeDocument} = db;

const PORT = process.env.PORT || 3030;

const app = express();

const server = app.listen(PORT,()=>{
    console.log(`Server is listening on Port ${PORT}`);
});

// For reading static HTML files
app.use(express.static(path.join(__dirname,"public")));

// For parsing the post request body and get requests 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// To authenticate all the API's
app.use('/',(req,res,next)=>{
  const token = config.token;
  const userToken = req.query.token;
  if(token === userToken){
    next();
  }else{
    res.status(401);
    res.send('Authentication Failed!');
  }
})

app.get('/',(req,res)=>{
  res.sendFile('index.html', { root: __dirname });
});

let sess = uuid.v4();

// To create a session
app.use(session({
  store: new MongoStore({
    url: `${MongoURL}chat-session`
    }),
  secret: sess,
  resave: false,
  saveUninitialized: true
}));


createSocketConnection(server);

// Api to get current user details
app.get('/currentUser',(req, res)=>{
  let session = req.session;
  req.session.user = userConnected;
  res.send(currentUser);
});

// API to get total number of users taken chat
app.get('/totalUsers',async (req, res)=>{
  const userVisitedBot = await getTotalUsersVisitedBot();
  res.send(userVisitedBot);
});

// API to get total number users who completed chat
app.get('/completedUser',async (req, res)=>{
  const comletedUsers = await getCompletedUserdeatils();
  res.send(comletedUsers);
});

// API to get disconnected users
app.get('/disconnectedUser',async (req, res)=>{
  const disconnectedUsers = await getDisconnectedUserDetails();
  res.send(disconnectedUsers);
});

// API to delete the existing records from DB
app.get('/deleteData', async(req,res)=>{
  const collection = req.query.col;
  console.log('collection: ', collection);
  const query = {}
  const deleteItem = await removeDocument(query, collection);
  res.send(`Successfully deleted data ${deleteItem}`);
})
