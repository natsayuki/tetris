class Tetris{
  constructor(id, parent, done, updateCallback, pieceString){
    this.id = id;
    this.parent = parent;
    this.done = done || null;
    this.updateCallback = updateCallback || null;
    this.pieceString = pieceString || this.makePieceString();
    this.tag = `
    <div class="tetrisInstance">
      <h1 id="score${id}"></h1>
      <canvas id="${id}" width="240" height="400"></canvas>
    </div>
    `;
  }
  build(){
    $(this.parent).append(this.tag);
    this.canvas = document.getElementById(this.id);
    this.context = this.canvas.getContext('2d');
    this.context.scale(20, 20);

    this.context.fillStyle = '#000';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.arena = this.createMatrix(12, 20);



    this.player = {
      pos: {x: 0, y: 0},
      matrix: null,
      score: 0,
      drop: false,
      swapped: false,
      hold: '',
      piece: ''
    }
    let firstPiece = this.createPiece('T');
    if(this.pieceString != null){
      this.createPiece(this.pieceStringGet())
    }
    this.player.matrix = this.createPiece('T');

    this.colors = [
      null, 'red', 'blue', 'violet', 'green', 'purple', 'orange', 'pink'
    ];

    this.dropCounter = 0;
    this.dropInterval = 1000;
    this.running = true;
    this.playerReset();
    this.updateScore();
    this.update();

  }

  pieceStringGet(){
    let pieceTemp = this.pieceString[0]
    this.pieceString = this.pieceString.substring(1);
    return pieceTemp
  }

  makePieceString(){
    let pieceString = '';
    for(let i = 0; i < 500; i++){
      pieceString += "ILJOTSZ"["ILJOTSZ".length * Math.random() | 0]
    }
    return pieceString;
  }

  arenaSweep(){
    let rowCount = 1;
    outer: for(let y = this.arena.length - 1; y > 0; --y){
      for (let x = 0; x < this.arena[y].length; ++x){
        if(this.arena[y][x] == 0){
          continue outer;
        }
      }
      const row = this.arena.splice(y, 1)[0].fill(0);
      this.arena.unshift(row);
      ++y;
      this.player.score += rowCount * 10;
      rowCount *= 2;
    }
  }

  collide(arena, player){
    const [m, o] = [this.player.matrix, this.player.pos];
    for(let y = 0; y< m.length; ++y){
      for(let x = 0; x < m[y].length; ++x){
        if(m[y][x] != 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) != 0){
          return true;
        }
      }
    }
    return false;
  }

  createMatrix(w, h){
    const matrix = [];
    while(h--){
      matrix.push(new Array(w).fill(0));
    }
    return matrix;
  }

  createPiece(type){
    this.player.piece = type;
    if(type == 'T'){
      return [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0]
      ]
    }
    else if(type == 'O'){
      return [
        [2, 2],
        [2, 2]
      ]
    }
    else if(type == 'L'){
      return [
        [0, 3, 0],
        [0, 3, 0],
        [0, 3, 3]
      ]
    }
    else if(type == 'J'){
      return [
        [0, 4, 0],
        [0, 4, 0],
        [4, 4, 0]
      ]
    }
    else if(type == 'I'){
      return [
        [0, 5, 0, 0],
        [0, 5, 0, 0],
        [0, 5, 0, 0],
        [0, 5, 0, 0]
      ]
    }
    else if(type == 'S'){
      return [
        [0, 6, 6],
        [6, 6, 0],
        [0, 0, 0]
      ]
    }
    else if(type == 'Z'){
      return [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0]
      ]
    }
  }

  holdPiece(){
    if(this.player.hold == '' && !this.player.swapped){
      this.player.hold = this.player.piece;
      this.playerReset();
    }
    else if(this.player.hold != '' && !this.player.swapped){
      let held = this.player.hold;
      this.player.hold = this.player.piece;
      this.playerReset(held);
    }
    this.player.swapped = true;
  }

  draw(){
    this.context.fillStyle = '#000';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawMatrix(this.arena, {x: 0, y: 0});
    this.drawMatrix(this.player.matrix, this.player.pos);
  }

  drawMatrix(matrix, offset){
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if(value != 0){
          this.context.fillStyle = this.colors[value];
          this.context.fillRect(x + offset.x, y + offset.y, 1, 1);
        }
      });
    });
  }

  update(time = 0){
    this.dropCounter += 16;
    if(this.dropCounter > this.dropInterval){
      this.playerMoveDown();
    }
    this.draw();
    let being = this;
    setTimeout(function(){
      if(being.running) being.update();
    }, 16);
  }

  updateScore(){
    document.getElementById(`score${this.id}`).innerText =this.player.score;
  }

  merge(arena, player){
    this.player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if(value != 0){
          arena[y + this.player.pos.y][x + this.player.pos.x] = value;
        }
      });
    });
  }

  rotate(matrix, dir){
    for(let y = 0; y < matrix.length; ++y){
       for(let x = 0; x < y; ++x){
         [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]]
       }
    }
    if(dir > 0){
      matrix.forEach(row => row.reverse());
    }
    else {
      matrix.reverse();
    }
  }

  playerMove(dir){
      this.player.pos.x += dir;
      if(this.collide(this.arena, this.player)){
        this.player.pos.x -= dir;

      }
  }

  playerMoveDown(){
    this.player.pos.y++;
    if(this.collide(this.arena, this.player)){
      this.player.pos.y--;
      this.merge(this.arena, this.player);
      this.playerReset();
      this.arenaSweep();
      this.updateScore();
      this.player.drop = false;
      this.player.swapped = false;
    }
    this.dropCounter = 0;
  }

  playerDrop(){
    this.player.drop = true;
    while(this.player.drop){
      this.playerMoveDown();
    }
  }

  playerRotate(dir){
    const pos = this.player.pos.x;
    let offset = 1;
    this.rotate(this.player.matrix, dir);
    while(this.collide(this.arena, this.player)){
      this.player.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if(offset > this.player.matrix[0].length){
        this.rotate(this.player.matrix, -dir);
        this.player.pos.x = pos;
        return;
      }
    }
  }

  playerReset(forcePiece){
    const pieces = "ILJOTSZ";
    forcePiece = forcePiece || null;
    if(forcePiece == null){
      this.player.matrix = this.createPiece(pieces[pieces.length * Math.random() | 0]);
      if(this.pieceString != null){
        this.player.matrix = this.createPiece(this.pieceStringGet());
      }
    }
    else{
      this.player.matrix = this.createPiece(forcePiece);
    }
    this.player.pos.y = 0;
    this.player.pos.x = (this.arena[0].length / 2 | 0) - (this.player.matrix[0].length / 2 | 0);
    if(this.collide(this.arena, this.player)){
      // this.arena.forEach(row => row.fill(0));
      // this.player.score = 0;
      // this.updateScore();
      if(this.running && this.done != null) this.done(this.player.score);
      this.running = false;
    }
    if(this.updateCallback != null) this.updateCallback(this.arena, this.player);
  }

  importArenaPlayer(arenaTemp, playerTemp){
    this.arena = arenaTemp;
    this.player = playerTemp;
  }
}
