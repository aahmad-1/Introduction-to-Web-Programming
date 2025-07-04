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
        //Character, background, ground, and potion assets
        this.load.spritesheet("mage", "assets/mage.png", {frameWidth: 32, frameHeight: 32});
        this.load.image("ground", "assets/Free Pixel Art Forest/PNG/Background layers/Layer_0001_8.png");
        this.load.image("background", "assets/Free Pixel Art Forest/Preview/forest.png");
        this.load.spritesheet("redPotion", "assets/Potions/Red Potion.png", {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet("bluePotion", "assets/Potions/Blue Potion.png", {frameWidth: 16, frameHeight: 16});
        this.load.spritesheet("greenPotion", "assets/Potions/Green Potion.png", {frameWidth: 16, frameHeight: 16});
    }

    create() {
        // Add the background image centered and scaled
        this.background = this.add.image(this.scale.width / 2, this.scale.height / 2, "background")
            .setOrigin(0.5, 0.5);

        const bgWidth = this.background.width;
        const bgHeight = this.background.height;
        const scaleX = this.scale.width / bgWidth;
        const scaleY = this.scale.height / bgHeight;
        const scale = Math.max(scaleX, scaleY);
        this.background.setScale(scale);


        // --- Ground alignment ---
        this.groundGroup = this.physics.add.staticGroup();

        // Get ground image dimensions
        const groundImg = this.textures.get('ground').getSourceImage();
        const groundWidth = groundImg.width;

        // Adjust this value until the ground aligns with the green area in your background
        // Try values like 120, 130, 140, etc. until it looks right
        const groundY = this.scale.height - 100;

        // Tile ground across the width
        const groundCount = Math.ceil(this.scale.width / groundWidth);
        for (let i = 0; i < groundCount; i++) {
            this.groundGroup.create(
                i * groundWidth + groundWidth / 2,
                groundY,
                'ground'
            ).setOrigin(0.5, 0).refreshBody();
        }

        // --- Mage setup ---
        this.mage = this.physics.add.sprite(game.config.width / 10, game.config.height / 1.5, "mage")
            .setScale(3);
        this.mage.body.gravity.y = gameOptions.mageGravity;
        this.physics.add.collider(this.mage, this.groundGroup);

        this.cursors = this.input.keyboard.createCursorKeys()

        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("mage", {start: 24, end: 31}),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: "turn",
            frames: [{key: "mage", frame: 0}],
            frameRate: 10,
        })

        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("mage", {start: 24, end: 31}),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: "jump",
            frames: this.anims.generateFrameNumbers("mage", {start: 40, end: 47}),
            frameRate: 10,
            repeat: -1
        })

    }

    spawnPotion() {}

    update() {

        if(this.cursors.left.isDown) {
            this.mage.body.velocity.x = -gameOptions.mageSpeed
            this.mage.anims.play("left", true)
        }
        else if(this.cursors.right.isDown) {
            this.mage.body.velocity.x = gameOptions.mageSpeed
            this.mage.anims.play("right", true)
        }
        else {
            this.mage.body.velocity.x = 0
            this.mage.anims.play("turn", true)
        }

        if(this.cursors.up.isDown && this.mage.body.touching.down) {
            this.mage.body.velocity.y = -gameOptions.mageGravity / 1.6
            this.mage.anims.play("jump", true)
        }

        // Only restart if mage goes off screen
        if (this.mage.x < 0 || this.mage.x > game.config.width ||
            this.mage.y < 0 || this.mage.y > game.config.height) {
            this.scene.restart();
        }
    }
}