
var img = new Image();
img.src = 'mario.png'; 

var idx = 0;

function rand(min, max) {
    return Math.round(min + (Math.random() * (max - min)));
}

function choice(arr) {
    return arr[Math.round(rand(0, arr.length - 1))];
}

var Game = Sketch.create({
    fullscreen: false,
    width: 740,
    height: 410,
    container: document.getElementById('gameArea')
});



function Vec2(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.prevX = 0;
    this.prevY = 0;
}

Vec2.prototype.setPos = function (x, y) {
    this.prevX = this.x;
    this.prevY = this.y;
    this.x = x;
    this.y = y;
};

Vec2.prototype.setX = function (x) {
    this.prevX = this.x;
    this.x = x;
};

Vec2.prototype.setY = function (y) {
    this.prevY = this.y;
    this.y = y;
};

Vec2.prototype.intersects = function (obj) {
    return obj.x < this.x + this.width && obj.y < this.y + this.height &&
           obj.x + obj.width > this.x && obj.y + obj.height > this.y;
};

Vec2.prototype.intersectsLeft = function (obj) {
    return obj.x < this.x + this.width && obj.y < this.y + this.height;
};



function Player(opts) {
    this.setPos(opts.x, opts.y);
    this.width = opts.width;
    this.height = opts.height;
    this.velX = 0;
    this.velY = 0;
    this.jumpPower = -13;
}

Player.prototype = new Vec2;

Player.prototype.update = function () {
    this.velY += 1;
    this.setPos(this.x + this.velX, this.y + this.velY);

    if (this.y > Game.height || this.x + this.width < 0) {
        this.x = 150;
        this.y = 50;
        this.velX = 0;
        this.velY = 0;
        Game.jumpCount = 0;
        Game.accel = 0;
        Game.accelTween = 0;
        Game.scoreColor = '#181818';
        Game.platformMgr.maxDist = 350;
        Game.platformMgr.updateOnLose();
    }

    if ((Game.keys.UP || Game.keys.SPACE || Game.keys.W || Game.dragging) && this.velY < -8) {
        this.velY += -0.75;
    }
};

Player.prototype.draw = function () {
    Game.drawImage(img, this.x, this.y, this.width, this.height); 
};


function Platform(opts) {
    this.x = opts.x;
    this.y = opts.y;
    this.width = opts.width;
    this.height = opts.height;
    this.color = opts.color;
}

Platform.prototype = new Vec2;

Platform.prototype.draw = function () {
    Game.fillStyle = this.color;
    Game.fillRect(this.x, this.y, this.width, this.height);
};


function PlatformMgr() {
    this.maxDist = 300;
    this.colors = ['#2ca8c2', '#98cb4a', '#f76d3c', '#f15f74', '#5481e6'];

    this.first = new Platform({ x: 300, y: Game.width / 2, width: 400, height: 70 });
    this.second = new Platform({ x: (this.first.x + this.first.width) + rand(this.maxDist - 150, this.maxDist), y: rand(this.first.y - 128, Game.height - 80), width: 400, height: 70 });
    this.third = new Platform({ x: (this.second.x + this.second.width) + rand(this.maxDist - 150, this.maxDist), y: rand(this.second.y - 128, Game.height - 80), width: 400, height: 70 });

    this.first.height = this.first.y + Game.height;
    this.second.height = this.second.y + Game.height;
    this.third.height = this.third.y + Game.height;
    this.first.color = choice(this.colors);
    this.second.color = choice(this.colors);
    this.third.color = choice(this.colors);

    this.colliding = false;

    this.platforms = [this.first, this.second, this.third];
}   

PlatformMgr.prototype.update = function () {
    this.first.x -= 3 + Game.accel;
    if (this.first.x + this.first.width < 0) {
        this.first.width = rand(450, Game.width + 200);
        this.first.x = (this.third.x + this.third.width) + rand(this.maxDist - 150, this.maxDist);
        this.first.y = rand(this.third.y - 32, Game.height - 80);
        this.first.height = this.first.y + Game.height + 10;
        this.first.color = choice(this.colors);
    }

    this.second.x -= 3 + Game.accel;
    if (this.second.x + this.second.width < 0) {
        this.second.width = rand(450, Game.width + 200);
        this.second.x = (this.first.x + this.first.width) + rand(this.maxDist - 150, this.maxDist);
        this.second.y = rand(this.first.y - 32, Game.height - 80);
        this.second.height = this.second.y + Game.height + 10;
        this.second.color = choice(this.colors);
    }

    this.third.x -= 3 + Game.accel;
    if (this.third.x + this.third.width < 0) {
        this.third.width = rand(450, Game.width + 200);
        this.third.x = (this.second.x + this.second.width) + rand(this.maxDist - 150, this.maxDist);
        this.third.y = rand(this.second.y - 32, Game.height - 80);
        this.third.height = this.third.y + Game.height + 10;
        this.third.color = choice(this.colors);
    }
};

PlatformMgr.prototype.updateOnLose = function () {
    this.first.x = 300;
    this.first.color = choice(this.colors);
    this.first.y = Game.width / rand(2, 3);
    this.second.x = (this.first.x + this.first.width) + rand(this.maxDist - 150, this.maxDist);
    this.third.x = (this.second.x + this.second.width) + rand(this.maxDist - 150, this.maxDist);
};


function Particle(opts) {
    this.x = opts.x;
    this.y = opts.y;
    this.size = 10;
    this.velX = opts.velX || rand(-(Game.accel * 3) + -8, -(Game.accel * 3));
    this.velY = opts.velY || rand(-(Game.accel * 3) + -8, -(Game.accel * 3));
    this.color = opts.color;
}

Particle.prototype.update = function () {
    this.x += this.velX;
    this.y += this.velY;
    this.size *= 0.89;
};

Particle.prototype.draw = function () {
    Game.fillStyle = this.color;
    Game.fillRect(this.x, this.y, this.size, this.size);
};


Game.setup = function () {
    this.jumpCount = 0;
    this.accel = 0;
    this.accelTween = 0;

    this.player = new Player({ x: 150, y: 30, width: 48, height: 48 });

    this.platformMgr = new PlatformMgr();

    this.particles = [];
    this.particleIdx = 0;
    this.maxParticles = 20;
    this.collidedPlatform = null;
    this.scoreColor = '#181818';
    this.recordJumpCount = 0;
};

Game.update = function () {
    this.player.update();

    switch (this.jumpCount) {
        case 10:
            this.accelTween = 1;
            this.platformMgr.maxDist = 430;
            this.scoreColor = '#076C00';
            break;
        case 25:
            this.accelTween = 2;
            this.platformMgr.maxDist = 530;
            this.scoreColor = '#0300A9';
            break;
        case 40:
            this.accelTween = 3;
            this.platformMgr.maxDist = 580;
            this.scoreColor = '#9F8F00';
            break;
    }

    this.accel += (this.accelTween - this.accel) * 0.01;

    for (idx = 0; idx < this.platformMgr.platforms.length; idx++) {
        if (this.player.intersects(this.platformMgr.platforms[idx])) {
            this.collidedPlatform = this.platformMgr.platforms[idx];
            if (this.player.y < this.platformMgr.platforms[idx].y) {
                this.player.y = this.platformMgr.platforms[idx].y;
                this.player.velY = 0;
            }

            this.player.x = this.player.prevX;
            this.player.y = this.player.prevY;

            this.particles[(this.particleIdx++) % this.maxParticles] = new Particle({
                x: this.player.x,
                y: this.player.y + this.player.height,
                color: this.collidedPlatform.color
            });

            if (this.player.intersectsLeft(this.platformMgr.platforms[idx])) {
                this.player.x = this.collidedPlatform.x - 64;
                for (idx = 0; idx < 10; idx++) {
                    this.particles[(this.particleIdx++) % this.maxParticles] = new Particle({
                        x: this.player.x + this.player.width,
                        y: rand(this.player.y, this.player.y + this.player.height),
                        velY: rand(-30, 30),
                        color: choice(['#181818', '#181818', this.collidedPlatform.color])
                    });
                }
                this.player.velY = -10 + -(this.accel * 4);
                this.player.velX = -20 + -(this.accel * 4);
            } else {
                if (this.dragging || this.keys.SPACE || this.keys.UP || this.keys.W) {
                    this.player.velY = this.player.jumpPower;
                    this.jumpCount++;
                    if (this.jumpCount > this.recordJumpCount) {
                        this.recordJumpCount = this.jumpCount;
                    }
                }
            }
        }
    }

    for (idx = 0; idx < this.platformMgr.platforms.length; idx++) {
        this.platformMgr.update();
    }

    for (idx = 0; idx < this.particles.length; idx++) {
        this.particles[idx].update();
    }
};

Game.draw = function () {
    this.player.draw();

    for (idx = 0; idx < this.platformMgr.platforms.length; idx++) {
        this.platformMgr.platforms[idx].draw();
    }

    for (idx = 0; idx < this.particles.length; idx++) {
        this.particles[idx].draw();
    }

    this.font = '12pt Arial';
    this.fillStyle = '#181818';
    this.fillText('RECORD: ' + this.recordJumpCount, this.width - (150 + (this.accel * 4)), 33 - (this.accel * 4));
    this.fillStyle = this.scoreColor;
    this.font = (12 + (this.accel * 3)) + 'pt Arial';
    this.fillText('JUMPS: ' + this.jumpCount, this.width - (150 + (this.accel * 4)), 50);
};

Game.resize = function () {
};

img.onload = function() {
    Game.setup();
};  