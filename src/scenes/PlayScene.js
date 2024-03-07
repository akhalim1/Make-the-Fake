class PlayScene extends BaseScene {
  constructor(config) {
    super("PlayScene", config);

    this.score = 0;
    this.sentenceProgress = 0;
    this.currentRound = null;
    this.currentRoundIndex = 0;
    this.sentenceText = null;

    this.isClickerMoving = false;
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

    this.puppy = new Puppy(this, 100, 550).setScale(1);

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

    // third parameter "this", is for context of which instance.
    this.input.keyboard.on("keydown", this.handleKeyInput, this);

    this.rounds = [
      new Round(
        "A playful puppy wags its tail excitedly",
        30000,
        this.completeRound.bind(this),
        this.failRound.bind(this)
      ),

      new Round(
        "Gentle pats bring joyful barks and leaps",
        30000,
        this.completeRound.bind(this),
        this.failRound.bind(this)
      ),
    ];

    this.startNextRound();
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
    console.log("Losing a heart");

    // 1. try to find a filled heart
    const filledHeartIndex = this.hearts.findIndex(
      (heart) => heart.texture.key === "filledHeart"
    );

    // 2. Start removing the heart based on fill/unfill
    if (filledHeartIndex !== -1) {
      // If a filled heart is found, change its texture back to the unfilled heart
      this.hearts[filledHeartIndex].setTexture("heart");
      console.log("Heart unfilled");
    } else {
      // If no filled heart is found, then remove an unfilled heart (if any are left)
      if (this.hearts.length > 0) {
        // Remove the last heart from the array
        const heartToRemove = this.hearts.pop();
        // Remove the heart sprite
        heartToRemove.destroy();
        console.log("Heart removed");
      }
    }

    // Check if there are no hearts left
    if (this.hearts.length === 0) {
      console.log("Game Over");
      // Handle game over state here
      this.showEndGameMessage("You Lose!");
    }
  }

  tickPuppy() {
    if (this.isClickerMoving) return;

    this.isClickerMoving = true;

    // Move the clicker down
    this.clicker.setVelocityY(500);
    this.physics.add.overlap(
      this.clicker,
      this.puppy,
      (clicker, puppy) => {
        puppy.changeState("tickled");
      },
      null,
      this
    );

    // Reset the clicker position
    this.time.delayedCall(1000, () => {
      this.resetClickerPosition();
    });
  }

  resetClickerPosition() {
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
        this.puppy.changeState("layingDown");
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
          this.sentenceProgress++;
          this.tickPuppy();
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
    if (this.currentRoundIndex < this.rounds.length) {
      console.log("Round starting.");

      this.currentRound = this.rounds[this.currentRoundIndex];
      this.currentRound.start();
      this.displaySentence(this.currentRound.sentence);
      this.currentRoundIndex++;
    } else {
      // End state & victory scene / part is here.
      console.log("All rounds finished.");
      this.showEndGameMessage("You Win!");
      this.sentenceText.setVisible(false);
    }
  }

  // placeholder
  completeRound() {
    console.log("Completed round.");
    this.fillHeart();
    this.startNextRound();
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
}
