class GameOverScene extends BaseScene {
  constructor(config) {
    super("GameOverScene", { ...config, canGoBack: true });
  }

  create() {
    super.create();

    const gameOverText = "GAME OVER";

    this.add
      .bitmapText(
        this.screenCenter[0],
        this.screenCenter[1],
        "copyduck",
        gameOverText,
        30
      )
      .setOrigin(0.5)
      .setMaxWidth(this.config.width - 40)
      .setTint(0xff0000);
  }
}
