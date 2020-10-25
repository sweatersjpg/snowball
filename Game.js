// Co-op game
// sweatersjpg

let tileSize = 16;
let tilemap = {
  s: tileSize,
  w: Math.floor(D.W/this.s),
  h: Math.floor(D.H/this.s)
}

level = 0;

const DEBUG = false;

const GRAV = 1;
const AIR_RES = 1;
const JUMP = -10;

function init_() {
  setSpriteSheet("spriteSheet");
  setNumberOfLayers(6);
  lset(1);

  disableScroll();
}

// ------- main loops -------

function Game(level) {
  this.level = level;
  this.actors = [];
  snowball = new Snowball(32, 32, this);

  this.draw = () => {
    cls(63);

    for (let a of this.actors) a.update();
    for (let a of this.actors) a.doCollision();

    let xoff = snowball.pos.x - 200;
    let yoff = snowball.pos.y - 120;

    for (var i = 0; i < lData.levels[this.level].rooms.length; i++) {
      let width = lData.levels[this.level].width;
      let room = lData.levels[this.level].rooms[i];
      setCamera(i%width * 400 - xoff, floor(i/width) * 240 - yoff);
      DrawMap(this.level, i);
    }
    // DrawMap(this.level, snowball.getRoom());
    setCamera(-xoff, -yoff);

    for (let a of this.actors) a.draw();

  }

  this.focus = (e) => { this.focused = true; }
  this.blur = (e) => { this.focused = false; }
}
