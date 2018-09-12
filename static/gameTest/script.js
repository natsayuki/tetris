$(document).ready(function(){
  tetris = new Tetris('tetris1', '#wrapper', done);
  tetris.build();

  function done(score){
    console.log('nice score of ' + score.toString() + ' loser');
  }

  document.addEventListener('keydown', e => {
    if(e.keyCode == 37) tetris.playerMove(-1);
    else if(e.keyCode == 39) tetris.playerMove(1);
    else if(e.keyCode == 40) tetris.playerMoveDown();
    else if(e.keyCode == 90) tetris.playerRotate(-1)
    else if(e.keyCode == 88) tetris.playerRotate(1)
  });
});
