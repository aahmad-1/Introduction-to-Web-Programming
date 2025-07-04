let game

const gameOptions = {
    mageGravity: 900,
    mageSpeed: 250 
}

window.onload = function () {
    let gameConfig = {
        type: Phaser.AUTO,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 800,
            height: 1000
        },
        pixelArt: true,
        physics: {
            default: "arcade",
            arcade: {
                gravity: { 
                    y: 0 
                }
            }
        },
        scene: playGame
    };
    game = new Phaser.Game(gameConfig);
    window.focus();
};

class playGame extends Phaser.Scene {
    
    constructor() {
        super("playGame");
        this.score = 0;
    }

    preload() {
        this.load.spritesheet("mage", "assets/mage.png", {frameWidth: 32, frameHeight: 32});
        this.load.image("ground", "assets/Free Pixel Art Forest/PNG/Background layers/Layer_0001_8.png");
        this.load.image("background", "assets/Free Pixel Art Forest/Preview/Background.png");
        this.load.spritesheet("redPotion", "assets/Potions/Red Potion.png")
        this.load.spritesheet("bluePotion", "assets/Potions/Blue Potion.png");
        this.load.spritesheet("greenPotion", "assets/Potions/Green Potion.png");
    }

    create() {
        this.background = this.add.image(0, 0, 'background').setOrigin(0, 0);
        this.groundGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false,
        })    
    }

    update() {
        // Game loop logic here
    }
}