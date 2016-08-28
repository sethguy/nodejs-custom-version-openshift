#!/bin/env node
 //  soopedUp  node starter
var express = require('express');
var fs = require('fs');
var Mongo = require('mongodb'),
    assert = require('assert');
var Grid = require('gridfs-stream');
var MongoClient = Mongo.MongoClient;
var ObjectId = require('mongodb').ObjectID;
Object.assign = require('object-assign')
var path = require('path');
var io = require('socket.io');
var request = require('request');
var count = 0;
var onCount = 0;
var USERSCOLLECTION = "Users";
var dbName = "";
var bcrypt = require('bcryptjs');
var saltRounds = 10;
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser')
    /**
     *  Define the sample application.
     */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
        self.port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        /*if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";

        };*/

        self.relLink = 'http://' + self.ipaddress + ':' + self.port + '/';
        self.mongourl = 'mongodb://' + self.ipaddress + ':27017/' + dbName;

        // console.log( "monogo" , self.mongourl );
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) {
        return self.zcache[key];
    };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig) {
        if (typeof sig === "string") {
            console.log('%s: Received %s - terminating sample app ...',
                Date(Date.now()), sig);
            process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()));
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function() {
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
            'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = {};

        // Routes for /health, /asciimo, /env and /
        self.routes['/health'] = function(req, res) {
            res.send('1');
        };

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/env'] = function(req, res) {
            var content = 'Version: ' + process.version + '\n<br/>\n' +
                'Env: {<br/>\n<pre>';
            //  Add env entries.
            for (var k in process.env) {
                content += '   ' + k + ': ' + process.env[k] + '\n';
            }
            content += '}\n</pre><br/>\n'
            res.send('<html>\n' +
                '  <head><title>Node.js Process Env</title></head>\n' +
                '  <body>\n<br/>\n' + content + '</body>\n</html>');
        };


        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(fs.readFileSync('./index.html'));
        };

        self.routes['apeazzy'] = function(req, res) {

            res.set('Content-Type', 'text/html');
            res.send(fs.readFileSync('./apeazzy.html'));

        };


        self.routes['/ck/:email/:password'] = function(req, res) {

            var ckuser = function(db, callback) {
                // Get the documents collection
                var collection = db.collection(USERSCOLLECTION);
                // Find some documents
                collection.find({ "password": req.param("password"), "email": req.param("email") }).toArray(function(err, docs) {

                    console.dir(docs);
                    callback(docs);
                });
            }

            // Use connect method to connect to the Server
            MongoClient.connect(self.mongourl, function(err, db) {
                if (err) throw err;
                //console.log("Connected correctly to server");
                ckuser(db, function(docs) {
                    var result = JSON.stringify(docs);
                    console.log("");
                    res.header("Access-Control-Allow-Origin", "*");
                    res.header("Access-Control-Allow-Headers", "X-Requested-With");
                    res.send(result);

                    db.close();
                }); //ck user method

            }); //mongo connect

        }; //ck route

    }; //ROUTES


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }

        self.app.get('/images/:id', function(req, res) {

            // TODO: set proper mime type + filename, handle errors, etc...

            var id = req.params.id;

            var findimg = function(db, callback) {
                // Get the documents collection
                var collection = db.collection('fs.files');
                // Find some documents
                collection.find({ _id: ObjectId(id) }).toArray(function(err, docs) {
                    if (!err) {

                        console.log("Found the following records" + JSON.stringify(docs));
                        console.dir(docs);
                        callback(docs);
                    } else {

                        res.send(err);

                    }

                });
            }

            MongoClient.connect(self.mongourl, function(err, db) {
                if (!err) {
                    findimg(db, function(docs) {
                        var result = JSON.stringify(docs);

                        console.log(result);

                        if (docs[0] != null) {

                            var uid = docs[0]._id;

                            var gfs = grid(db, Mongo);

                            res.header("Access-Control-Allow-Origin", "*");
                            res.header("Access-Control-Allow-Headers", "X-Requested-With");

                            gfs
                            // create a read stream from gfs...
                                .createReadStream({ _id: uid })
                                // and pipe it to Express' response
                                .pipe(res);

                        } else {

                            res.send("");

                        }

                    }); //find docs method

                } else {
                    res.send(err);
                }
            }); //mongo connect

        });


        self.app.post('signUp', function(req, res) {


            var newCreds = {
                email: req.body.email,
                pass: req.body.pass
            }

            var sertuser = function(db, callback) {
                    // Get the documents collection
                    var collection = db.collection(USERSCOLLECTION);

                    bcrypt.hash(newCreds.pass, saltRounds, function(err, hash) {
                        // Store hash in your password DB.
                        collection.insert([{
                            "email": newCreds.email,
                            "password": hash
                        }, ], function(err, result) {
                            callback(result);
                        });

                    });

                    // Find some documents

                } //sertuser


            // Use connect method to connect to the Server
            MongoClient.connect(self.mongourl, function(err, db) {
                if (err) throw err;
                //console.log("Connected correctly to server");

                sertuser(db, function(docs) {

                    res.send(info);

                    var result = JSON.stringify(docs);

                }); //insert method


            }); //mongo connect


        })

        self.app.post('/images', function(req, res) {

            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");

            MongoClient.connect(self.mongourl, function(err, db) {
                if (err) throw err;

                var form = new formidable.IncomingForm();
                form.uploadDir = __dirname;
                form.keepExtensions = true;
                form.parse(req, function(err, fields, files) {
                    // console.log('feilds : ' + files.length);
                    if (!err) {
                        console.log('File uploaded : ' + files.file.path);

                        var gfs = grid(db, Mongo);
                        var writestream = gfs.createWriteStream({
                            filename: files.file.name,
                            /*metadata: {

                            }*/
                        });


                        gm(files.file.path)
                            .resize(600, 800, '!')
                            .write(files.file.path, function(err) {
                                if (err) {
                                    res.json(err);
                                }

                                fs.createReadStream(files.file.path).pipe(writestream);

                                if (!err) console.log('done');

                            }); // image resizing

                        writestream.on('close', function(file) {
                            // do something with `file`

                            res.json({
                                id: file._id,
                                href: relLink + 'images/' + file._id
                            });

                            //redirect
                            fs.unlink(files.file.path, function(err) {
                                if (err) {
                                    return console.error(err);
                                }
                                console.log("File deleted successfully!");
                            });

                        }); // writestream on close


                    } else {
                        console.log('File uploaded : ' + err);
                        res.json("no");

                    } // formidable error error   

                    // res.send(result);

                }); //form.parse


            }); //mongo connect


        }); // images
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {

        /*
        var urlstring = "";

        request(urlstring, function(error, response, body) {
         
        console.log( body );
          
         // console.log(body);
        });*/


        //  Start the app on the specific interface (and port).

        self.app.use(express.static(path.join(__dirname, 'public')));

        self.app.use(bodyParser.json()); // to support JSON-encoded bodies
        self.app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
            extended: true
        }));

        io.listen(

            self.app.listen(self.port, self.ipaddress, function() {
                console.log('%s: Node server started on %s:%d ...',
                    Date(Date.now()), self.ipaddress, self.port);
            })

        ).on('connection', function(socket) {
            count++;
            onCount++;
            console.log('a user connected @ ' + new Date().getTime() + ' :: ' + count);
            console.log(' :: onCount ' + onCount);

            socket.on('disconnect', function(socket) {
                console.log('a user connected @ ' + new Date().getTime() + ' :: ' + count);
                onCount--;
                console.log(' :: onCount ' + onCount);

            });


        });
    };

}; /*  Sample Application.  */

var mongogetdb = function(calli) {
    // Use connect method to connect to the Server
    MongoClient.connect(self.mongourl, function(err, db) {
        if (err) throw err;
        //console.log("Connected correctly to server");

        calli(db); //insert method

    }); //mongo connect

};

var updateDocumentbyid = function(db, table, id, set, callback) {
    // Get the documents collection
    var collection = db.collection(table);
    // Update document where a is 2, set b equal to 1
    collection.updateOne({ _id: new ObjectId(id) }

        , { $set: set },

        function(err, result) {

            callback(result, err);

        });
}

var sertobj = function(db, table, obj, callback) {

        // Get the documents collection
        var collection = db.collection(table);

        collection.insert(obj, function(err, result) {

            callback(result, err);

        });

    } //sertobj

var findby = function(db, table, terms, ops, calli) {

        db.collection(table).find(terms).toArray(function(err, docs) {

            calli(docs, err);

        });

    } //getby

/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();
