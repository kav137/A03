var bodyParser = require('body-parser');
var mysql = require("mysql");
var express = require('express');
var app = express();
var server;

app.set('view engine', 'html');
app.use(function (req, res, next){
	console.log("%s %s", req.method, req.url);
	next();
});
app.use("/node_modules", express.static('node_modules')); 
app.use(express.static(__dirname + "/public", { redirect : false }));
app.use(bodyParser.urlencoded({extended: true}));


var connection;
app.get('/auth', function (req, res){
	if (req.headers.logout){
		connection.end(function (err){
			res.end('server : logout')
		})
	}
	var username = req.headers.username;
	var password = req.headers.password;
	console.log("login attempt: ")
	console.log("user:", username);
	console.log("pwd:", password);
	connection = mysql.createConnection({
		host : "localhost",
		user : username,
		password : password,
		database  : "hr"
	})
	connection.connect(function (err){
		if (err){
			console.log('access denied');
			res.end(JSON.stringify({
				allowed : false
			}));
			return;
		}
		console.log('successfully logged in');
		res.end(JSON.stringify({
			allowed : true
		}));
	})
})

app.route('/db')
	.get(function (req, res){
		var query = req.headers.query;
		connection.query(query, function (err, rows, fields){
			console.log('performing query...', query);
			res.json({ 
				rows : rows,
				fields : fields
			})
		})
	}).
	post(function (req, res){
		var query = JSON.parse(Object.keys(req.body)[0]).query; //ta-dam!)
		connection.query(query, function (err, rows, fields){
			console.log('performing query...', query);
			res.end();
		})
		console.log(JSON.parse(query).query)
	})

app.get('/:page?', function (req, res) {
	res.redirect('/');
 	res.sendFile(__dirname + '/public/index.html');
})

 
server = app.listen(3000, function (){
	console.log("Server started successfully");
});