import * as React from "react";

import Controls from "./Controls";
import Notification from "./Notification";
import WeaponSlot from "./WeaponSlot";

import WorldServer from "game/WorldServer";
import Client from "game/Client";

import { connect } from "react-redux";

const styles = require("./App.css");

class App extends React.Component {
  constructor(props) {
    super(props);
    // Set state?
  }

  /*
  getInitialState() {
    return {
      weapons: []
    };
  }
  */

  componentDidMount() {
    this.joinLocal();
  }

  joinLocal() {
    function broadcast(type, payload) {
      if (client) client.interpretCommand(type, payload);
    }

    // Create the world server first
    var worldServer = new WorldServer(broadcast, console.log);
    worldServer.setupWorld();

    // Create the client
    var client = new Client(this);
    client.start();

    // @ts-ignore
    window.client = client;

    // Connect the client to the world server
    var connection = worldServer.createConnection("local", broadcast);
    client.joinLocal(packet => connection.handleClientRequest(packet));
  }

  render() {
    // @ts-ignore
    if (window.client) {
      // @ts-ignore
      window.client.setAppComponent(this);
    }

    window.console.log(this.state);
    return (
      <div className={styles.app}>
        <Controls />
        <Notification />
        <WeaponSlot weapons={this.props.weapons} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    weapons: state.weapons
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setWeapon: selected =>
      dispatch({
        type: "PLAYER_WEAPON_SET",
        selected
      }),
    addWeapon: ({ id, name, weaponSlot }) =>
      dispatch({
        type: "PLAYER_WEAPON_ADD",
        weaponSlot,
        id,
        name
      }),
    removeWeapon: ({ id, cooldown }) =>
      dispatch({
        type: "PLAYER_WEAPON_REMOVE",
        id
      }),
    setCooldown: ({ slotIndex, cooldown }) =>
      dispatch({
        type: "PLAYER_WEAPON_SET_COOLDOWN",
        slotIndex,
        cooldown
      })
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
