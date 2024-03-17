class CreditsScene extends BaseScene {
  constructor(config) {
    super("CreditsScene", { ...config, canGoBack: true });
  }

  create() {
    super.create();

    const creditsText = "Credits - ???";

    this.add
      .bitmapText(
        this.screenCenter[0],
        this.screenCenter[1],
        "copyduck",
        creditsText,
        30
      )
      .setOrigin(0.5)
      .setMaxWidth(this.config.width - 40)
      .setTint(0xff0000);
  }
}
