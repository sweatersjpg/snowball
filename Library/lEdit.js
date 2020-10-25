
let pencil = true;
let num = 1;

function init_b() {

}

function menu_edit() {
  if(sprDataID !== "spriteSheet") setSpriteSheet("spriteSheet");
  cls(63);

  DrawMap(0);
  drawGrid();
  // for (a of actors) a.draw();

  if(drawFN.__proto__.constructor.name == 'Game')
  for (var a of drawFN.actors) a.draw();

  update();

}

function DrawMapEdit() {
  // setSpriteSheet("tileset");
  lset(3);
  lvl = level;

  for (var i = 0; i < lData.data[lvl].length; i++) {
    let disp = lData.data[lvl][i];
    let y = floor(i/25);
    let x = i%25;
    palset([disp,64,64]);
    if(disp >= 1) spr(0, x*tileSize, y*tileSize, 1, 1, false, 0, tileSize,tileSize);
  }
  // setSpriteSheet("spriteSheet");
}

function DrawMap(off) {
  lset(0);
  let lvl = level+off;
  let offset = off*400;

  if(lvl == -1 || lvl == lData.data.length) {
    palset([63,63,64]);
    spr(0,0-round(masterX)+offset,0,1,1,false,0,D.W,D.H);
  } else {
    for (var i = 0; i < lData.data[lvl].length; i++) {
      let data = lData.data[lvl];
      let disp = lData.data[lvl][i];
      let y = floor(i/25);
      let x = i%25;
      let sides = [data[(x+1)+y*25],data[x+(y-1)*25],data[(x-1)+y*25],data[x+(y+1)*25]];
      if(x == 24) {
        sides[0] = 1;
        if(sides[1] == 0 && sides[2] == 0) sides[0] = 0;
      }
      if(x == 0) sides[2] = 1;
      for (var j = 0; j < sides.length; j++) if(typeof sides[j] === 'undefined') sides[j] = 1;

      f = getFrame(sides);

      palset([45,64,64,64]);
      if(disp == 1 && f) spr(f, x*tileSize, y*tileSize, 1, 1, false, 0, tileSize,tileSize);
    }
  }
}

function getFrame(s) {
  let m = (a,b,c,d) => {
    return a==s[0] && b==s[1] && c==s[2] && d==s[3]
  }
  let f = 0;

  if(m(0,0,0,0)) f = 51;
  if(m(1,0,0,0)) f = 69;
  if(m(0,1,0,0)) f = 39;
  if(m(1,1,0,0)) f = 66;
  if(m(0,0,1,0)) f = 71;
  if(m(1,0,1,0)) f = 70;
  if(m(0,1,1,0)) f = 68;
  if(m(1,1,1,0)) f = 67;
  if(m(0,0,0,1)) f = 37;
  if(m(1,0,0,1)) f = 34;
  if(m(0,1,0,1)) f = 38;
  if(m(1,1,0,1)) f = 50;
  if(m(0,0,1,1)) f = 36;
  if(m(1,0,1,1)) f = 35;
  if(m(0,1,1,1)) f = 52;
  // if(m(1,1,1,1)) f = 4;

  return f || false;
}

function keyTyped() {
  if(key == 'c') {
    lData.data[level] = room();
  }
  if(key == 'p') {
    download(lData);
  }
  // if(key == 'b') {
  //   // pause_Button_.paused = true;
  //   pencil = true;
  // }
  // if(key == 'e') {
  //   // pause_Button_.paused = true;
  //   pencil = false;
  // }
}

function download(DATA) {
  let filename = "levelData.js";
  let text = JSON.stringify(DATA);
  // let text = "var lData = {\n\twidth : " + DATA.w + ",\n\tdata : [\n\t";
  // for (var i = 0; i < DATA.data.length; i++) {
  //   text += "\t" + JSON.stringify(DATA.data[i]) + ",\n\t";
  // }
  // text += "]\n}";
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function drawGrid() {
  // if(pencil) put('brush - ' + num, 4, 4, 48);
  // else put('eraser', 4, 4, 48);
  push();
  stroke(50);
  strokeWeight(1);
  for (var x = 0; x < D.W/tileSize+1; x++) {
    let ax = floor(x*tileSize)*D.S;
    line(ax, 0, ax, D.H*D.S);
  }
  for (var y = 0; y < D.H/tileSize+1; y++) {
    let ay = floor(y*tileSize)*D.S;
    line(0, ay, D.W*D.S, ay);
  }
  pop();
}

function room() {
  let a = new Array(25*15);
  for (var i = 0; i < a.length; i++) {
    a[i] = 0;
  }
  return a;
}

function mousePressed() {
  let x = floor(mouseX/D.S/tileSize);
  let y = floor(mouseY/D.S/tileSize);
  pencil = lData.data[level][floor(x)+floor(y)*25] == 0
}

function update() {
  let x = floor(mouseX/D.S/tileSize);
  let y = floor(mouseY/D.S/tileSize);
  let px = floor(pmouseX/D.S/tileSize);
  let py = floor(pmouseY/D.S/tileSize);
  let slope = (y-py)/(x-px), dx, dy, times;
  if(slope >= 1 || slope <= -1) {
    dy = Math.sign(y-py);
    dx = 1/slope * Math.sign(dy);
    times = abs(y-py);
  } else {
    dx = Math.sign(x-px);
    dy = slope * Math.sign(dx);
    times = abs(x-px);
  }
  if(mouseIsPressed && x < 25 && y < 25) {
    if(pencil) lData.data[level][floor(x)+floor(y)*25] = num;
    else lData.data[level][floor(x)+floor(y)*25] = 0;
    for (var i = 0; i < times; i++) {
      px += dx;
      py += dy;
      if(pencil) lData.data[level][floor(px)+floor(py)*25] = num;
      else lData.data[level][floor(px)+floor(py)*25] = 0;
    }
  }

  if(btn('up') && !pbtn('up')) {
    if(num < 2) num += 1;
  }
  if(btn('down') && !pbtn('down')) {
    if(num > 1) num -= 1;
  }

  if(btn('left') && !pbtn('left')) {
    if(lData.data[level-1]) level -= 1;
    else {
      lData.data.unshift(room());
    }
  } else if(btn('right') && !pbtn('right')) {
    level += 1;
    if(!lData.data[level]) {
      lData.data.push(room());
    }
  }
}
