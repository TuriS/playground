/* globals window:true document:true Phaser:true Creature: true Player: true Grid: true*/
var g;
window.onload = async function () {
    // global vars
    // await $.getScript("/js/Objects.js");
    
    var map, layer, cursors, sprite;
    // config
    let config = {
        preload: preload,
        create: create,
        render: render,
        update: update,
        resize: resize
    };

    let width = 36*32;//window.innerWidth;
    let height = 28*32;//window.innerHeight;

    let divId = 'tutorial-1';
    // create game
    const game = new Phaser.Game(width, height, Phaser.CANVAS, divId, config);
    game.grid = new Grid(game, 32);

    let coord = game.grid.toCoord;
    let grid = game.grid.toGrid;

    g = game;
    game.GAMEMODUS = {
        MOVE: 1
    };

    function getSync(url, type) {
        let request = new XMLHttpRequest();
        request.open('GET', url, false);  // `false` makes the request synchronous
        request.send(null);
        if(type ==="json") {
            return JSON.parse(request.response);
        }
        return request.response;
    }
    // preload() happens here
    function preload() {
        let creatureConfig = {
            game:   game,
            name:   "creature",
            x:      0,
            y:      0,
            width:  32,
            height: 32,
            image:  "sprites/character_1.png",
            velocity: 3
        };
        let playerConfig = getSync('/objectData/playerConfig.json','json');
        playerConfig.game = game;
        game.creatures = [
            new Player(playerConfig),
            new Creature(creatureConfig)
        ];
    
        game.player = game.creatures[0];
        game.load.image('background', 'tilemap/background.png');
        for(let i = 0; i < game.creatures.length; i++) {
            game.creatures[i].load();
        }
    }

    game.cursorEvents = (s) => {
        switch(game.modus) {
        case game.GAMEMODUS.MOVE:
            game.player.moveToPoint(s.position.x, s.position.y);
            game.modus = null;
            break;
        default:
            break;
        }
    };
    // create() happens here
    function create() {
        // load up tilemap
        // map = game.add.tilemap('tilemap');
        game.add.tileSprite(-0,0,36*32,28*32, "background");

        game.cursor = game.add.sprite(-64,-64);
        game.cursor.alpha = 1;
        let graphics = game.add.graphics(0,0);
        graphics.lineStyle(1, 0x000000, 1);
        graphics.beginFill(0x0000ff, 0.5);
        graphics.drawRect(0,0,32,32);
        graphics.fillAlpha = 1;
        game.cursor.addChild(graphics);

        game.cursor.inputEnabled = true;
        game.cursor.events.onInputDown.add((s) => {
            game.cursorEvents(s);
        });
        // set background color
        game.stage.backgroundColor = '#787878';

        // set the size of this world

        // x-offset, y-offset, width, height
        game.world.setBounds(0, 0, 36*32, 28*32);
        // set keyboard input listeners
        game.player.create();
        // for(let i = 0; i < creatures.length; i++) {
        //     creatures[i].create();
        // }
        game.cursors = game.input.keyboard.createCursorKeys();
        // game.modus = game.GAMEMODUS.MOVE;
    }

    function render() {
    }

    function update() {
        
        moveCursor(game);
        // keybordListener(game);
    }

    function moveCursor(game) {
        return (async () => {
            if(game.modus === game.GAMEMODUS.MOVE) {
                let point = game.grid.normalizeCoords(game.input.activePointer.position.x, game.input.activePointer.position.y);
                game.cursor.x = point.x;
                game.cursor.y = point.y;
            } else {
                game.cursor.x = -64;
                game.cursor.y = -64;
            }
        })();
    }

    function resize() {
    }

    function keybordListener(game) {
        let player = game.player;
        // console.log('call::update()');
        // speed of movement
        // only move one direction at a time
        if(!player.moving){
            let left    = game.input.keyboard.isDown(Phaser.Keyboard.LEFT), 
                right   = game.input.keyboard.isDown(Phaser.Keyboard.RIGHT), 
                up      = game.input.keyboard.isDown(Phaser.Keyboard.UP), 
                down    = game.input.keyboard.isDown(Phaser.Keyboard.DOWN);
            if (left && !right) {
                player.move("left");
                if (up && !down) {
                    player.move("up");
                } 
                if (down && !up) {
                    player.move("down");
                } 
            } else if (right && !left) {
                player.move("right");
                if (up && !down) {
                    player.move("up");
                } 
                if (down && !up) {
                    player.move("down");
                } 
            } else if (up && !down) {
                player.move("up");
                if (left && !right) {
                    player.move("left");
                } 
                if (right && !left) {
                    player.move("right");
                } 
            } else if (down && !up) {
                player.move("down");
                if (left && !right) {
                    player.move("left");
                } 
                if (right && !left) {
                    player.move("right");
                } 
            } 
        }
        if(!player.moving) {
            player.stop();
        }
    }
};