import World from 'game/World';
import WorldGenerator from 'game/WorldGenerator';
import Connection from 'game/Connection';
import { each } from 'game/util';

import {
  OP_WORLD_RESET,
  OP_WORLD_CREATE_TILE,
  OP_WORLD_DELETE_TILE,
  OP_WORLD_MOVE_TILE,
  OP_WORLD_ANIM_MOVE,
  OP_WORLD_UPDATE_TILE_STYLE,
  OP_WORLD_UPDATE_TILE_TEXT,
} from 'game/const';

class WorldServer {
  constructor (broadcast, log) {
    this.world = null;
    this.iPlayerTotal = 0;
    this.m_aConnections = [];
    this.broadcast = broadcast;
    this.log = log;
  }

  allocatePlayer () {
    return this.iPlayerTotal++;
  }

  generateWorld () {
    //console.log('generating world');
    this.world.reset();

    this.world.setTileManipulationObserver({
      reset: () => {
        this.broadcast(OP_WORLD_RESET);
      },
      createTile: (tile) => {
        this.broadcast(OP_WORLD_CREATE_TILE, tile.toJson());
      },
      deleteTile: (tile) => {
        this.broadcast(OP_WORLD_DELETE_TILE, tile.getId());
      },
      moveTile: (tile, x, y) => {
        this.broadcast(OP_WORLD_MOVE_TILE, [
          tile.getId(),
          x,
          y
        ]);
      },
      animMoveTile: (tile, x, y, speed) => {
        this.broadcast(OP_WORLD_ANIM_MOVE, [
          tile.getId(),
          x,
          y,
          speed
        ]);
      },
      tileStyleChange: (tile) => {
        this.broadcast(OP_WORLD_UPDATE_TILE_STYLE, [
          tile.getId(),
          tile.styleToJson()
        ]);
      },
      tileTextChange: (tile) => {
        this.broadcast(OP_WORLD_UPDATE_TILE_TEXT, [
          tile.getId(),
          tile.getText()
        ]);
      }
    });

    var worldGenerator = new WorldGenerator();
    worldGenerator.generateRandomWorld(this.world, () => this.resetWorld());
  }

  resetWorld () {
    this.generateWorld();

    var jsonWorld = this.world.toJson();
    each(this.m_aConnections, (i, connection) => {
      connection.loadWorld(this.world, jsonWorld);
    });
  }

  closeConnection (connection) {
    delete this.m_aConnections[connection.iPlayerId];
  }

  getWorld () {
    return this.world;
  }

  setupWorld () {
    this.world = new World();
    this.generateWorld();
    return this.world;
  }

  createConnection (conn, sendMessage) {
    var connection = new Connection(this, conn, sendMessage);
    this.m_aConnections.push(connection);
    return connection;
  }
}

export default WorldServer;
