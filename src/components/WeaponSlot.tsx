import * as React from "react";
import classNames from "classnames";
const styles = require("./WeaponSlot.css");

import { PLAYER_ITEMS } from "../game/const";

const renderWeapon = weapon => {
  const item = PLAYER_ITEMS.filter(item => item.id === weapon.id)[0];
  const style = {
    backgroundImage: `url(/images/${item.image})`
  };

  //const classNames = "blah";
  const classes = classNames({
    weaponSlot: true,
    disabled: false
  });

  const slotCooldownStyle = {
    top: `${item.cooldown}%`
  };

  return (
    <div key={weapon.id} className={classes} style={style}>
      <div className="innerShadow" />
      <div className={styles.slotCooldown} style={slotCooldownStyle} />
    </div>
  );
};

const WeaponSlot = ({ weapons }) => (
  <div id="weaponSelectionContainer" className={styles.weaponSlot + " hud"}>
    {weapons.map(renderWeapon)}
  </div>
);

export default WeaponSlot;
