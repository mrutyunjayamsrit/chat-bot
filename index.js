const express = require('express');
const socket = require('socket.io');
const dialogflow = require('dialogflow');
const uuid = require('uuid');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session)

const utils = require('./utils/utils');
const db = require('./database/db');

// Database functions
const {findDocuments, removeDocument, insertDocuments, updateDocument} = db;
const sessionId = uuid.v4();

//console.log(sessionId);

let userConnected = '';

// flag to insert and update
let isDataInserted = false;
let userQuery = [];

const PORT = 3030;

const app = express();

const server = app.listen(PORT,()=>{
    console.log(`Server is listening on Port ${PORT}`);
});

// For reading static HTML files
app.use(express.static('public'));

// To create a session
app.use(session({
  store: new MongoStore({
    url: 'mongodb://localhost:27017/chat-session'
    }),
  secret: sessionId,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}));

const io = socket(server);

const activeUsers = new Set();

io.on("connection",(socket)=>{
    console.log("socket connected successfully");

    socket.on("new user", function (data) {
        socket.userId = data;
        activeUsers.add(data);
        console.log('User Connected: ',activeUsers);
        userConnected = socket.userId;

        // Store number of users who communicated with bot
        let collection = 'Users';
        let query = [{
          user: userConnected,
          sessionId: sessionId
        }];
        insertDocuments(query, collection);
        console.log('user: ', userConnected);
        io.emit("new user", [...activeUsers]);
      });
    
      socket.on("disconnect", () => {
        console.log('User disconnected: ', socket.userId);
        let query = [{
          user: socket.userId,
          sessionId: sessionId,
          status: 'disconnect'
        }];
        let collection = 'Users';
        insertDocuments(query, collection);
        activeUsers.delete(socket.userId);
        io.emit("user disconnected", socket.userId);
      });
    
      socket.on("chat message", async function (data) {
        
          console.log('Chat Data:', data)
          io.emit("chat message", data);

          // Store User queries
          userQuery.push(data.message);
          let query = [{
            sessionId: sessionId,
            user: userConnected,
            userQuery: userQuery
          }];

          let collection = 'UserData';
          if(!isDataInserted){
            insertDocuments(query, collection);
          }else{
            let query1 = {'user':userConnected};
            let query2 = {$set: {'userQuery':userQuery}};
            updateDocument(query1,query2, collection);
          }
          

          // get intent deatils and response
          const intent = utils.check_intent(data.message);
          console.log("Intent name: ", intent);

          // store intents in db
          let query2 = [{
            sessionId: sessionId,
            user: userConnected,
            intentVisited: intent
          }];
          collection = 'Intent';
          insertDocuments(query2, collection);

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

// Api to get 
app.get('/currentUser',(req, res)=>{
  let session = req.session;
  req.session.user = userConnected;
  res.send({
    sessionId: sessionId,
    user: req.session.user
  })
});

app.get('/totalUsers',async (req, res)=>{
  const collection = 'Users';
  const query = {};
  const query2 = {user: 1,_id: 0};
  const totalUsers = await findDocuments(query, query2,collection);
  console.log('Total Users: ', totalUsers);
  res.send({
    totalUsers: totalUsers.length,
    user: totalUsers
  });
});

app.get('/completedUser',async (req, res)=>{
  let collection = "Intent";
  let query = {intentVisited:'no_thanks'};
  const totalUsers = await findDocuments(query, '',collection);
  res.send({
    Count: totalUsers.length,
    user: totalUsers 
  });
});

app.get('/disconnectedUser',async (req, res)=>{
  let collection = "Users";
  let query = {status:'disconnect'};
  let query2 = {"user": {$ne:null}}
  const totalUsers = await findDocuments(query, query2,collection);
  res.send({
    Count: totalUsers.length,
    user: totalUsers
  });
});
