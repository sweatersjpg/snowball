
function Actor(x, y, w, h, game) {
  game.actors.push(this);
  this.w = w;
  this.h = h;
  this.pos = new Vector(x, y);
  this.ppos = this.pos.copy();
  this.centre = this.pos.copy().add(this.w/2, this.h/2);
  this.vel = new Vector(0,0);
  this.collisions = [];
  this.touching = { top: false, bottom: false, left: false, right: false, timer: [0,0,0,0]}
  this.wasTouching = { top: false, bottom: false, left: false, right: false, timer: [0,0,0,0]}
  this.inertia = 0.80;
  this.movable = true;
  this.solid = true;
  this.bounce = 0;
  this.color = 63;

  this.remove = () => {
    game.actors.splice(game.actors.indexOf(this), 1);
  }

  this.update = () => {
    // this.vel.x = ((mouseX/D.S-this.w/2)-this.pos.x)/5;
    // this.vel.y = ((mouseY/D.S-this.h/2)-this.pos.y)/5;
    this.doPhysics();
  }
  this.draw = () => {this.debug()}
  this.debug = () => {
    push();
    if(this.collided()) fill(0);
    else noFill();
    stroke(255);
    rect(this.pos.x*D.S, this.pos.y*D.S, this.w*D.S, this.h*D.S);
    pop();
    palset([48,63,64]);
    lset(3);
    spr(0,this.pos.x,this.pos.y, 1,1, false, 0, this.w, this.h);
  }

  this.doPhysics = () => {

    this.vel.y += GRAV;
    this.vel.y *= AIR_RES;
    this.vel.x *= this.inertia;
    if(abs(this.vel.x) < 0.01) {
      this.vel.x = 0;
      this.pos.x = floor(this.pos.x);
    }
    if(abs(this.vel.y) < 0.01){
      this.vel.y = 0;
      this.pos.y = floor(this.pos.y);
    }
  }

  this.doCollision = () => {
    this.ppos = this.pos.copy();

    let t = Object.values(this.touching);
    let wt = Object.values(this.wasTouching);
    for (var i = 0; i < t.length-1; i++) if(t[i] && !wt[i]) this.touching.timer[i] = 2;
    this.wasTouching = Object.assign({}, this.touching);
    let keys = Object.keys(this.touching);
    for (var i = 0; i < keys.length-1; i++) {
      if(this.touching.timer[i] > 0) this.touching.timer[i]--;
      else this.touching[keys[i]] = false;
    }

    if(this.ghost) {
      this.ghost = false;
      for (var a of game.actors)
      if(a != this && a.type != 'player' && this.actorCollided(a)) this.ghost = true;
    }

    // ------- X -------
    let steps = floor(abs(this.vel.x)/(tileSize+this.w))+1;
    let sign = this.vel.x/abs(this.vel.x);
    let oldX = this.pos.x;
    for (var i = 0; i < steps; i++) {
      oldX = this.pos.x;
      this.pos.x += this.vel.x/steps;
      if(this.collided()) {
        if(sign > 0) this.touching.right = true;
        else this.touching.left = true;
        this.pos.x = round(oldX);
        while(!this.collided()) {
          oldX = this.pos.x;
          this.pos.x += sign;
        }
        this.pos.x = oldX;
        this.vel.x *= -this.bounce;
        break;
      }
    }
    // -------- Y --------
    steps = floor(abs(this.vel.y)/(tileSize+this.h))+1;
    sign = this.vel.y/abs(this.vel.y);
    let oldY = this.pos.y;
    for (var i = 0; i < steps; i++) {
      oldY = this.pos.y;
      this.pos.y += this.vel.y/steps;
      if(this.collided(oldY)) {
        if(sign > 0) this.touching.bottom = true;
        else this.touching.top = true;
        this.pos.y = round(oldY);
        while(!this.collided(oldY)) {
          oldY = this.pos.y;
          this.pos.y += sign;
        }
        this.pos.y = oldY;
        this.vel.y *= -this.bounce;
        break;
      }
    }
    this.centre = this.pos.copy().add(this.w/2, this.h/2);
  }

  this.getTouching = (buffer) => {
    let buf = buffer || 0;
    let room = this.getRoom();
    let pos = new Vector(this.pos.x%400, this.pos.y%240);

    if(typeof oldY === 'undefined') oldY = this.pos.y;
    let tile = {
      left:   floor((pos.x - buf) / tileSize),
      right:  floor((pos.x + buf + this.w -1) / tileSize),
      top:    floor((pos.y - buf) / tileSize),
      bottom: floor((pos.y + buf + this.h -1) / tileSize)
    }

    if(tile.left < 0) tile.left = 0;
    if(tile.right > 25) tile.right = 25;
    if(tile.top < 0) tile.top = 0;
    if(tile.bottom > 15) tile.bottom = 15;

    if(tile.bottom < 1) tile.bottom = 1;
    if(tile.right < 1) tile.right = 1;
    if(tile.left > 24) tile.left = 24;
    if(tile.top > 14) tile.top = 14;

    let touching = { top: 0, bottom: 0, left: 0, right: 0 }

    for (var x = tile.left; x <= tile.right; x++) {
      if(lData.levels[game.level].rooms[room][x+tile.top*25] == 1 && !(x < 0 || x > 25))
      touching.top++;
      if(lData.levels[game.level].rooms[room][x+tile.bottom*25] == 1 && !(x < 0 || x > 25))
      touching.bottom++;
    }
    for (var y = tile.top; y <= tile.bottom; y++) {
      if(lData.levels[game.level].rooms[room][tile.left+y*25] == 1 && !(x < 0 || x > 25))
      touching.left++;
      if(lData.levels[game.level].rooms[room][tile.right+y*25] == 1 && !(x < 0 || x > 25))
      touching.right++;
    }

    let highest = 0;
    for (var t in touching)
    if (touching.hasOwnProperty(t))
    if(touching[t] > highest) highest = touching[t];
    if(highest) for (var t in touching) if (touching.hasOwnProperty(t)) {
      touching[t] -= highest-1;
      if(touching[t] < 0) touching[t] = 0;
    }

    return touching;
  }

  this.resolveStuck = (N) => {
    let count = 0;
    if(typeof N != 'undefined') count = N;

    if(count++ > 100) return false;

    let touching = this.getTouching();

    let sum = 0;
    for(var t in touching)
    if(touching.hasOwnProperty(t)) sum += touching[t];

    if(sum == 0) return true;
    if(sum == 4) return false;

    if(touching.left)   this.pos.x++;
    if(touching.right)  this.pos.x--;
    if(touching.top)    this.pos.y++;
    if(touching.bottom) this.pos.y--;

    return this.resolveStuck(count);
  }

  this.collided = (oldY) => {
    let room = this.getRoom();
    let pos = new Vector(this.pos.x%400, this.pos.y%240);

    if(typeof oldY === 'undefined') oldY = this.pos.y;
    let tile = {
      left:   floor((pos.x) / tileSize),
      right:  floor((pos.x + this.w -1) / tileSize),
      top:    floor((pos.y) / tileSize),
      bottom: floor((pos.y + this.h -1) / tileSize)
    }

    if(tile.left < 0) tile.left = 0;
    if(tile.right > 25) tile.right = 25;
    if(tile.top < 0) tile.top = 0;
    if(tile.bottom > 15) tile.bottom = 15;

    if(tile.bottom < 1) tile.bottom = 1;
    if(tile.right < 1) tile.right = 1;
    if(tile.left > 24) tile.left = 24;
    if(tile.top > 14) tile.top = 14;

    let anyCollision = false;
    for (var i = tile.left; i <= tile.right; i++)
    for (var j = tile.top; j <= tile.bottom; j++) {
      let t = lData.levels[game.level].rooms[room][i+j*25];
      if(t == 1 && DEBUG) {
        lset(0);
        palset([6,63,64]);
        spr(0, i*tileSize + floor(this.pos.x/400)*400, j*tileSize + floor(this.pos.y/240)*240);
      }
      if(t == 1 && !(i < 0 || i >= 25)) anyCollision = true;
    }
    if(anyCollision) anyCollision = {immovable:true}

    let actorCollision = false;
    for (let a of game.actors) {
      if(!a.immovable) {
        if(a == this) continue;
        if((a.type == 'player' && this.type != 'player')) continue;
        if(oldY+this.h > a.pos.y && (this.type == 'player' || this.ghost)) continue;
        if(this.type == 'player' && btn('down', this.pn)) continue;
      }
      if(this.actorCollided(a)) actorCollision = a;
    }
    if(!anyCollision && actorCollision) anyCollision = actorCollision;

    return anyCollision;
  }

  this.getRoom = (previous) => {
    if(previous) {
      let roomy = Math.floor(this.ppos.y/240);
      let roomx = Math.floor(this.ppos.x/400) % lData.levels[game.level].width;
      return roomx + roomy * lData.levels[game.level].width;
    }
    let roomy = Math.floor(this.pos.y/240);
    let roomx = Math.floor(this.pos.x/400) % lData.levels[game.level].width;
    return roomx + roomy * lData.levels[game.level].width;
  }

  this.actorCollided = (a) => {
    let x, y;
    x = floor(this.pos.x+this.w) > floor(a.pos.x) && floor(a.pos.x+a.w) > floor(this.pos.x);
    y = floor(this.pos.y+this.h) > floor(a.pos.y) && floor(a.pos.y+a.h) > floor(this.pos.y);
    return x && y;
  }
}
