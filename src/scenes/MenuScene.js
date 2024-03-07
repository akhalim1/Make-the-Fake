class MenuScene extends BaseScene {
  constructor(config) {
    super("MenuScene", config);

    this.menu = [
      { scene: "PlayScene", text: "Start", position: { x: 250, y: 500 } },
      //{ scene: "TutorialScene", text: "Tutorial" },
      //{ scene: "CreditsScene", text: "Credits" },
    ];
  }

  preload() {
    // If your base scene doesn't preload this image, preload it here
    this.load.image("gameTitle", "assets/gametitle.png");
  }

  create() {
    // Add the game title as a background
    this.add
      .image(this.cameras.main.centerX, this.cameras.main.centerY, "gameTitle")
      .setScale(4.8)
      .setOrigin(0.5, 0.5);

    super.create();
    this.createMenu(this.menu, this.setUpMenuEvents.bind(this)); // second argument will bind the correct "this" context

    const startMenuItem = this.menu.find((item) => item.text === "Start");
    if (startMenuItem && startMenuItem.textObj) {
      this.makeTextBlink(startMenuItem.textObj);
    }
  }

  setUpMenuEvents(menuItem) {
    const textObj = menuItem.textObj;
    textObj.setInteractive();

    if (menuItem.position) {
      textObj.setPosition(menuItem.position.x, menuItem.position.y);
    }

    textObj.on("pointerover", () => {
      textObj.setStyle({ fill: "#A020F0" });
    });

    textObj.on("pointerout", () => {
      textObj.setStyle({ fill: "#fff" });
    });

    textObj.on("pointerdown", () => {});

    textObj.on("pointerup", () => {
      //console.log("Clicked");

      menuItem.scene && this.scene.start(menuItem.scene);

      if (menuItem === "Exit") {
        this.game.destroy(true);
      }
    });
  }

  makeTextBlink(textObj) {
    this.time.addEvent({
      delay: 500,
      callback: () => {
        textObj.visible = !textObj.visible;
      },
      loop: true,
    });
  }
}
