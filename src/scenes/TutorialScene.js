class TutorialScene extends BaseScene {
  constructor(config) {
    super("TutorialScene", { ...config, canGoBack: true });
  }

  create() {
    super.create();

    const tutorialText =
      "Each round, align the clicker to the puppy's stomach. Then finish the sentence to progress to the next round. Complete all 5 rounds to finish the game.";

    const textOptions = {
      ...this.fontOptions,
      wordWrap: { width: this.config.width - 40 },
      align: "center",
    };
    this.add
      .text(...this.screenCenter, tutorialText, textOptions)
      .setOrigin(0.5);
  }
}
