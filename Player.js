
function Snowball(x, y, game) {
  Actor.call(this, x, y, 12, 22, game);

  this.dir = true;

  this.bffr = {
    jump: 0
  }

  this.inertia = 0.70;
  this.idleFrame = 0;
  this.runFrame = 0;
  this.state = "slide";

  this.draw = () => {
    let run = [32,34,36,38,40,42];
    let idle = [2, 4, 6, 8];
    let jump = [96,98,100,102,104];

    let frame = 0;

    if(this.touching.bottom) {
      if(this.state == 'jump') {
        frame = jump[0];
      }
      if((btn('left') != btn('right')) /*&& !(this.touching.left || this.touching.right)*/){ // RUN
        let change = 0.4;
        if(this.inertia >= 0.8) change = 0.6;
        else this.state = 'run';
        if(change > 1) change = 1;
        this.runFrame += change;
        this.runFrame %= run.length;
        frame = run[Math.floor(this.runFrame)];
      } else if(abs(this.vel.x) > 6 || this.state == "slide") {
        this.state = "slide";
        if(this.vel.x < 0) this.dir = true;
        else this.dir = false;
        if(abs(this.vel.x) < 0.3) this.state = 'none';
        frame = 72;
      } else {
        if(this.state == 'jump') frame = jump[0];
        if(this.state != 'idle') {
          this.idleFrame = 0;
          this.state = 'idle';
        }
        this.idleFrame += 0.25;
        this.idleFrame %= idle.length;
        frame = idle[Math.floor(this.idleFrame)];
      }
      if(btn('down')) frame = 64;
    } else {
      this.state = "jump";
      let peak = 5;
      if(this.vel.y < -peak) frame = jump[1];
      else if(this.vel.y > peak) frame = jump[3];
      else frame = jump[2];
    }

    palset([48,16,63,64]);
    lset(layer.length-1);

    spr(frame, this.centre.x-16, this.centre.y-21, 2, 2, this.dir);

  }

  this.update = () => {
    // put(JSON.stringify(this.touching), 0, 0, 48);

    for (var k in this.bffr) if (this.bffr.hasOwnProperty(k)) {
      if(this.bffr[k]) this.bffr[k]--;
    }
    if(btn('a') && !pbtn('a')) this.bffr.jump = 4;

    if(this.vel.y > 0.5) this.vel.y += GRAV;

    let acc = 2;
    if(btn('left')) this.vel.x -= acc;
    if(btn('right')) this.vel.x += acc;

    if((this.touching.bottom && !btn('left') && !btn('right')) || (this.touching.bottom && abs(this.vel.x) < 6)) {
      if(this.inertia > 0.70) this.inertia -= 0.01;
      else this.inertia = 0.7;
    }
    if((btn('left') || btn('right')) && abs(this.vel.x) > 6) {
      if(this.inertia < 0.80) this.inertia += 0.005;
    }

    if(this.touching.bottom) {
      if(btn('left') && !btn('right')) this.dir = true;
      if(btn('right') && !btn('left')) this.dir = false;
    }

    if(this.touching.bottom && this.bffr.jump) {
      this.bffr.jump = 0;
      this.vel.y = JUMP - abs(this.vel.x/3);
    }
    if(!btn('a') && !this.touching.bottom && this.vel.y < 0) this.vel.y += GRAV*1.5;

    this.doPhysics();
  }
}
