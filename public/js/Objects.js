const SETTINGS = {
    MOVE_TIME: 10
};

function setIntervalX(callback, delay, repetitions, final) {
    var x = 0;
    var intervalID = window.setInterval(function () {
       callback();
       if (++x === repetitions) {
           window.clearInterval(intervalID);
           final();
       }
    }, delay);
}

class GameObject {
    constructor(config) {
        this.game = config.game;
        this.name = config.name;
        this.x = config.x;
        this.y = config.y;
        this.width = config.width;
        this.height = config.height;
        this.image = config.image;
    }

    load() {
        this.game.load.image(this.name, this.image);
    }

    create() {
        let game = this.game;
    }
}

class Creature extends GameObject {
    constructor(config) {
        super(config);
        this.velocity = config.velocity;
        this.moving   = false;
        this.visible = false;
    }
    load() {
        this.game.load.spritesheet(this.name, this.image, 32, 32, 12)
    }

    create() {
        let game = this.game;
        this.sprite = game.add.sprite(32, 32, this.name);
        let sprite = this.sprite;
        // set to first frame (0 = top left block)
        sprite.animations.frame = 0;
        // set the anchor for sprite to middle of the view
        sprite.anchor.setTo(0.5);
        // tell camera to follow sprite now
        // enable game physics on sprite
        game.physics.enable(sprite, Phaser.Physics.ARCADE);
        // set sprite to hit boundaries of our world bounds
        sprite.body.collideWorldBounds = true;
        sprite.animations.add('down', [0, 1, 2], 10, true);
        sprite.animations.add('left', [3, 4, 5], 10, true);
        sprite.animations.add('right', [6, 7, 8], 10, true);
        sprite.animations.add('up', [9, 10, 11], 10, true);
    }

    move(direction) {
        let _this = this;
        return (async function(direction) {
            switch (direction) {
                case "down":
                    _this.sprite.animations.play('down');
                    _this.sprite.y += _this.velocity;
                    break;
                case "left":
                    _this.sprite.x -= _this.velocity;
                    _this.sprite.animations.play('left');
                    break;
                case "right":
                    _this.sprite.x += _this.velocity
                    _this.sprite.animations.play('right');
                    break;
                case "up":
                    _this.sprite.y -= _this.velocity;
                    _this.sprite.animations.play('up');
                    break;
                default:
                    break;
            }
        })(direction);
    }

    stop() {
        this.sprite.animations.stop();
    }
}

class Player extends GameObject {
    constructor(config) {
        super(config);
        this.velocity = config.velocity;
        this.moving   = false;
    }

    load() {
        this.game.load.spritesheet(this.name, this.image, 32, 32, 12)
    }

    create() {
        let game = this.game;
        this.sprite = game.add.sprite(0, 0, this.name);
        let sprite = this.sprite;
        // set to first frame (0 = top left block)
        sprite.animations.frame = 0;
        // set the anchor for sprite to middle of the view
        sprite.anchor.setTo(0.5);
        // tell camera to follow sprite now
        game.camera.follow(sprite);
        // enable game physics on sprite
        game.physics.enable(sprite, Phaser.Physics.ARCADE);
        // set sprite to hit boundaries of our world bounds
        sprite.body.collideWorldBounds = true;
        sprite.animations.add('down', [0, 1, 2], 10, true);
        sprite.animations.add('left', [3, 4, 5], 10, true);
        sprite.animations.add('right', [6, 7, 8], 10, true);
        sprite.animations.add('up', [9, 10, 11], 10, true);
    }

    move(direction) {
        let _this = this;
        this.moving = true;
        switch (direction) {
            case "down":
                _this.sprite.animations.play('down');
                setIntervalX(function() {
                    _this.sprite.y += 1;
                }, SETTINGS.MOVE_TIME, 32, function(){
                    _this.moving = false;
                    _this.stop();
                });
                break;
            case "left":
                _this.sprite.animations.play('left');
                setIntervalX(function() {
                    _this.sprite.x -= 1;
                }, SETTINGS.MOVE_TIME, 32, function(){
                    _this.moving = false;
                    _this.stop();
                });
                break;
            case "right":
                _this.sprite.animations.play('right');
                setIntervalX(function() {
                    _this.sprite.x += 1
                }, SETTINGS.MOVE_TIME, 32, function(){
                    _this.moving = false;
                    _this.stop();
                });
                break;
            case "up":
                _this.sprite.animations.play('up');
                setIntervalX(function() {
                    _this.sprite.y -= 1
                }, SETTINGS.MOVE_TIME, 32, function(){
                    _this.moving = false;
                    _this.stop();
                });
                break;
            default:
                break;
        }
    }

    stop() {
        this.sprite.animations.stop();
    }
}