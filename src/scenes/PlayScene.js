class PlayScene extends BaseScene {
  constructor(config) {
    super("PlayScene", config);

    this.score = 0;
    this.maxRounds = 5;
    this.sentenceProgress = 0;
    this.currentRound = null;
    this.currentRoundIndex = 0;
    this.sentenceText = null;
    this.victory = false;
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

    // adding timerIDs array to keep track of the timers due to duplication issue
    this.timerIDs = [];
  }

  init() {
    this.puppy = null;
    this.hearts = [];
    this.maxHearts = 5;
    this.currentState = "default";

    this.score = 0;
    this.maxRounds = 5;
    this.sentenceProgress = 0;
    this.currentRound = null;
    this.currentRoundIndex = 0;
    this.sentenceText = null;

    this.isClickerMoving = false;
    this.barkPlayed = false;
    this.victory = false;
  }

  create() {
    // reset button
    this.resetKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ONE
    );

    // Background + setting up Puppy & Clicker instances
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

    // Handling invisible collision box here
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

    this.roundTimerText = this.add.bitmapText(
      this.config.width - 150,
      10,
      "copyduck",
      "",
      30
    );

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

    if (this.resetKey.isDown) {
      this.resetGame();
    }

    if (this.currentRound && !this.victory) {
      const remainingTime = this.currentRound.getRemainingTime();

      const seconds = Math.round(remainingTime / 1000);
      this.roundTimerText.setText(`Time: ${seconds}`);
    }
  }

  loseHeart() {
    if (this.victory) return;
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
      this.startScene("GameOverScene");
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
    // Clicker collision happening here
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
            //console.log("Sentence completed
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
      //console.log("Round starting.");

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
        this.failRound.bind(this),
        this
      );

      this.currentRound.start();
      this.displaySentence(this.currentRound.sentence);
      //console.log(this.currentRound.sentence);
      this.currentRoundIndex++;
      //console.log(this.currentRoundIndex);
    }
  }

  getRandomSentence(sentenceArray) {
    return sentenceArray[Math.floor(Math.random() * sentenceArray.length)];
  }

  completeRound() {
    this.fillHeart();
    this.resetClickerPosition();

    if (this.currentRoundIndex !== this.maxRounds) {
      this.stopAllTimers();
      this.startNextRound();
    } else {
      //console.log("All rounds finished.");
      this.showEndGameMessage("You Win!");
      this.victory = true;
      this.puppy.changeState("tailwag");
      this.sentenceText.setVisible(false);
    }
  }

  failRound() {
    //console.log("Failed round.");

    console.log(this.currentRound.completed);
    if (!this.victory && !this.currentRound.completed) {
      this.startScene("GameOverScene");
    }
  }

  displaySentence(sentence) {
    if (!this.sentenceText) {
      this.sentenceText = this.add
        .bitmapText(this.config.width / 2, 100, "copyduck", sentence, 30)
        .setMaxWidth(this.config.width - 40)
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
      .bitmapText(
        this.config.width / 2,
        this.config.height / 2,
        "copyduck",
        message,
        30
      )
      .setOrigin(0.5);
  }

  fillHeart() {
    if (this.hearts.length > 0) {
      // Find the first unfilled heart
      const unfilledHeartIndex = this.hearts.findIndex(
        (heart) => heart.texture.key === "heart"
      );
      if (unfilledHeartIndex !== -1) {
        const unfilledHeart = this.hearts[unfilledHeartIndex];

        // Set the texture to filled heart
        unfilledHeart.setTexture("filledHeart");
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

  resetGame() {
    this.scene.restart();
  }

  stopAllTimers() {
    this.timerIDs.forEach((id) => clearTimeout(id));
    this.timerIDs = [];
  }

  addTimerID(id) {
    this.timerIDs.push(id);
  }
}
