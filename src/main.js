/*
Phaser Major Components:
- Physics System (Collisions)
- Text Object (bitmapText)
- Animation Manager (Puppy)
- Tween Manager (Clicker)
- Cameras (Fade Transition)

SFX Source/Credit Links
Puppy Barking Noise: https://www.youtube.com/watch?v=paElvuhbxIg
Ouch SFX: https://www.youtube.com/watch?v=mNuUV2nN9kE
*/
"use strict";

const WIDTH = 800;
const HEIGHT = 700;

const SHARED_CONFIG = {
  width: WIDTH,
  height: HEIGHT,
};

const Scenes = [
  PreloadScene,
  MenuScene,
  PlayScene,
  TutorialScene,
  CreditsScene,
  GameOverScene,
];

const createScene = (Scene) => new Scene(SHARED_CONFIG);
// iterates over all the scenes, and creating a new instance of that scene with SHARED_CONFIG
const initScenes = () => Scenes.map(createScene);

let config = {
  type: Phaser.AUTO,
  ...SHARED_CONFIG,
  render: {
    pixelArt: true,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
    },
  },
  scene: initScenes(),
};

let game = new Phaser.Game(config);

let cursors;
let { height, width } = game.config;
