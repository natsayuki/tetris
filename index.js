const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const app = express();
const server = http.Server(app);
const io = socketio(server);

let lobbys = {'11111111': []};

function random(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

app.get('/validRoom', (req, res) => {
  let key = req.query.key;
  console.log('checking room ' + key);
  let valid = Object.keys(lobbys).indexOf(key) != -1;
  res.send(valid);
});

app.get('/room', (req, res) => {
  let key = req.query.key;
  console.log('joining room ' + key);
  res.sendFile(path.resolve('game.html'));
});

app.get('/createRoom', (req, res) => {
  let key = random(10000000, 99999999);
  lobbys[key] = {leader: '', players: []};
  res.send(key.toString());
});

app.get('/', (req, res) => {
  res.sendFile(path.resolve('index.html'));
});

io.on('connection', (socket) => {
  function beamit(message, data){
    socket.broadcast.emit(message, data);
    socket.emit(message, data);
  }
  socket.on('init', (data) => {
    let players = lobbys[data.room]['players'];
    if(players.length < 1){
      beamit('leader', {room: data.room, id: data.id});
      lobbys[data.room]['leader'] = data.id;
    }
    beamit(data.id, players);
  });
  socket.on('newPlayer', (data) => {
    beamit('newPlayer', data);
    lobbys[data.room]['players'].push(data);
  });
  socket.on('exit', (data) => {
    if(data.id == lobbys[data.room]['leader']){
      beamit('kill', data.room);
      delete lobbys[data.room];
    }
    else{
      let remove;
      for(let i = 0; i < lobbys[data.room]['players'].length; i++){
        if(lobbys[data.room]['players'][i]['id'] == data.id) remove = i;
      }
      console.log(remove, lobbys[data.room]['players']);
      lobbys[data.room]['players'].pop(remove);
      beamit('remove', {room: data.room, id: data.id});
    }
  });
  socket.on('start', (data) => {
    beamit('start', {room: data.room, players: lobbys[data.room]['players'], pieces: data.pieces});
  });
  socket.on('move', (data) => {
    beamit('move', data);
  });
  socket.on('update', (data) => {
    beamit('update', data);
  });
});

app.use(express.static("static"));

let port = process.env.PORT || 3000;
// let port = 3000;

server.listen(port, () => {
  console.log("server up on port 3000");
});
