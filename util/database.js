const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const dbuname = require('../vars').dbuname;
const dbpass = require('../vars').dbpass;



let _db;
const mongoConnect = (callback) => {
    MongoClient.connect(`mongodb+srv://${dbuname}:${dbpass}@cluster0.czne7.mongodb.net/shop?retryWrites=true&w=majority`)
    .then( client => {
        console.log('Connected to DB')
        _db = client.db();
        callback(client)
    })
    .catch(err=>{
        console.log(err)
        throw err;
    })
}

const getDb = () => {
    if(_db){
        return _db;
    }
    throw 'no db found!'
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;