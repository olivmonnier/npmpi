var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var path = require('path');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// Routes
var projects = require('./routes/projects')(io);

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.locals.capitalize = function(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// Routes
app.use('/projects', projects);

if ('development' == app.get('env')) {
  app.use(errorHandler());
}

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

io.on('connection', function(socket) {
    socket.on('room', function(room) {
        socket.join(room);
    });
});
