let game

const gameOptions = {
    mageGravity: 900,
    mageSpeed: 250,
    gameSpeed: 300,        // Speed of background scrolling
    groundHeight: 100      // Height of ground from bottom
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
        // Create scrolling background with multiple instances
        this.backgroundGroup = this.add.group();
        
        // Get background dimensions for proper tiling
        const bgImg = this.textures.get('background').getSourceImage();
        const bgWidth = bgImg.width;
        const bgHeight = bgImg.height;
        
        // Scale background to fit screen height
        const scaleY = this.scale.height / bgHeight;
        const scaledBgWidth = bgWidth * scaleY;
        
        // Create multiple background instances to ensure seamless scrolling
        const bgCount = Math.ceil(this.scale.width / scaledBgWidth) + 2;
        
        for (let i = 0; i < bgCount; i++) {
            let bg = this.add.image(i * scaledBgWidth, this.scale.height / 2, "background")
                .setOrigin(0, 0.5)
                .setScale(scaleY);
            this.backgroundGroup.add(bg);
        }

        // Create ground group for physics
        this.groundGroup = this.physics.add.staticGroup();
        
        // Get ground dimensions
        const groundImg = this.textures.get('ground').getSourceImage();
        this.groundWidth = groundImg.width;
        this.groundY = this.scale.height - gameOptions.groundHeight;
        
        // Create initial ground tiles
        this.createInitialGround();

        // --- Mage setup ---
        this.mage = this.physics.add.sprite(game.config.width / 10, game.config.height / 1.5, "mage")
            .setScale(3);
        this.mage.body.gravity.y = gameOptions.mageGravity;
        this.physics.add.collider(this.mage, this.groundGroup);

        this.cursors = this.input.keyboard.createCursorKeys()

        // Animation setup
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

        // Track rightmost ground position for infinite scrolling
        this.rightmostGroundX = 0;
    }

    createInitialGround() {
        // Create enough ground tiles to cover the screen width plus extra
        const groundCount = Math.ceil(this.scale.width / this.groundWidth) + 5;
        
        for (let i = 0; i < groundCount; i++) {
            let ground = this.groundGroup.create(
                i * this.groundWidth + this.groundWidth / 2,
                this.groundY,
                'ground'
            ).setOrigin(0.5, 0);
            
            ground.refreshBody();
            
            // Track the rightmost position
            this.rightmostGroundX = Math.max(this.rightmostGroundX, ground.x + this.groundWidth / 2);
        }
    }

    addGroundTile() {
        // Add a new ground tile at the rightmost position
        let ground = this.groundGroup.create(
            this.rightmostGroundX + this.groundWidth / 2,
            this.groundY,
            'ground'
        ).setOrigin(0.5, 0);
        
        ground.refreshBody();
        this.rightmostGroundX += this.groundWidth;
    }

    spawnPotion() {}

    update() {
        const scrollSpeed = gameOptions.gameSpeed * this.game.loop.delta / 1000;
        
        // Scroll background to the left
        this.backgroundGroup.children.entries.forEach(bg => {
            bg.x -= scrollSpeed;
            
            // Reset background position when it goes off screen
            if (bg.x <= -bg.displayWidth) {
                bg.x = this.getMaxBackgroundX() + bg.displayWidth;
            }
        });

        // Scroll ground to the left and properly update physics bodies
        const groundsToRemove = [];
        this.groundGroup.children.entries.forEach(ground => {
            ground.x -= scrollSpeed;
            
            // IMPORTANT: Refresh the physics body after moving
            ground.body.updateFromGameObject();
            
            // Mark ground tiles for removal that are far off screen
            if (ground.x < -this.groundWidth * 2) {
                groundsToRemove.push(ground);
            }
        });

        // Remove marked ground tiles
        groundsToRemove.forEach(ground => {
            this.groundGroup.remove(ground);
            ground.destroy();
        });

        // Add new ground tiles as needed
        if (this.rightmostGroundX - scrollSpeed <= this.scale.width + this.groundWidth) {
            this.addGroundTile();
        }

        // Update rightmost ground position
        this.rightmostGroundX -= scrollSpeed;

        // Character controls
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

        // Only restart if mage goes off screen (left, right, or falls down)
        if (this.mage.x < -50 || this.mage.x > game.config.width + 50 ||
            this.mage.y > game.config.height + 100) {
            this.scene.restart();
        }
    }

    getMaxBackgroundX() {
        let maxX = 0;
        this.backgroundGroup.children.entries.forEach(bg => {
            maxX = Math.max(maxX, bg.x);
        });
        return maxX;
    }
}