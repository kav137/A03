"use strict"
var express = require('express');
// var ejs = require('ejs');
var app = express();
var server;

app.set('view engine', 'html');
app.use(function (req, res, next){
	console.log("%s %s", req.method, req.url);
	next();
})
app.use(express.static(__dirname + "/public", { redirect : false }));

var auth = false;
app.get('/:page?', function (req, res) {
	res.redirect('/');
 	res.sendFile(__dirname + '/public/index.html');
})

 
server = app.listen(3000, function (){
	console.log("Server started successfully");
});