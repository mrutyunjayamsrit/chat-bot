# chat-bot
fin service chat bot

Financial chat bot application:-

Component Used:
1) DataBase - mongo DB
2) NL training - google dialog flow / or json files with intent details
3) Platform - Node JS/ express
4) session storage - connect mongo

To start project run command:- npm start

Entire Transcript for the conversation with FinBot:-
User: Hello
FinBot: How are you doing ?  How can I Help you ?
User: I want to check my balance
FinBot: You have Rs 200 \n Anything else I can help with ?
User: No thanks
FinBot: Awesome Happy to assist, Good bye

# Following DB and collections are created in Mongo DB :

1) DB - chat-session :
   collection - sessions
   ex: {"cookie":{"originalMaxAge":60000,"expires":"2020-09-28T03:32:21.340Z","httpOnly":true,"path":"/"},"user":"User828059"}

2) DB - chatApp :
    collections:
    1) Users - to store the user details such as user ID and status of the disconnected users
        ex:- {"_id":{"$oid":"5f707a1cc3505a28d4f758eb"},"user":"User38083","sessionId":"1f621137-9a55-4132-b8ba-207e558c1bbc"}

        {"_id":{"$oid":"5f70df1d1da2d12e4057b137"},"user":"User175551","sessionId":"6e2e5991-edc7-4dc1-91f9-a1101485736d","status":"disconnect"}

    2) UserData - This collection stores the details about user input/queries to bot.
        ex:- {"_id":{"$oid":"5f70cd3c2c2bf44c6cc7abaf"},"sessionId":"71c240cb-a7e8-48a3-816c-d9e902f8fe89","user":"User156407","userQuery":["Hello","I want to check my balance"]}

    3) Intent - this collection stores the details on intents visited by the user
        ex:- {"_id":{"$oid":"5f70dc5008f4cd4fbc1d2459"},"sessionId":"dfda5dba-d5d0-430b-bcd1-03eeda15e319","user":"User465797","intentVisited":"check_balance"}

        {"_id":{"$oid":"5f70dc3c08f4cd4fbc1d2457"},"sessionId":"dfda5dba-d5d0-430b-bcd1-03eeda15e319","user":"User465797","intentVisited":"welcome"}

By using above database collection we can generate a report on number of users connected and the jurney they went through with FinBot and also we can find out how many users disconnected inbetween the flow by disconnect status.

NOTE: Since i am using npm library 'mongodb' instead of mongoose, i haven't written any scemas for collections. We can have schema for all three collection as given below with mongoose library.

ex:- const Schema = MongoClient.schema;

        const usersSchema = new Schema({
        user: String,
        sessionId: String,
        status: String
        });
For mongodb.MongoClient db.createCollection() with @$jsonSchema: is allowed in latest version of mongodb above 4.4.1 which is not used currently.

# API's exposed for the report purpose
    
    1) '/currentUser' - this provides the information on the user who is interacting with bot currently.
        ex: {"sessionId":"a5db2678-c05d-4112-98f8-95c09d9357cf","user":"User828059"}
    2) '/totalUsers' - This provides the information on how many users have taken chat interaction.
        ex: {"totalUsers":6,"user":[{"_id":"5f707a1cc3505a28d4f758eb","user":"User38083","sessionId":"1f621137-9a55-4132-b8ba-207e558c1bbc"},{"_id":"5f707a68692aae2d348bbf2c","user":"User780992","sessionId":"441b1c12-0d2f-49df-972f-2fb7fed6e789"},{"_id":"5f70821e422f591580b2d542","user":"User664642","sessionId":"be3c1da1-f01e-46e9-80f3-60463da45a08"},{"_id":"5f7082b6b82d3a0838303ba9","user":"User869384","sessionId":"49497a7e-d9cd-4969-a61c-256488fe8e34"},{"_id":"5f70cd2b2c2bf44c6cc7abad","user":"User156407","sessionId":"71c240cb-a7e8-48a3-816c-d9e902f8fe89"},{"_id":"5f70d3d47421b03c6838afb8","user":"User257790","sessionId":"36e6e007-cc17-460a-9748-be3f23d6c674"}]}

    3) '/completedUser' - This api provides the information on how many users completed the chat successfully
        ex: {"user":[{"_id":"5f70dc6a08f4cd4fbc1d245d","sessionId":"dfda5dba-d5d0-430b-bcd1-03eeda15e319","user":"User465797","intentVisited":"no_thanks"}],"Count":1}

    4) '/disconnectedUser' - this api provides the information on how many users disconnectd in-between
        ex: {"user":[{"_id":"5f70df1d1da2d12e4057b137","user":"User175551","sessionId":"6e2e5991-edc7-4dc1-91f9-a1101485736d","status":"disconnect"}],"Count":1}

All the API's secured with basic authentication process where we have to pass auth token along with get request
Ex: http://localhost:3030/totalUsers?token=<auth_key>

# DialogFlow Interaction:-
    Currently I am using the dialogflow npm module to interact with DF to get train the bot with different utterances and getting response from the dialog flow as an intent. If dialogFlow interaction doesn't work due to proxy restrictions we can use fall back method of json files created 'intent.json' and 'content.json'.

# NOTE:- 
    Currently i am running mongoDB locally so bot will run and store a data in local data base.