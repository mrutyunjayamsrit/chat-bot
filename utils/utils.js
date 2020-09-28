const intent = require('../intent.json');
const content = require('../content.json');


function check_intent(message){
    let intent_list = intent.Intents;
    for(let data of intent_list){
        if(data.input_query === message){
            return data.intent_name;
        }
    }
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

module.exports={
    check_intent,
    getBotMessage
}