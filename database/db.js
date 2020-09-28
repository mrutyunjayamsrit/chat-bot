const { MongoClient } = require('mongodb');
//const config = require('config');
//const {MongoURL} = config;
//const URL = 'mongodb://localhost:27017';
const URL = 'mongodb+srv://root:root@auth-qhv4r.mongodb.net/'
const DbName = 'chatApp';
let db = '';

MongoClient.connect(URL, (error, client) => {
  if (error) {
    console.log('DB connect failure');
    return;
  }

  console.log('DB connected successfully');

  db = client.db(DbName);
  // console.log("DB: ", db);
});

insertDocuments = (content, collection1) => {
  const collection = db.collection(collection1);

  collection.insertMany(content, (error, result) => {
    if (error) {
      console.log('DB insert failed');
      console.log('DB insert failed');
    }
    if (result) {
      console.log('DB insert successfull!!!');
    }
  });
};

/**
 *
 * @param {Query data from Mongo DB} query
 */

const findDocuments = function (query, query2 = null, collection1) {
  // Get the documents collection
  const collection = db.collection(collection1);
  return new Promise((resolve, reject) => {
    // Find some documents
    collection.find(query,query2).toArray((err, docs) => {
      if (err) {
        console.log('Error to read the records');
        log.error('Error to read the records');
        reject('Not able to fetch details');
      }
      console.log('Found the following records');
      // console.log(docs);
      resolve(docs);
    });
  });
};

const updateDocument = function(query, newValue, collection1) {
  // Get the documents collection
  const collection = db.collection(collection1);
  return new Promise((resolve, reject)=>{
    collection.updateOne(query,newValue, function(err, result) {
      if(err){
        console.log('Error to update the records');
        log.error('Error to update the records');
        reject('Error to update the records');
      }
      console.log("Updated the document with the field a equal");
      resolve(result);
    });
  })
}

const removeDocument = function(query, collection1) {
  // Get the documents collection
  const collection = db.collection(collection1);
  return new Promise((resolve, reject)=>{
    collection.deleteOne(query, function(err, result) {
      if(err){
        console.log('Error while removing data');
        log.error('Error while removing data');
        reject('Error while removing data');
      }
      resolve(result);
    });
  }) 
}


module.exports = {
  insertDocuments,
  findDocuments,
  updateDocument,
  removeDocument
};
