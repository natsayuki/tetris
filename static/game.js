$(document).ready(function(){
  const roomKeyText = $('#roomKeyText');
  const nameEnter = $('#nameEnter');
  const nameWrapper = $('#nameWrapper');
  const nameIn = $('#nameIn');
  const messageText = $('#messageText');
  const playerWrapper = $('#playerWrapper');
  const start = $('#start');
  const mainWrapper = $('#mainWrapper');

  const socket = io();
  const id = random(10000000, 99999999);
  const key = new URL(window.location.href).searchParams.get('key');

  let kill = false;
  let otherPlayers = {};
  let mainTetris = null;

  roomKeyText.text(key);

  function beamit(message, data){
    // socket.broadcast.emit(message, data);
    socket.emit(message, data);
  }
  function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }
  function displayMessage(message){
    messageText.text(message);
    messageText.addClass('fade');
    setTimeout(function(){
      messageText.removeClass('fade');
    }, 2000);
  }
  function addPlayer(name, id){
    playerWrapper.append(`<h1 id="${id}" class="playerName">${name}</h1>`);
    setTimeout(function(){
      $(`.playerName`).addClass('appear');
    }, 100);
  }
  function removePlayer(id){
    $(`#${id}`).removeClass('appear');
    setTimeout(function(){
      $(`#${id}`).remove();
    }, 1000);
  }
  function leaderify(){
    console.log('You are the leader');
    start.addClass('startLeader');
  }
  function done(score, uid){
    uid = parseInt(uid.replace('tetris', ''));
    if(id == uid) console.log(score);
  }
  function updateCallback(arena, player){
    beamit('update', {room: key, id: id, arena: arena, player: player});
  }
  function makePieceString(){
    let pieceString = '';
    for(let i = 0; i < 500; i++){
      pieceString += "ILJOTSZ"["ILJOTSZ".length * Math.random() | 0]
    }
    return pieceString;
  }

  beamit('init', {id: id, room: key});

  nameEnter.click(() => {
    let name = nameIn.val();

    if(name.length < 4) displayMessage("name must be at least 4 letters");
    else{
      addPlayer(name, id);
      nameWrapper.addClass('dissapear');
      beamit('newPlayer', {name: name, room: key, id: id});
    }
  });

  start.click(() => {
    beamit('start', {room: key, pieces: makePieceString()});
  });

  window.onbeforeunload = function(){
    if(!kill) beamit('exit', {room: key, id: id});
    window.location.href = '/';
    return null;
  }

  document.addEventListener('keydown', e => {
    if(mainTetris != null){
      if(e.keyCode == 37){
        mainTetris.playerMove(-1);
        beamit('move', {room: key, id: id, cmd: 'l'});
      }
      else if(e.keyCode == 39){
        mainTetris.playerMove(1);
        beamit('move', {room: key, id: id, cmd: 'r'});
      }
      else if(e.keyCode == 40){
        mainTetris.playerMoveDown();
        beamit('move', {room: key, id: id, cmd: 'd'});
      }
      else if(e.keyCode == 38){
        mainTetris.playerDrop();
        beamit('move', {room: key, id: id, cmd: 'dr'});
      }
      else if(e.keyCode == 90){
        mainTetris.playerRotate(-1)
        beamit('move', {room: key, id: id, cmd: 'rl'});
      }
      else if(e.keyCode == 88){
        mainTetris.playerRotate(1)
        beamit('move', {room: key, id: id, cmd: 'rr'});
      }
      else if(e.keyCode == 32){
        mainTetris.holdPiece();
        beamit('move', {room: key, id: id, cmd: 'h'});
      }
    }
  });

  socket.on(id, (data) =>{
    data.forEach((player) => {
      addPlayer(player.name, player.id);
    });
  });
  socket.on('newPlayer', (data) => {
    if(data.room == key && data.id != id) addPlayer(data.name, data.id);
  });
  socket.on('remove', (data) => {
    if(data.room == key) removePlayer(data.id);
  });
  socket.on('leader', (data) => {
    if(data.room == key && data.id == id) leaderify();
  });
  socket.on('kill', (data) => {
    if(data == key){
      kill = true;
      location.href = '/';
    }
  });
  socket.on('start', (data) => {
    console.log(data.pieces);
    if(data.room == key){
      data.players.forEach(player => {
        if(player.id != id){
          otherPlayers[player.id] = new Tetris(`tetris${player.id}`, '#othersWrapper', null, null, data.pieces);
        }
      });
    }
    Object.keys(otherPlayers).forEach(id => {
      otherPlayers[id].build();
    });
    mainTetris = new Tetris(`mainTetris`, '#mainTetrisWrapper', done, updateCallback, data.pieces);
    mainTetris.build();
    mainWrapper.addClass('dissapear');
  });
  socket.on('move', (data) => {
    if(data.room == key && data.id != id){
      if(data.cmd == 'l') otherPlayers[data.id].playerMove(-1);
      else if(data.cmd == 'r') otherPlayers[data.id].playerMove(1);
      else if(data.cmd == 'd') otherPlayers[data.id].playerMoveDown(1);
      else if(data.cmd == 'rl') otherPlayers[data.id].playerRotate(-1);
      else if(data.cmd == 'rr') otherPlayers[data.id].playerRotate(1);
      else if(data.cmd == 'dr') otherPlayers[data.id].playerDrop();
      else if(data.cmd == 'h') otherPlayers[data.id].holdPiece();
    }
  });
  socket.on('update', (data) => {
    if(data.room == key && data.id != id){
      otherPlayers[data.id].importArenaPlayer(data.arena, arena.player);
    }
  });
});
