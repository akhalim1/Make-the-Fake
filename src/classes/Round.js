class Round {
  constructor(sentence, timeLimit, onComplete, onFail) {
    this.sentence = sentence;
    this.timeLimit = timeLimit;
    this.onComplete = onComplete;
    this.onFail = onFail;
    this.startTime = Date.now();
    this.completed = false;
  }

  start() {
    this.startTime = Date.now();

    setTimeout(() => {
      if (!this.completed) {
        this.onFail();
      }
    }, this.timeLimit);
  }

  getRemainingTime() {
    const elapsedTime = Date.now() - this.startTime;

    return Math.max(0, this.timeLimit - elapsedTime);
  }
}
