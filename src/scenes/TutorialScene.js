class TutorialScene extends BaseScene {
  constructor(config) {
    super("TutorialScene", { ...config, canGoBack: true });
  }

  create() {
    super.create();

    const tutorialText =
      "Each round, align the clicker to the puppy's stomach. Then finish the sentence to progress to the next round. Complete all 5 rounds to finish the game.";

    this.add
      .bitmapText(
        this.screenCenter[0],
        this.screenCenter[1],
        "copyduck",
        tutorialText,
        30
      )
      .setOrigin(0.5)
      .setMaxWidth(this.config.width - 40)
      .setTint(0xff0000);
  }
}
