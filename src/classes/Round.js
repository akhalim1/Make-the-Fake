class Round {
  constructor(sentence, timeLimit, onComplete, onFail, playScene) {
    this.sentence = sentence;
    this.timeLimit = timeLimit;
    this.onComplete = onComplete;
    this.onFail = onFail;
    this.playScene = playScene;
    this.startTime = Date.now();
    this.completed = false;
  }

  // start timer
  start() {
    this.startTime = Date.now();
    this.timeoutId = setTimeout(() => {
      if (!this.completed) {
        this.onFail();
      }
    }, this.timeLimit);
    console.log("Created Timer ID: " + this.timeoutId);
    this.playScene.addTimerID(this.timeoutId);
  }

  // track timer
  getRemainingTime() {
    const elapsedTime = Date.now() - this.startTime;

    return Math.max(0, this.timeLimit - elapsedTime);
  }
}
