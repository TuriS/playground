/* globals Phaser:true, game: true*/
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

function setTimeoutAsync(time) {
    return new Promise((resolve, reject) => {
        window.setTimeout(() => {
            resolve();
        },time);
    });
}
function calculateMenuCoordinates(menuPoints, centerPoint) {
    let deg = (2 * Math.PI) / menuPoints.length;
    let radius = 40;
    for(let i = 0; i < menuPoints.length; i++) {
        menuPoints[i].coord = {
            x: centerPoint.x + radius * Math.sin(i*deg),
            y: centerPoint.y - radius * Math.cos(i*deg)
        };
    }
}
class Menu {
    constructor(object, menuPoints, game) {
        this.menuPoints = menuPoints;
        this.game = game;
        this.object = object;
        this.visible = false;
        
        
        this.menu = game.add.group();
        this.menu.inputEnableChildren = true;
    }

    init() {
        this.visible = true;
        let menuPoints = this.menuPoints;
        calculateMenuCoordinates(menuPoints, {
            x: this.object.sprite.x,
            y: this.object.sprite.y
        });
        for(let i in menuPoints) {
            this.sprite = this.game.add.sprite(menuPoints[i].coord.x, menuPoints[i].coord.y);
            let graphics = this.game.add.graphics(0,0);
            graphics.lineStyle(1, 0x000000, 1);
            graphics.beginFill(0x0000ff, 0.5);
            graphics.drawCircle(0,0,32);
            graphics.fillAlpha = 0;
            this.sprite.addChild(graphics);
            this.menu.add(this.sprite);
            this.sprite.events.onInputDown.add((s) => {
                if(menuPoints[i].fn) {
                    menuPoints[i].fn();
                }
            });
        }
        this.menu.onChildInputDown.add((p, m) => {
            this.destroy();
        });
    }

    destroy() {
        this.visible = false;
        while(this.menu.children.length > 0 ) {
            this.menu.children[0].destroy();
        }
    }
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
        this.game.load.spritesheet(this.name, this.image, 32, 32, 12);
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
        return (async (direction) => {
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
                _this.sprite.x += _this.velocity;
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
        this.game.load.spritesheet(this.name, this.image, 32, 32, 12);
    }

    create() {
        const game = this.game;
        this.sprite = game.add.sprite(this.x, this.y, this.name);
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
        sprite.animations.add('down',   [0, 1, 2], 10, true);
        sprite.animations.add('left',   [3, 4, 5], 10, true);
        sprite.animations.add('right',  [6, 7, 8], 10, true);
        sprite.animations.add('up',     [9, 10, 11], 10, true);
        sprite.inputEnabled = true;
        sprite.input.useHandCursor = true;

        let menu = [
            { name: "walk", fn: ()=>{game.modus = game.GAMEMODUS.MOVE;} },
            { name: "walk", fn: ()=>{game.modus = null;} },
            { name: "walk", fn: null },
            { name: "walk", fn: null },
            { name: "walk", fn: null },
        ];
        this.menu = new Menu(this, menu, this.game);

        sprite.events.onInputDown.add((sprit, pointer)=> {
            if(this.menu.visible) {
                this.menu.destroy();
                this.menu.visible = false;
            } else {
                this.menu.init();
                this.menu.visible = true;
            }
            
        }, this);
    }

    move(direction) {
        let _this = this;
        this.moving = true;
        if(_this.menu.visible) return;
        return (async (_this) => {
            switch (direction) {
            case "down":
                _this.sprite.animations.play('down');
                for(let i = 0; i < 32; i++) {
                    _this.sprite.y += 1;
                    await setTimeoutAsync(10);
                }
                _this.moving = false;
                _this.stop();
                break;
            case "left":
                _this.sprite.animations.play('left');
                for(let i = 0; i < 32; i++) {
                    _this.sprite.x -= 1;
                    await setTimeoutAsync(10);
                }
                _this.moving = false;
                _this.stop();
                break;
            case "right":
                _this.sprite.animations.play('right');
                for(let i = 0; i < 32; i++) {
                    _this.sprite.x += 1;
                    await setTimeoutAsync(10);
                }
                _this.moving = false;
                _this.stop();
                break;
            case "up":
                _this.sprite.animations.play('up');
                for(let i = 0; i < 32; i++) {
                    _this.sprite.y -= 1;
                    await setTimeoutAsync(10);
                }
                _this.moving = false;
                _this.stop();
                break;
            case "up left":
                _this.sprite.animations.play('up');
                for(let i = 0; i < 32; i++) {
                    _this.sprite.y -= 1;
                    _this.sprite.x -= 1;
                    await setTimeoutAsync(10);
                }
                _this.moving = false;
                _this.stop();
                break;
            case "up right":
                _this.sprite.animations.play('up');
                for(let i = 0; i < 32; i++) {
                    _this.sprite.y -= 1;
                    _this.sprite.x += 1;
                    await setTimeoutAsync(10);
                }
                _this.moving = false;
                _this.stop();
                break;
            case "down left":
                _this.sprite.animations.play('down');
                for(let i = 0; i < 32; i++) {
                    _this.sprite.y += 1;
                    _this.sprite.x -= 1;
                    await setTimeoutAsync(10);
                }
                _this.moving = false;
                _this.stop();
                break;
            case "down right":
                _this.sprite.animations.play('down');
                for(let i = 0; i < 32; i++) {
                    _this.sprite.y += 1;
                    _this.sprite.x += 1;
                    await setTimeoutAsync(10);
                }
                _this.moving = false;
                _this.stop();
                break;
            default:
                return;
            }
        })(_this);
    }

    moveToPoint(x, y) {
        let xSteps = (0.5 + (x - this.sprite.position.x)/32);
        let ySteps = (0.25 + (y - this.sprite.position.y)/32);
        let xStepsAbs = Math.abs(xSteps);
        let yStepsAbs = Math.abs(ySteps);
        (async () => {
            for(let i = 0, j = 0; i < xStepsAbs || j < yStepsAbs; i++, j++) {
                if(i < xStepsAbs && j < yStepsAbs) {
                    if(xSteps > 0) {
                        if(ySteps < 0) {
                            await this.move("up right");
                        } else {
                            await this.move("down right");
                        }
                    } else {
                        if(ySteps < 0) {
                            await this.move("up left");
                        } else {
                            await this.move("down left");
                        }
                    }
                } else {
                    if(i < xStepsAbs){
                        if(xSteps > 0) {
                            await this.move("right");
                        } else {
                            await this.move("left");
                        }
                    }
                    if(j < yStepsAbs){
                        if(ySteps < 0) {
                            await this.move("up");
                        } else {
                            await this.move("down");
                        }
                    }
                }
                
            }
        })();
    }
    stop() {
        this.sprite.animations.stop();
    }
}