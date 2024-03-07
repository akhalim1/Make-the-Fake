class Round {
  constructor(sentence, timeLimit, onComplete, onFail) {
    this.sentence = sentence;
    this.timeLimit = timeLimit;
    this.onComplete = onComplete;
    this.onFail = onFail;
    this.startTime = null;
    this.completed = false;
  }

  start() {
    this.startTune = Date.now();

    setTimeout(() => {
      if (!this.completed) {
        this.onFail();
      }
    }, this.timeLimit);
  }

  /*
  checkProgress(currentProgress) {
    if (currentProgress >= this.sentence.length) {
      this.completed = true;
      this.onComplete();
    }
  }
  */
}
