var express = require('express'),
	http = require('http');

var fs = require('fs');

var app = express();
var port = 3000;

// To specify port as first argument set port to process.argv[2]

var server = http.createServer(app).listen(port);

var io = require('socket.io').listen(server); 
var jade = require('jade');

var log = fs.createWriteStream('log.txt', {'flags': 'a'});

var startupTime = new Date(Date.now());

log.write("\n \n Server Started at "+startupTime.toLocaleString()+"\n\n");

io.set('log level', 2);

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set("view options", { layout: false });


app.configure(function() {
	app.use(express.static(__dirname + '/public'));
});


app.get('/', function(req, res){
	res.render('home.jade');
});
//server.listen(process.argv[2]);

var currentlyConnectedUsers = [];

io.sockets.on('connection', function (socket) {
	socket.on('setPseudo', function (data) {
		socket.set('pseudo', data[0]);
		socket.set('color',data[1]);
		console.log("User: "+data[0]+", Color: "+data[1]+" has connected");
		log.write("User: "+data[0]+" Color: "+data[1]+" has connected \n");
		socket.get('pseudo', function (error, name){
			socket.get('color', function (error, color){
				socket.emit("sendAllUsers", currentlyConnectedUsers);
				socket.broadcast.emit('userConnected', name, color);
				currentlyConnectedUsers[currentlyConnectedUsers.length]=[name,color];
			})
		});
	});
	socket.on('message', function (message) {
		socket.get('pseudo', function (error, name) {
			socket.get('color', function (error, color) {
				var data = { 'message' : message, pseudo : name, 'color': color};
				socket.broadcast.emit('message', data);
				console.log(name + ": " + message);
				log.write(name + ": " + message+"\n");
			});
		});
	});
	socket.on('disconnect', function () {
		socket.get('pseudo', function (error, name){
			socket.get('color', function (error, color){
				socket.broadcast.emit('disconnected', name, color);
				console.log("User: "+name+" has disconnected");
				log.write("User: "+name+" has disconnected \n");
				for (var i = 0; i < currentlyConnectedUsers.length; i++) {
					if(currentlyConnectedUsers[i][0]==name){
						currentlyConnectedUsers.splice(i,1);
						break;
					}
				};
			})
		});
	});
});