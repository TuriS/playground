/* globals window:true document:true Phaser:true Creature: true Player: true*/
var game;
window.onload = async function () {
    // global vars
    await $.getScript("/js/phaser.js");
    await $.getScript("/js/Objects.js");
    
    

    
    var map, layer, cursors, sprite;
    // config
    let config = {
        preload: preload,
        create: create,
        render: render,
        update: update,
        resize: resize
    };
    let width = 800;//window.innerWidth;
    let height = 600;//window.innerHeight;
    let divId = 'tutorial-1';
    // create game
    game = new Phaser.Game(width, height, Phaser.CANVAS, 'tutorial-1', config);

    let playerConfig = await $.getJSON("/objectData/playerConfig.json");
    playerConfig.game = game;

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

    let creatures = [
        new Player(playerConfig),
        new Creature(creatureConfig)
    ];

    let player = creatures[0];

    // preload() happens here
    function preload() {
        console.log('call::preload()');
        // preload tilemap
        game.load.tilemap('tilemap', 'tilemap/testMap.json', null, Phaser.Tilemap.TILED_JSON);

        // preload tile asset for tilemap
        game.load.image('tiles', 'tilemap/mountainlandscape.png');
        // creatures[0].load();
        for(let i = 0; i < creatures.length; i++) {
            creatures[i].load();
        }
    }

    // create() happens here
    function create() {
        console.log('call::create()');
        // load up tilemap
        map = game.add.tilemap('tilemap');

        // link loaded tileset image to map
        map.addTilesetImage('tileset', 'tiles');

        // create laye for said tileset and map now!
        layer = map.createLayer('layer1');
        // set background color
        game.stage.backgroundColor = '#787878';
        // set the size of this world
        // x-offset, y-offset, width, height
        game.world.setBounds(0, 0, 800, 800);
        // set keyboard input listeners
        creatures[0].create();
        // for(let i = 0; i < creatures.length; i++) {
        //     creatures[i].create();
        // }
        cursors = game.input.keyboard.createCursorKeys();
    }

    function render() {
        // console.log('call::render()');
        // add a transparent green fill to sprite
        // game.debug.spriteBounds(sprite);
    }

    function update() {
        // console.log('call::update()');
        // speed of movement
        // only move one direction at a time
        if(!player.moving){
            if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT) && !game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                player.move("left");
                if (game.input.keyboard.isDown(Phaser.Keyboard.UP) && !game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
                    player.move("up");
                } 
                if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN) && !game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                    player.move("down");
                } 
            } 
            if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT) && !game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                player.move("right");
                if (game.input.keyboard.isDown(Phaser.Keyboard.UP) && !game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
                    player.move("up");
                } 
                if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN) && !game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                    player.move("down");
                } 
            } 
            if (game.input.keyboard.isDown(Phaser.Keyboard.UP) && !game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
                player.move("up");
                if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT) && !game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                    player.move("left");
                } 
                if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT) && !game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                    player.move("right");
                } 
            } 
            if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN) && !game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                player.move("down");
                if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT) && !game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                    player.move("left");
                } 
                if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT) && !game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                    player.move("right");
                } 
            } 
        }
        if(!player.moving) {
            player.stop();
        }

        if(player.sprite.x>700 && !creatures[1].visible) {
            creatures[1].visible = true;
            creatures[1].create();
            console.log("action");
        }
        

    }

    function resize() {
        // console.log('call::resize()');
    }
    var lastX, lastY;
    function touchHandler(e) {
        if (e.touches) {
            e.preventDefault();

            var currentY = e.touches[0].clientY;
            var currentX = e.touches[0].clientX;
            if(!player.moving){
                if (currentY > lastY) {
                    player.move("down");
                    // alert('down');
                } else if (currentY < lastY) {
                    // alert('up');
                    player.move("up");
                }

                if (currentX > lastX) {
                    player.move("right");
                } else if (currentX < lastX) {
                    player.move("left");
                }
                lastY = currentY;
                lastX = currentX;
            }
        }
    }
    // document.addEventListener("touchstart", touchHandler);
    document.addEventListener("touchmove", touchHandler);
};