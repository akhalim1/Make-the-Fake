class PlayScene extends BaseScene {
  constructor(config) {
    super("PlayScene", config);

    this.score = 0;
    this.maxRounds = 1;
    this.sentenceProgress = 0;
    this.currentRound = null;
    this.currentRoundIndex = 0;
    this.sentenceText = null;

    this.isClickerMoving = false;
    this.barkPlayed = false;

    this.sentencePool = {
      easy: [
        "A playful puppy wags its tail",
        "The puppy barks happily",
        "A gentle pat soothes the puppy",
      ],
      medium: [
        "The curious puppy sniffs around and wags its tail",
        "With each pat, the puppy's joyous barks fill the air",
      ],
      hard: [
        "The energetic puppy leaps around, wagging its tail and seeking attention.",
        "Joyful barks echo as the puppy excitedly jumps, seeking gentle pats and tickles.",
      ],
    };
  }

  init() {
    this.puppy = null;
    this.hearts = [];
    this.maxHearts = 5;
    this.currentState = "default";
  }

  preload() {
    this.load.atlas(
      "puppy",
      "assets/spritesheet/puppy.png",
      "assets/spritesheet/puppy.json"
    );

    this.load.image("background", "assets/background.png");
    this.load.image("clicker", "assets/clicker.png");
    this.load.image("heart", "assets/unfilledheart.png");
    this.load.image("filledHeart", "assets/filledheart.png");

    this.load.audio("ouch", "assets/ouch.mp3");
    this.load.audio("bark", "assets/bark.mp3");
  }

  create() {
    // Background + other scene setups
    this.background = this.add
      .tileSprite(0, 0, this.config.width, this.config.height, "background")
      .setOrigin(0, 0);

    for (let i = 0; i < this.maxHearts; i++) {
      let heart = this.add.sprite(100 + i * 80, 30, "heart").setScale(0.25);
      this.hearts.push(heart);
    }

    this.puppy = new Puppy(this, 100, 550).setScale(0.5);

    this.puppy.changeState("default");
    this.ZKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

    let moveSteps = 10;
    let moveDelay = 200;
    let stepsMoved = 0;

    this.clicker = this.physics.add
      .sprite(this.config.width / 2, this.config.height / 3, "clicker")
      .setScale(0.9);

    this.clicker.body.setSize(
      this.clicker.width * 0.2,
      this.clicker.height * 0.2
    );

    this.clicker.body.setOffset(
      this.clicker.width - this.clicker.width * 0.45,
      this.clicker.height - this.clicker.height * 0.2
    );

    this.clicker.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard.createCursorKeys();

    // invisible collision box here
    this.invisibleBox = this.physics.add
      .sprite(300, 700, "filledHeart")
      .setVisible(false)
      .setSize(1000, 100);

    this.physics.add.overlap(
      this.clicker,
      this.invisibleBox,
      this.handleInvisibleCollision,
      () => {
        this.resetClickerPosition();
      },
      this
    );

    // third parameter "this", is for context of which instance.
    this.input.keyboard.on("keydown", this.handleKeyInput, this);

    this.startNextRound();
  }

  update() {
    if (!this.physics.overlap(this.clicker, this.invisibleBox)) {
      this.isClickerMoving = false;
    }

    if (this.cursors.left.isDown) {
      this.clicker.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.clicker.setVelocityX(160);
    } else {
      this.clicker.setVelocityX(0);
    }
  }

  loseHeart() {
    this.sound.play("ouch", { volume: 0.5 });
    const filledHeartIndex = this.hearts.findIndex(
      (heart) => heart.texture.key === "filledHeart"
    );

    if (filledHeartIndex !== -1) {
      this.hearts[filledHeartIndex].setTexture("heart");
    } else {
      if (this.hearts.length > 0) {
        const heartToRemove = this.hearts.pop();
        heartToRemove.destroy();
      }
    }

    if (this.hearts.length === 0) {
      this.showEndGameMessage("You Lose!");
    } else {
      this.puppy.changeState("ouch");
      this.puppy.setTint(0xff0000);

      this.time.delayedCall(1000, () => {
        this.puppy.clearTint();
        this.puppy.changeState("layingDown");
      });
    }
  }

  tickPuppy() {
    if (this.isClickerMoving) return;

    this.isClickerMoving = true;

    // Move the clicker down
    // Collision happening here
    this.clicker.setVelocityY(500);
    this.physics.add.collider(
      this.clicker,
      this.puppy,
      (clicker, puppy) => {
        if (!this.barkPlayed) {
          this.sound.play("bark", { volume: 0.5 });

          this.barkPlayed = true;
        }

        puppy.changeState("tickled");

        this.resetClickerPosition();
      },
      null,
      this
    );

    // Reset the clicker position
    this.time.delayedCall(1000, () => {});
  }

  resetClickerPosition() {
    console.log("Resetting clicker..");
    // Stop the clicker's downward movement
    this.clicker.setVelocityY(0);

    // Move the clicker back to its original position with a tween
    this.tweens.add({
      targets: this.clicker,
      y: this.config.height / 5,
      duration: 500,
      ease: "Power1",
      onComplete: () => {
        this.isClickerMoving = false;
        this.barkPlayed = false;
      },
    });
  }

  handleKeyInput(event) {
    const excludedKeys = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Shift",
    ];

    // Check if the key is not one of the excluded keys
    if (!excludedKeys.includes(event.key)) {
      if (this.currentRound) {
        const currentSentence = this.currentRound.sentence;

        // Key Matching
        if (
          // case sensitivity
          event.key.toLowerCase() ===
          currentSentence.charAt(this.sentenceProgress).toLowerCase()
        ) {
          // add invisible hitbox, if the clicker touches that instead then the heart is lost.
          this.tickPuppy();
          this.sentenceProgress++;
          this.updateTextProgress();

          // If the entire sentence has been correctly typed
          if (this.sentenceProgress >= currentSentence.length) {
            console.log("Sentence completed.");
            this.completeRound();
          }
        } else {
          this.loseHeart();
        }
      }
    }
  }

  startNextRound() {
    this.movePuppyAcross();
    let sentence;
    if (this.currentRoundIndex < this.maxRounds) {
      console.log("Round starting.");

      // Example of difficulty progression
      if (this.currentRoundIndex < 2) {
        sentence = this.getRandomSentence(this.sentencePool.easy);
      } else if (this.currentRoundIndex < 4) {
        sentence = this.getRandomSentence(this.sentencePool.medium);
      } else {
        sentence = this.getRandomSentence(this.sentencePool.hard);
      }

      this.currentRound = new Round(
        sentence,
        30000,
        this.completeRound.bind(this),
        this.failRound.bind(this)
      );

      this.currentRound.start();
      this.displaySentence(this.currentRound.sentence);
      this.currentRoundIndex++;
    }
  }

  getRandomSentence(sentenceArray) {
    return sentenceArray[Math.floor(Math.random() * sentenceArray.length)];
  }

  // placeholder
  completeRound() {
    console.log("Completed round.");
    this.fillHeart();
    this.resetClickerPosition();

    if (this.currentRoundIndex !== this.maxRounds) {
      this.startNextRound();
    } else {
      console.log("All rounds finished.");
      this.showEndGameMessage("You Win!");
      this.puppy.changeState("tailwag");
      this.sentenceText.setVisible(false);
    }
  }

  failRound() {
    console.log("Failed round.");
  }

  displaySentence(sentence) {
    if (!this.sentenceText) {
      this.sentenceText = this.add
        .text(this.config.width / 2, 100, sentence, {
          font: "30px Arial",
          fill: "#ffffff",
          align: "center",
        })
        .setOrigin(0.5);
    } else {
      this.sentenceText.setText(sentence);
    }
    this.sentenceText.setVisible(true);
    // Reset progress here
    this.sentenceProgress = 0;
  }

  updateTextProgress() {
    // Only the remaining part of the sentence should be displayed.
    // This will extract a portion ofthe string starting from the provided index
    let remainingPart = this.currentRound.sentence.substring(
      this.sentenceProgress
    );

    // Update the displayed sentence to only show the remaining part.
    this.sentenceText.setText(remainingPart);
  }

  showEndGameMessage(message) {
    // Display text
    const endGameText = this.add
      .text(this.config.width / 2, this.config.height / 2, message, {
        font: "40px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    this.time.delayedCall(3000, () => {
      // nagivate to different scene here
    });
  }

  // todo
  fillHeart() {
    console.log("Filling heart!");

    if (this.hearts.length > 0) {
      // Find the first unfilled heart
      const unfilledHeartIndex = this.hearts.findIndex(
        (heart) => heart.texture.key === "heart"
      );
      if (unfilledHeartIndex !== -1) {
        const unfilledHeart = this.hearts[unfilledHeartIndex];

        // Set the texture to filled heart
        unfilledHeart.setTexture("filledHeart");

        console.log("Heart filled!");
      }
    }
  }

  movePuppyAcross() {
    this.puppy.changeState("default");

    // Starting pos
    this.puppy.x = 100;

    let moveSteps = 10;
    let moveDelay = 200;
    let stepsMoved = 0;

    // Max Movement
    const minX = 200;
    const maxX = 500;

    // Target x
    const targetX = Phaser.Math.Between(minX, maxX);

    const movePuppy = () => {
      if (stepsMoved < moveSteps && this.puppy.x < targetX) {
        this.puppy.x += Math.min(30, targetX - this.puppy.x);
        stepsMoved++;
        this.time.delayedCall(moveDelay, movePuppy);
      } else {
        console.log("Laying down.");
        this.puppy.changeState("layingDown");
      }
    };

    this.time.delayedCall(1000, movePuppy);
  }

  handleInvisibleCollision(clicker, box) {
    if (!this.isClickerMoving) {
      this.loseHeart();
      this.isClickerMoving = true;
    }
  }
}
