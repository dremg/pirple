/*
 * Primary file for API
 *
 */

 //Dependencies
 const http = require('http');
 const https = require('https');
 const url = require('url');
 const StringDecoder = require('string_decoder').StringDecoder;
 const config = require('./config');
 const fs = require('fs');

 // Instanstiate the HTTP server.
var httpServer = http.createServer(function(req,res){
	unifiedServer(req,res);
});

// Start the server
httpServer.listen(config.httpPort,function(){
  console.log('The server is listening on port ' +config.httpPort+ ' in ' +config.envName+ ' mode.');
});

/*** HTTPS instantiation ***
 * seems to be an issue with the keys (cert.pem and key.pem)
 *
 // Instanstiate the HTTPS server.
 var httpsServerOptions = {
 	'key' : fs.readFileSync('./https/key.pem'),
 	'cert' : fs.readFileSync('./https/cert.pem')
 };
 var httpsServer = https.createServer(httpsServerOptions,function(req,res){
	unifiedServer(req,res);
});

// Start the server
httpsServer.listen(config.httpsPort,function(){
  console.log('The server is listening on port ' +config.httpsPort+ ' in ' +config.envName+ ' mode.');
});
 *
 *
 */

// All the server logic for both the http and https server
var unifiedServer = function(req,res){
	// Get the URL and parse it
	var parsedUrl = url.parse(req.url,true);

	// Get the path 
	var path = parsedUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g,'');

	// Get the query string as an object
	var queryStringObject = parsedUrl.query;

	// Get the HTTP Method
	var method = req.method.toLowerCase();

	// Get the headers as an object
	var headers = req.headers;

	// Get the payload, if any
	var decoder = new StringDecoder('utf-8');
	var buffer = '';
	req.on('data',function(data){
		buffer += decoder.write(data);
	});
	req.on('end', function(){
		buffer += decoder.end();

      // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
      var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

      // Construct the data object to send to the handler
      var data = {
        'trimmedPath' : trimmedPath,
        'queryStringObject' : queryStringObject,
        'method' : method,
        'headers' : headers,
        'payload' : buffer
      };

      // Route the request to the handler specified in the router
      chosenHandler(data,function(statusCode,payload){

        // Use the status code returned from the handler, or set the default status code to 200
        statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

        // Use the payload returned from the handler, or set the default payload to an empty object
        payload = typeof(payload) == 'object'? payload : {};

        // Convert the payload to a string
        var payloadString = JSON.stringify(payload);

        // Return the response
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(statusCode);
        res.end(payloadString);
        console.log("Returning this response:",statusCode,payloadString);

      });

  });
};

// Define all the handlers
var handlers = {};

// Sample handler
handlers.sample = function(data,callback){
    callback(980,{'name':'sample handler'});
};

// FooBar handler
handlers.fooBar = function(data,callback){
    callback(980,{'name':'fooBar handler'});
};

// Hello handler
handlers.hello = function(data,callback){
    callback(980,{'name':`Hello World, from the Pirple NodeJS Master Class
    				My name is Eric Gamble. I live and work in Charlotte North Carolina
    				I teach business courses at a local university and consult small businesses
    				on the side.  Some of these "gigs" require me to write code to meet their needs.
    				I believe the Pirple NodeJS course will help me develop a deeper understanding.
    				And yes, I tend to write all of my code so I can quickly fix future bugs/issues.`});
};

// ping handler
handlers.ping = function(data,callback){
    callback(200);
};

// Not found handler
handlers.notFound = function(data,callback){
  callback(404);
};

// Define the request router
var router = {
  'sample' : handlers.sample,
  'foobar' : handlers.fooBar,
  'ping' : handlers.ping,
  'hello' : handlers.hello
};
