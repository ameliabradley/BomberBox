import * as React from "react";
const styles = require("./Controls.css");

const instruction = (label, caption) => (
  <div>
    <span className={styles.dark}>{label}:</span> {caption}
  </div>
);

const instructionsTouch = () => (
  <div>
    {instruction("Drag Anywhere", "Move Player")}
    {instruction("Tap", "Drop Bomb")}
    {instruction("Pinch", "Zoom")}
  </div>
);

const instructionsKeyboard = () => (
  <div>
    {instruction("Arrow Keys / WASD", "Move")}
    {instruction("Space", "Drop Bomb")}
    {instruction("Q / E", "Zoom Out / Zoom In")}
    {instruction("Tab", "Switch Weapon")}
    {instruction("Escape", "New World")}
    {instruction("P", "Pause")}
  </div>
);

const Controls = () => (
  <div className={styles.controls}>
    <div className={styles.infoboxTitle}>How to Play</div>
    <div className={styles.infoboxClose}>X</div>
    <div className={styles.infoboxBody} style={{ fontSize: "14px" }}>
      {instructionsKeyboard()}
    </div>
  </div>
);

export default Controls;
