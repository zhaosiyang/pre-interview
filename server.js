/**
 * Created by zhaosiyang on 2016-10-02.
 */

'use strict';

const Hapi = require('hapi');
const bell = require('bell');
const firebaseService = require('./firebase.service');
const fs = require('fs');
const gcs = require('./googleCloudStorage.service');
const path = require('path');
const Boom = require('boom');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 8000
});

server.register(bell, function (err) {

    // Declare an authentication strategy using the bell scheme
    // with the name of the provider, cookie encryption password,
    // and the OAuth client credentials.
    server.auth.strategy('facebook', 'bell', {
        provider: 'facebook',
        password: 'cookie_encryption_password_secure',
        clientId: '1013382455397539',
        clientSecret: '1a0f84bcfcf96e0b4daf2e2eb76148c7',
        isSecure: false     // Terrible idea but required if not using HTTPS especially if developing locally
    });

    // Use the 'facebook' authentication strategy to protect the
    // endpoint handling the incoming authentication credentials.
    // This endpoints usually looks up the third party account in
    // the database and sets some application state (cookie) with
    // the local application account information.
    server.route({
        method: ['GET', 'POST'], // Must handle both GET and POST
        path: '/auth/facebook',          // The callback endpoint registered with the provider
        config: {
            auth: 'facebook',
            handler: function (request, reply) {
                console.log(request.auth);
                if (!request.auth.isAuthenticated) {
                    return reply('Authentication failed due to: ' + request.auth.error.message);
                }

                // Perform any account lookup or registration, setup local session,
                // and redirect to the application. The third-party credentials are
                // stored in request.auth.credentials. Any query parameters from
                // the initial request are passed back via request.auth.credentials.query.
                return reply.redirect('/');
            }
        }
    });

    //home page
    server.route({
        method: 'GET', // Must handle both GET and POST
        path: '/',          // The callback endpoint registered with the provider
        config:{
            auth: 'facebook',
            handler: function (request, reply) {
                return reply("This is the home page. When you see this page, then congrats that you've successfully signed in");
            }
        }
    });

    //get one user
    server.route({
        method: 'GET',
        path: '/api/users/{id}',
        config: {
            handler: function (request, reply) {
                firebaseService.database.getOne('users', request.params.id)
                    .then((user) => {
                        if(!user.val()) {
                            return reply(Boom.notFound());
                        }
                        reply(user.val());
                    })
                    .catch((err) => {console.log(err); reply(Boom.serverUnavailable());})
            }
        }
    });

    // get all users
    server.route({
        method: 'GET',
        path: '/api/users',
        config: {
            handler: function (request, reply) {
                firebaseService.database.getAll('users')
                    .then((users) => {reply(users.val())})
                    .catch((err) => {console.error(err); reply(Boom.serverUnavailable());})
            }
        }
    });

    // create a new user
    server.route({
        method: 'POST',
        path: '/api/users',
        config: {
            payload: {
                output: 'file',
                maxBytes: 209715200,
                allow: 'multipart/form-data',
                parse: true //or just remove this line since true is the default
            },
            handler: function (request, reply) {
                if(!request.payload.file) {
                    return reply(Boom.badRequest('no image photo found'));
                }
                var filePath = request.payload.file.path;
                var fileName = request.payload.file.filename;
                var writeStream = fs.createWriteStream('./' + fileName);
                var readStream = fs.createReadStream(filePath);
                readStream.pipe(writeStream);
                var user = {};
                user.name = request.payload.name;

                // upload file to google cloud storage
                gcs.uploadFile('./' + fileName)
                    .then(function(file){
                        //delete the local file
                        fs.unlink('./' + fileName);
                        return fileName;
                    })
                    .then(function(fileName){
                        user.imageUrl =  gcs.getSignedUrl(fileName);
                        return firebaseService.database.create('users', user)
                            .then(user=>reply(user))
                    })
                    .catch(function(err){
                        console.error(err);
                        reply(Boom.serverUnavailable());
                    });
            }
        }
    });

    //update a user
    server.route({
        method: 'PUT',
        path: '/api/users/{id}',
        config: {
            handler: function (request, reply) {
                firebaseService.database.update('users', request.params.id, request.payload)
                    .then((user) => {reply(user.val())})
                    .catch((err) => {
                        console.error(err);
                        reply(Boom.serverUnavailable());
                    });
            }
        }
    });

    //delete a user
    server.route({
        method: 'DELETE',
        path: '/api/users/{id}',
        config: {
            handler: function (request, reply) {
                firebaseService.database.remove('users', request.params.id)
                    .then(() => reply(null))
                    .catch((err) => {
                        console.log(err);
                        reply(Boom.serverUnavailable());
                    })
            }
        }
    });

    server.start((err) => {

        if (err) {
            throw err;
        }
        console.log(`Server running at: ${server.info.uri}`);
    });
});
