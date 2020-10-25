

function levelEditor(level) {
  this.level = level;
  this.room = 0;
  this.drawing = false;
  this.width = lData.levels[this.level].width;
  this.uiT = 0;

  this.num = 1;
  this.drawing = false;

  this.draw = () => {
    cls(63);
    DrawMap(this.level, this.room);

    this.drawGrid();
    this.update();

    this.ui();
  }

  this.update = () => {
    lData.levels[this.level].width = this.width;
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
    if(mouseIsPressed && x < 25 && y < 15) {
      if(this.drawing) lData.levels[this.level].rooms[this.room][floor(x)+floor(y)*25] = this.num;
      else lData.levels[this.level].rooms[this.room][floor(x)+floor(y)*25] = 0;
      for (var i = 0; i < times; i++) {
        px += dx;
        py += dy;
        if(this.drawing) lData.levels[this.level].rooms[this.room][floor(px)+floor(py)*25] = this.num;
        else lData.levels[this.level].rooms[this.room][floor(px)+floor(py)*25] = 0;
      }
    }

  }

  this.ui = () => {
    lset(0);
    let str = `level ${this.level}`;
    put(str, 400 - str.length*8, 240 - 8, 48);

    if(!this.uiT) return;
    else this.uiT--;

    let w = this.width;
    for (var i = 0; i < lData.levels[this.level].rooms.length; i++) {
      let size = 8;
      let x = (i % w) * (size*1.5 + 2);
      let y = floor(i/w) * (size + 2);
      lset(0);
      if(i == this.room) {
        palset([48,64,64]);
        spr(0, x, y, 1, 1, false, 0, floor(size*1.5) + 4, floor(size) + 4);
      }
      palset([0,64,64]);
      if(!lData.levels[this.level].rooms[i].includes(1)) {
        push();
        noFill();
        // strokeWeight(1);
        stroke(64);
        rect((2 + x)*D.S, (2 + y)*D.S, floor(size*1.5) * D.S, floor(size) * D.S);
        pop();
      } else spr(0, 2 + x, 2 + y, 1, 1, false, 0, floor(size*1.5), floor(size));

    }

  }

  this.mousedown = (e) => {
    let x = floor(mouseX/D.S/tileSize);
    let y = floor(mouseY/D.S/tileSize);
    this.drawing = lData.levels[this.level].rooms[this.room][floor(x)+floor(y)*25] == 0
  }

  this.keydown = (e) => {
    this.uiT = 3*FRAMERATE;
    let x = this.room%this.width;
    let y = floor(this.room/this.width);
    if(e.keyCode == 38) { // up
      if(y == 0) {
        for (var i = 0; i < this.width; i++) lData.levels[this.level].rooms.unshift(room());
      } else {
        removeEmptyRow(this.level, y);
        this.room -= this.width;
      }
    } else if (e.keyCode == 40) { // down
      if(y == floor(lData.levels[this.level].rooms.length/this.width)-1) {
        for (var i = 0; i < this.width; i++) lData.levels[this.level].rooms.push(room());
      } else if(removeEmptyRow(this.level, y)) this.room -= this.width;
      this.room += this.width;
    } else if (e.keyCode == 37) { // left
      if(x == 0) {
        let d = floor(lData.levels[this.level].rooms.length/this.width);
        for (var i = 0; i < d; i++) {
          lData.levels[this.level].rooms.splice(i*this.width+i, 0, room());
        }
        this.width += 1;
        this.room += y;
      } else {
        if(removeEmptyCol(this.level, x)) {
          this.width -= 1;
          this.room -= y;
        }
        this.room -= 1;
      }
    } else if (e.keyCode == 39) { // right
      if(x == this.width-1) {
        let d = floor(lData.levels[this.level].rooms.length/this.width);
        for (var i = 0; i < d; i++) {
          lData.levels[this.level].rooms.splice((i+1)*this.width+i, 0, room());
        }
        this.width += 1;
        this.room += y+1;
      } else {
        if(removeEmptyCol(this.level, x)) {
          this.width -= 1;
          this.room -= y;
        } else this.room += 1;
      }
    } else if (e.keyCode == 188) { // down a level
      if(this.level) this.level --;
      this.room = 0;
      this.width = lData.levels[this.level].width;
    } else if (e.keyCode == 190) { // up a level
      this.level ++;
      if(!lData.levels.length <= this.level){
        lData.levels.push({
          width: 1,
          rooms: [room()]
        });
      }
      this.room = 0;
      this.width = lData.levels[this.level].width;
    } else if (e.key == 'c') { // clear
      lData.levels[this.level].rooms[this.room] = room();
    } else if (e.key == 'p') {
      let data = Object.assign({}, lData);
      for (var l of data.levels)
      for (var r of l.rooms) l.rooms[l.rooms.indexOf(r)] = compress(r);
      let text = "var lData = \n" + JSON.stringify(data);
      text += "\nfor(var l of lData.levels)\nfor(var r of l.rooms) l.rooms[l.rooms.indexOf(r)]=uncompress(r);"
      download("levelData.js", text);
      for (var l of lData.levels)
      for (var r of l.rooms) l.rooms[l.rooms.indexOf(r)] = uncompress(r);
    }
  }

  this.drawGrid = () => {
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
}

function removeEmptyRow(l, y) {
  level = lData.levels[l];
  total = 0;
  empty = 0;
  for (var x = 0; x < level.width; x++) {
    total++;
    if(!level.rooms[x+y*level.width].includes(1)) empty++;
  }
  if(empty == total) {
    for (var x = 0; x < level.width; x++) level.rooms[x+y*level.width] = -1;
    for (var i = level.rooms.length-1; i >= 0; i--) if(level.rooms[i] == -1) level.rooms.splice(i, 1);
    return true;
  } else return false;
}

function removeEmptyCol(l, x) {
  level = lData.levels[l];
  total = 0;
  empty = 0;
  for (var y = 0; y < level.rooms.length/level.width; y++) {
    total++;
    if(!level.rooms[x+y*level.width].includes(1)) empty++;
  }
  if(empty == total) {
    for (var y = 0; y < level.rooms.length/level.width; y++) level.rooms[x+y*level.width] = -1;
    for (var i = level.rooms.length-1; i >= 0; i--) if(level.rooms[i] == -1) level.rooms.splice(i, 1);
    return true;
  } else return false;
}

function room() {
  let a = new Array(25*15);
  for (var i = 0; i < a.length; i++) {
    a[i] = 0;
  }
  return a;
}

function DrawMap(level, room, off) {
  lset(0);
  let offset = off*400;

  if(room == -1 || room == lData.levels[level].rooms[room].length) {
    // palset([63,63,64]);
    // spr(0,0-round(masterX)+offset,0,1,1,false,0,D.W,D.H);
  } else {
    // console.log(lData.levels[drawFN.level].rooms[room]);
    for (var i = 0; i < lData.levels[level].rooms[room].length; i++) {
      let data = lData.levels[level].rooms[room];
      let disp = lData.levels[level].rooms[room][i];
      let y = floor(i/25);
      let x = i%25;
      let sides = [data[(x+1)+y*25],data[x+(y-1)*25],data[(x-1)+y*25],data[x+(y+1)*25]];
      if(x == 24) {
        sides[0] = 0;
        if(sides[1] == 0 && sides[2] == 0) sides[0] = 0;
      }
      if(x == 0) sides[2] = 0;
      for (var j = 0; j < sides.length; j++) if(typeof sides[j] === 'undefined') sides[j] = 0;

      let ns = 0.1;
      let nv = noise(x * ns, y * ns);
      let n = 0;
      let bffr = 0.08;
      let mid = 0.5;
      if(nv < mid) n = 2;
      if(nv < mid+bffr && nv > mid-bffr) n = 1;

      let f = getFrame(sides, n);

      // cx = room % lData.levels[level].width * 400;
      // cy = floor(room / lData.levels[level].width * 240);

      // let c = [37, 38, 39][n];
      let c = 64;
      palset([45,c,64]);
      if(disp == 1 && f) spr(f, x*tileSize, y*tileSize, 1, 1, false, 0, tileSize,tileSize);
    }
  }
}

function getFrame(s, n) {
  let m = (a,b,c,d) => {
    return a==s[0] && b==s[1] && c==s[2] && d==s[3]
  }
  let f = false;

  let tilesets = [12, 12, 12];
  let ts = tilesets[n]; // 32: overgrown industrial, 96: natural
  // ts = 52;

  if(m(0,0,0,0)) f = 0 +ts;
  if(m(1,0,0,0)) f = 1 +ts;
  if(m(0,1,0,0)) f = 48+ts;
  if(m(1,1,0,0)) f = 49+ts;
  if(m(0,0,1,0)) f = 3 +ts;
  if(m(1,0,1,0)) f = 2 +ts;
  if(m(0,1,1,0)) f = 51+ts;
  if(m(1,1,1,0)) f = 50+ts;
  if(m(0,0,0,1)) f = 16+ts;
  if(m(1,0,0,1)) f = 17+ts;
  if(m(0,1,0,1)) f = 32+ts;
  if(m(1,1,0,1)) f = 33+ts;
  if(m(0,0,1,1)) f = 19+ts;
  if(m(1,0,1,1)) f = 18+ts;
  if(m(0,1,1,1)) f = 35+ts;
  if(m(1,1,1,1)) f = 34+ts;

  return f;
}

let eventsToAdd = ['keydown', 'mousedown', 'dblclick', 'blur', 'focus'];
for (let EVENT of eventsToAdd)
window.addEventListener(EVENT, e => {
  if(!pause_Button_.paused && drawFN && drawFN[EVENT]) drawFN[EVENT](e);
});

function download(filename, DATA) {
  let text = DATA;
  // let filename = "levelData.js";
  // let text = "var lData = \n" + JSON.stringify(DATA);
  // text += "\nfor (var l of lData.levels)\nfor (var r of l.rooms) r = uncompress(r);";

  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function disableScroll() {
  var keys = {37: 1, 38: 1, 39: 1, 40: 1};
  function preventDefault(e) { e.preventDefault(); }
  function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
      preventDefault(e);
      return false;
    }
  }
  var supportsPassive = false;
  try {
    window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
      get: function () { supportsPassive = true; }
    }));
  } catch(e) {}
  var wheelOpt = supportsPassive ? { passive: false } : false;
  var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';
  window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
  window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
  window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
  window.addEventListener('keydown', preventDefaultForScrollKeys, false);
}
