/**
 * Created by zhaosiyang on 2016-10-03.
 */

const EMAIL = 'sign-url-test@fir-test-zsy.iam.gserviceaccount.com';
const BUCKET_NAME = 'fir-test-zsy.appspot.com';
const CloudStorage = require("gcs-signed-urls")("./google-services-private-key.pem", EMAIL, BUCKET_NAME);

const PROJECT_ID = 'fir-test-zsy';

const gcloud = require('google-cloud').storage({
    projectId: PROJECT_ID,
    keyFilename: './firebase-test-zsy-367d79ddd855.json'
});

const bucket = gcloud.bucket('fir-test-zsy.appspot.com');

var uploadFile = function(pathToFile){
    return new Promise(function(resolve, reject){
        bucket.upload(pathToFile, function(err, file) {
            if(err){
                return reject(err);
            }
            else {
                return resolve(file);
            }
        });
    });

};

var getSignedUrl = function(filename){
    return CloudStorage.getPrivateUrl(filename);
};


// Download a file from your bucket.
// bucket.file('server.js').download({
//     destination: './downloads/server.js'
// }, function(err) {
//     if(err) return console.log(err);
//     console.log("success")
// });

module.exports = {
    uploadFile: uploadFile,
    getSignedUrl: getSignedUrl
};







