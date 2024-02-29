class PlayScene extends BaseScene {
  constructor(config) {
    super("PlayScene", config);

    this.puppy = null;
    this.score = 0;

    this.currentState = "default";
    this.sentence = "example sentence test test";
    this.sentenceProgress = 0;
    this.hearts = [];
    this.maxHearts = 5;

    this.tickleTime = [];
  }

  init() {}

  preload() {
    this.load.atlas(
      "puppy",
      "assets/spritesheet/puppy.png",
      "assets/spritesheet/puppy.json"
    );

    this.load.image("background", "assets/background.png");
    this.load.image("clicker", "assets/clicker.png");
    this.load.image("heart", "assets/unfilledheart.png");
  }

  create() {
    this.background = this.add
      .tileSprite(0, 0, this.config.width, this.config.height, "background")
      .setOrigin(0, 0);

    for (let i = 0; i < this.maxHearts; i++) {
      let heart = this.add.sprite(100 + i * 80, 30, "heart").setScale(0.5);
      this.hearts.push(heart);
    }

    this.puppy = new Puppy(this, 100, 550).setScale(1);

    this.puppy.changeState("default");
    this.ZKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

    let moveSteps = 10;
    let moveDelay = 200;
    let stepsMoved = 0;

    this.clicker = this.physics.add
      .sprite(this.config.width / 2, this.config.height / 5, "clicker")
      .setScale(0.9);
    this.clicker.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard.createCursorKeys();

    const movePuppy = () => {
      if (stepsMoved < moveSteps) {
        this.puppy.x += 30;

        stepsMoved++;

        this.time.delayedCall(moveDelay, movePuppy);
      } else {
        this.puppy.changeState("layingDown");
      }
    };
    this.time.delayedCall(1000, movePuppy);

    this.input.keyboard.on("keydown", this.handleKeyInput, this);
  }

  update() {
    if (this.cursors.left.isDown) {
      this.clicker.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.clicker.setVelocityX(160);
    } else {
      this.clicker.setVelocityX(0);
    }
  }

  loseHeart() {
    // Remove a heart from the screen
    if (this.hearts.length > 0) {
      let heart = this.hearts.pop();
      heart.destroy();
      if (this.hearts.length === 0) {
        console.log("Game Over");
      }
    }
  }

  tickPuppy() {
    this.clicker.setVelocityY(500);
    this.physics.add.overlap(
      this.clicker,
      this.puppy,
      function (clicker, puppy) {
        this.clicker.setVelocityY(0);
        puppy.changeState("tickled");
        clicker.setPosition(this.config.width / 2, this.config.height / 5);
      },
      null,
      this
    );
  }

  handleKeyInput(event) {
    if (event.key === this.sentence[this.sentenceProgress]) {
      this.sentenceProgress++;
      this.tickPuppy();
      if (this.sentenceProgress >= this.sentence.length) {
        console.log("Sentence completed!");
        // Proceed to next round here
      }
    } else {
      this.loseHeart();
    }
  }
}
