const socket = require('socket.io');
const uuid = require('uuid');
const utils = require('./utils/utils')

// flag to insert and update
let isDataInserted = false;
let isIntentVisited = false;
let intents = [];
let userQuery = [];

let sessionId = '';
let userConnected = '';
let currentUser = {};

const {
  saveConnectedUsers,
  saveDisconnectedUsers,
  saveUserInputMessage,
  updateUserInputMessage,
  saveIntentVisited,
  updateIntentVisited,
  getCompletedUserdeatils,
  getDisconnectedUserDetails,
  getTotalUsersVisitedBot
} = require('./utils/dataStore');

function createSocketConnection(server){
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
            currentUser.user =  userConnected;
            currentUser.sessionId = sessionId;
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
    });
}


module.exports = {
    createSocketConnection,
    currentUser
}