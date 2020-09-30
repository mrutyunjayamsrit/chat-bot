const utils = require('./utils');
const db = require('../database/db');


// Database functions
const {findDocuments, insertDocuments, updateDocument} = db;


function saveConnectedUsers(user, sessionId){
    let collection = 'Users';
    let query = [{
      user: user,
      sessionId: sessionId,
      status:'started'
    }];
    if(user){
        insertDocuments(query, collection);
    }
    console.log('user: ', user);
}

function saveDisconnectedUsers(user){
    let collection = 'Users';
    if(user){
        let query1 = {user:user};
        let query2 = {$set: {status:'disconnect'}};
        updateDocument(query1,query2, collection);
    }
}

function saveCompletedUsers(user){
    let collection = 'Users';
    if(user){
        let query1 = {user:user};
        let query2 = {$set: {status:'completed'}};
        updateDocument(query1,query2, collection);
    }
}

function saveUserInputMessage(user, userQuery, sessionId){
    let collection = 'UserData';
    let query = [{
        sessionId: sessionId,
        user: user,
        userQuery: userQuery
      }];
      if(user){
        insertDocuments(query, collection);
    }
}

function updateUserInputMessage(user, userQuery){
    let collection = 'UserData';
    let query1 = {'user':user};
    let query2 = {$set: {'userQuery':userQuery}};
    updateDocument(query1,query2, collection);
}

function saveIntentVisited(user, intents, sessionId){
    // store intents in db
    let collection = 'Intent';
    let query2 = [{
      sessionId: sessionId,
      user: user,
      intentVisited: intents
    }];
    
    insertDocuments(query2, collection);
}

function updateIntentVisited(user, intents, sessionId){
    // store intents in db
    let collection = 'Intent';
    let query1 = {'user':user};
    let query2 = {$set: {'intentVisited':intents}};
    updateDocument(query1,query2, collection);
}

async function getTotalUsersVisitedBot(){
    const collection = 'Users';
    const query = {};
    const query2 = {user: 1,_id: 0};
    const totalUsers = await findDocuments(query, query2,collection);
    console.log('Total Users: ', totalUsers);
    return totalUsers.length;
}

async function getCompletedUserdeatils(){
    let users = [];
    let completedUserCount = 0;

    // get all users visited

    const collection = 'Users';
    const query = {};
    const query2 = {user: 1,_id: 0};
    const allUsers = await findDocuments(query, query2,collection);

    const collection1 = "Intent";
    //let query = {};
    const totalUsers = await findDocuments(query, '',collection1);
    for(let user of totalUsers){
        let intents = user.intentVisited;
        if(intents.includes('no_thanks')){
            completedUserCount++;
            users.push(user.user);
        }
    }

    let completeEngagementRate  = (completedUserCount/allUsers.length)*100;

    return {
        journeyCompletedUsers: completedUserCount,
        user: users,
        completeEngagementRate: `${completeEngagementRate}%` 
      }
}

async function getDisconnectedUserDetails(){
    let users = [];
    let disconnectedUserCount = 0;

    // get all users visited

    const collection = 'Users';
    const query = {};
    const query2 = {user: 1,_id: 0};
    const allUsers = await findDocuments(query, query2,collection);

    const collection1 = "Intent";
    //let query = {};
    const totalUsers = await findDocuments(query, '',collection1);
    for(let user of totalUsers){
        let intents = user.intentVisited;
        if(!intents.includes('no_thanks')){
            disconnectedUserCount++;
            users.push(user.user);
        }
    }
    let disconnectedRate  = (disconnectedUserCount/allUsers.length)*100;
    return {
        journeyDisconnectedUsers: disconnectedUserCount,
        user: users,
        disconnectedRate: `${disconnectedRate}%` 
      }
}


module.exports = {
    saveConnectedUsers,
    saveDisconnectedUsers,
    saveUserInputMessage,
    updateUserInputMessage,
    saveIntentVisited,
    updateIntentVisited,
    getTotalUsersVisitedBot,
    saveCompletedUsers,
    getCompletedUserdeatils,
    getDisconnectedUserDetails
}