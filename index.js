const express = require('express');
const bodyParser = require('body-parser');
const socket = require('socket.io');
const uuid = require('uuid');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const path = require('path');
const config = require('config');
const utils = require('./utils/utils');

const {
  saveConnectedUsers,
  saveDisconnectedUsers,
  saveUserInputMessage,
  updateUserInputMessage,
  saveIntentVisited,
  updateIntentVisited,
  getCompletedUserdeatils,
  getDisconnectedUserDetails
} = require('./utils/dataStore');

const db = require('./database/db');
const {MongoURL} = config;

// Database functions
const {findDocuments, insertDocuments, updateDocument, removeDocument} = db;
let sessionId = '';

//console.log(sessionId);

let userConnected = '';

// flag to insert and update
let isDataInserted = false;
let isIntentVisited = false;
let intents = [];
let userQuery = [];

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

const io = socket(server);

const activeUsers = new Set();

io.on("connection",(socket)=>{
    console.log("socket connected successfully");

    // New User event
    socket.on("new user", function (data) {
        socket.userId = data;
        activeUsers.add(data);
        userConnected = socket.userId;
        sessionId = uuid.v4();
        // Store number of users who communicated with bot
        saveConnectedUsers(userConnected,sessionId);
        isDataInserted = false;
        isIntentVisited = false;
        intents = [];
        userQuery = [];
        io.emit("new user", [...activeUsers]);
      });
      
      // diconnect event
      socket.on("disconnect", () => {
        console.log('User disconnected: ', socket.userId);
        saveDisconnectedUsers(socket.userId, sessionId);  
        activeUsers.delete(socket.userId);
        io.emit("user disconnected", socket.userId);
      });
    
      // chat message event
      socket.on("chat message", async function (data) {
          console.log('Chat Data:', data)
          io.emit("chat message", data);

          // Store User queries
          userQuery.push(data.message);
          if(!isDataInserted){
            saveUserInputMessage(userConnected, userQuery, sessionId);
            isDataInserted = true;
          }else{
            updateUserInputMessage(userConnected,userQuery);
          }
          // get intent deatils and response
          const intent = utils.check_intent(data.message);
          //const intentDetails = await utils.getIntentDetailsFromDF(data.message);
          //const [intent, bot_message] = intentDetails;
          console.log("Intent name: ", intent);
          intents.push(intent);
         if(!isIntentVisited){
           saveIntentVisited(userConnected, intents,sessionId);
           isIntentVisited = true;
         }else{
           updateIntentVisited(userConnected, intents);
         }
          // get Bot reply message
          const bot_message = utils.getBotMessage(intent); 
          console.log('Bot Message:', bot_message);
          data.message = bot_message;
          data.nick = 'FinBot';
          io.emit("chat message", data);
      });
      
      socket.on("typing", function (data) {
        socket.broadcast.emit("typing", data);
      });
})

// Api to get current user details
app.get('/currentUser',(req, res)=>{
  let session = req.session;
  req.session.user = userConnected;
  res.send({
    sessionId: sessionId,
    user: req.session.user
  })
});

// API to get total number of users taken chat
app.get('/totalUsers',async (req, res)=>{
  const userVisitedBot = await getTotalUsersVisitedBot();
  res.send({
    NumberOfuserVisitedBot: userVisitedBot
  });
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

app.get('/deleteData', async(req,res)=>{
  const collection = req.query.col;
  console.log('collection: ', collection);
  const query = {}
  const deleteItem = await removeDocument(query, collection);
  res.send(`Successfully deleted data ${deleteItem}`);
})
