const intent = require('../intent.json');
const content = require('../content.json');
const dialogflow = require('dialogflow');
const uuid = require('uuid');
const path = require('path');


function check_intent(message){
    let intent_list = intent.Intents;
    for(let data of intent_list){
        if(data.input_query === message){
            return data.intent_name;
        }
    }
    return 'None_None';
}

function getBotMessage(intent){
    let msg = content.message;
    for(let data of msg){
        console.log('data: ', data);
        console.log('Object.keys(data)', Object.keys(data)[0]);
        if(Object.keys(data)[0] === intent){
            return data[intent];
        }
    }

    return 'I did not quite get you. Anything else I can help with ?';
}

async function getIntentDetailsFromDF(query,projectId = 'echoservice-edde5') {

    return new Promise(async (resolve, reject)=>{
        // A unique identifier for the given session
    const sessionId = uuid.v4();

    console.log('Session ID:', sessionId);
   
    // Create a new session
    const sessionClient = new dialogflow.SessionsClient({
        keyFilename: "./echoservice-edde5-ad4f4ce50083.json" 
        });
    const sessionPath = sessionClient.sessionPath(projectId, sessionId);
   
    // The text query request.
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          // The query to send to the dialogflow agent
          text: query,
          // The language used by the client (en-US)
          languageCode: 'en-US',
        },
      },
    };
   
    // Send request and log result
    const responses = await sessionClient.detectIntent(request);
    console.log('Detected intent');
    const result = responses[0].queryResult;
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    if (result.intent) {
      console.log(`  Intent: ${result.intent.displayName}`);
      if(result.intent.displayName){
        resolve([result.intent.displayName, result.fulfillmentText]);
      }else{
        resolve(['None_None','I did not get you, Please ask queries related to your account'])
      }
      
    } else {
      console.log(`  No intent matched.`);
    }
    })
    
  }



module.exports={
    check_intent,
    getBotMessage,
    getIntentDetailsFromDF
}