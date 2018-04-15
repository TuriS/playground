class Grid {
    constructor(game, pitch) {
        this.game = game;
        this.pitch = pitch;
    }

    getGame() {
        return this.game;
    }

    getOffset(offset) {
        if(offset) return offset;
        else return this.game.camera ? this.game.camera : {x:0, y: 0};
    }

    toGrid(x,y, offset) {
        offset = this.getOffset(offset);
        return {
            x: Math.floor((x + offset.x) / this.pitch),
            y: Math.floor((y + offset.y) / this.pitch)
        };
    }

    toCoord(x, y, offset) {
        offset = this.getOffset(offset);
        return {
            x: (this.pitch * x) - offset.x,
            y: (this.pitch * y) - offset.y
        };
    }

    toCenteredCoord(x,y,offset) {
        offset = this.getOffset(offset);
        return {
            x: (this.pitch * x) - offset.x + (this.pitch / 2),
            y: (this.pitch * y) - offset.y + (this.pitch / 2)
        };
    }

    normalizeCoords(x, y, offset) {
        offset = this.getOffset(offset);
        return {
            x: this.pitch * Math.floor((x + offset.x) / this.pitch),
            y: this.pitch * Math.floor((y + offset.y) / this.pitch)
        };
    }
}