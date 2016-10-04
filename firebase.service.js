/**
 * Created by zhaosiyang on 2016-10-02.
 */
var firebase = require('firebase');
var _ = require('lodash');
var PROJECT_ID = 'fir-test-zsy';

firebase.initializeApp({
    serviceAccount: './firebase-test-zsy-367d79ddd855.json',
    databaseURL: "https://"+ PROJECT_ID +".firebaseio.com"
});

var db = firebase.database();

var database = {};
var storage = {};

// get all documents in the collection, return a Promise of all the documents
database.getAll = function (collection) {
  return db.ref("/" + collection).once('value');
};

// get one document specified by id in the collection, return a Promise of the document
database.getOne = function (collection, id) {
  return db.ref("/" + collection + "/" + id).once('value');
};

// create a new documents in the collection, return a Promise of the newly created document
database.create = function (collection, user) {
    var id = db.ref("/" + collection).push().key;
    console.log(`the key is: ${id}`);
    return db.ref("/" + collection + '/' + id).set(user).then((err) => {
        if(err){
            throw err;
        }
        var res = {};
        res[id] = user;
        return Promise.resolve(res);
    });
};

// update a document specified by id in the collection, return a Promise of the newly created document
database.update = function (collection, id, user) {
    updates = {};
    var keys = Object.keys(user);
    keys.forEach((key) => {
        updates['/' + key] = user[key];
    });
    return db.ref('/' + collection + '/' + id).update(updates).then(function(err){
        if(err) throw err;
        return database.getOne(collection, id);
    })
};

// delete a document in the collection return a Promise of null
database.remove = function (collection, id) {
    return db.ref('/' + collection + '/' + id).remove();
};

module.exports = {
    database: database,
    storage: storage
};

