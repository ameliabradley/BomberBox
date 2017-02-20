import React from 'react';
import styles from './App.css';

import Controls from './Controls.js';
import Notification from './Notification.js';

import WorldServer from '../game/WorldServer.js';
import Client from '../game/Client.js';

export default class App extends React.Component {
  componentDidMount () {
    this.joinLocal();
  }

  componentWillUpdate () {
    console.log('updating......!!!!!');
  }

  joinLocal () {
    function broadcast (type, payload) {
      if (client) client.interpretCommand(type, payload);
    }

    // Create the world server first
    var worldServer = new WorldServer(broadcast, console.log);
    worldServer.setupWorld();

    // Create the client
    var client = new Client();
    client.start();

    // Connect the client to the world server
    var connection = worldServer.createConnection('local', broadcast);
    client.joinLocal(packet => connection.handleClientRequest(packet));
  }

  render () {
    return (
      <div className={styles.app}>
        <Controls />
        <Notification />
      </div>
    );
  }
}
