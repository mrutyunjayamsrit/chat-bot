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
        ex:- {
                "user": "User780229",
                "sessionId": "e0138f27-41cf-483e-9450-b37df2a60a99"
             }

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
        ex: {
  "NumberOfuserVisitedBot": 24,
  "userDetails": [
    {
      "user": "User499763",
      "session": "05af9227-f43b-4eb5-9482-0063590d0de2"
    },
    {
      "user": "User446257",
      "session": "851e3f04-8882-45f4-ad81-222a7a1d77b0"
    },
    {
      "user": "User487404",
      "session": "98e12cf6-9ee4-4493-8e0d-55d9bff1bdb6"
    },
    {
      "user": "User140591",
      "session": "c252a549-0c15-4b68-bbaa-9496c3a1888f"
    },
    {
      "user": "User957679",
      "session": "d2e3f5bd-c1cf-4a93-8352-64a9f8bae35a"
    },
    {
      "user": "User811817",
      "session": "cd462403-924c-425a-acf9-ccc83b4533ad"
    },
    {
      "user": "User157291",
      "session": "e41b3329-1297-4dd5-b2f7-803385f2a850"
    },.....
  ]
}

    3) '/completedUser' - This api provides the information on how many users completed the chat successfully
        ex: {
            "journeyCompletedUsers": 6,
            "user": [
                "User185675",
                "User976250",
                "User89314",
                "User662913",
                "User396744",
                "User533268"
            ],
            "completeEngagementRate": "25%"
           }

    4) '/disconnectedUser' - this api provides the information on how many users disconnectd in-between
        ex: {
        "journeyDisconnectedUsers": 1,
        "user": [
            "User118338",
            "User446257",
            "User157291",
            "User811817",
            .....
        ],
        "disconnectedRate": "75%"
        }

All the API's secured with basic authentication process where we have to pass auth token along with get request
Ex: http://localhost:3030/totalUsers?token=<auth_key>

# DialogFlow Interaction:-
    Currently I am using the dialogflow npm module to interact with DF to get train the bot with different utterances and getting response from the dialog flow as an intent. If dialogFlow interaction doesn't work due to proxy restrictions we can use fall back method of json files created 'intent.json' and 'content.json'.

# NOTE:- 
    Currently i am running mongoDB locally so bot will run and store a data in local data base.