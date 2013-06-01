ServerTest = function() {
   var self = this,
      m_serverObjectManager,
      m_aClients = [];

   self.sendCommand = function (iCommandId, o) {
      each(m_aClients, function (i, client) {
         self.sendClientCommand(client, iCommandId, o);
      });
   };

   self.sendClientCommand = function (client, iCommandId, o) {
      var str = msgpack.pack([
            iCommandId,
            o
         ], true);

      client.receiveCommand(str);
   };

   self.addClient = function (client) {
      m_aClients.push(client);

      var jsonWorld = self.world.toJson();
      self.sendClientCommand(client, OP_WORLD_LOAD, jsonWorld);

      var p = new Player();
      p.initialize(self.sendCommand);

      client.serverReceive = function (strJson) {
         var json = msgpack.unpack(strJson),
            iClientRequestTypeId = json[0],
            oRequestData = json[1];

         switch (iClientRequestTypeId) {
         case REQ_PLAYER_MOVE:
            p.shift(oRequestData);
            break;

         case REQ_PLAYER_FIRE:
            p.activateWeapon();
            break;
         };
      };

      p.setWorld(self.world, 3, 0);
   };

   self.addPlayer = function (i, strName) {
   };

   self.start = function(world) {
      self.world = world;
      /*
      setTimeout(function () {
         if (parent.frames.client) {
            var clientWindow = parent.frames.client,
               client = clientWindow.client;

            client = new clientWindow.Client();
            client.start();

            self.addClient(client);
         }
      }, 1000);
      self.world = new World();
      self.world.setTileManipulationObserver({
         reset: function () {
            self.sendCommand(OP_WORLD_RESET);
         },
         createTile: function (tile) {
            self.sendCommand(OP_WORLD_CREATE_TILE, tile.toJson());
         },
         deleteTile: function (tile) {
            self.sendCommand(OP_WORLD_DELETE_TILE, tile.getId());
         },
         moveTile: function (tile, x, y) {
            self.sendCommand(OP_WORLD_MOVE_TILE, [
               tile.getId(),
               x,
               y
            ]);
         },
         animMoveTile: function (tile, x, y, speed) {
            self.sendCommand(OP_WORLD_ANIM_MOVE, [
               tile.getId(),
               x,
               y,
               speed
            ]);
         }
      });
      */

      self.reset();

      // TODO: Add death observer for each player
      //self.renderDebugFrame();
   };

   /*
   self.renderDebugFrame = function() {
      self.worldInterface.renderDebug(m_ctx);
      requestAnimFrame(self.renderDebugFrame);
   };
   */

   self.generateWorld = function (world) {
      self.world = world;
      self.reset();
   };

   self.reset = function() {
      self.world.reset();

      self.generateRandomWorld();
   };

   self.generateEndRoom = function(rectDimensions) {
      self.world.createTileRect(rectDimensions, self.world.createEndWall);

      var center = rectDimensions.getCenter();
      var endEntity = new Tile(self.world);
      endEntity.setStyle(TILE_STYLE.TILE_LEAVE);
      endEntity.setPosition(center.x, center.y);
      endEntity.setText("F");
      self.world.createTile(endEntity);

      endEntity.setInteract(function(tile) {
         self.reset();
      });

      self.world.createEndWall(center.x + 1, center.y);
      self.world.createEndWall(center.x + 1, center.y - 1);
      self.world.createEndWall(center.x + 1, center.y + 1);
      self.world.createEndWall(center.x, center.y + 1);
      self.world.createEndWall(center.x, center.y - 1);
   };

   self.generateStartRoom = function(rectDimensions) {
      self.world.createTileRect(rectDimensions, self.world.createEndWall);
      var center = rectDimensions.getCenter();
      var startEntity = new Tile(self.world);
      startEntity.setStyle(TILE_STYLE.TILE_ENTER);
      startEntity.setPosition(center.x, center.y);
      startEntity.setText("S");
      self.world.createTile(startEntity);
   };

   self.generateRandomRoom = function(rectDimensions) {
      var outerWidth = rectDimensions.getOuterWidth(),
         outerHeight = rectDimensions.getOuterHeight(),
         xStart = rectDimensions.getLeft(),
         yStart = rectDimensions.getTop(),
         innerWidth = outerWidth - 2,
         innerHeight = outerHeight - 2;

      self.world.createTileRect(rectDimensions, self.world.createEndWall);

      // Generate some randomness!
      for (var x = innerWidth + 1; x--; ) {
         for (var y = innerHeight + 1; y--; ) {
            var xAbsolute = xStart + x + 1,
               yAbsolute = yStart + y + 1;

            // Every other space is an indestructible wall!
            if ((x % 2 == 1) && (y % 2 == 1)) {
               self.world.createWall(xAbsolute, yAbsolute);
            } else {
               Util.chances({
                  30: function() {
                     self.world.createDestructibleWall(xAbsolute, yAbsolute);
                  },
                  3: function() {
                     new Charger(self.world, xAbsolute, yAbsolute);
                  },
                  10: function() {
                     new Sentry(self.world, xAbsolute, yAbsolute);
                  },
                  1: function() {
                     new Charger(self.world, xAbsolute, yAbsolute);
                  },
                  2: function() {
                     new Ghost(self.world, xAbsolute, yAbsolute);
                  },
                  300: null
               });
            }
         }
      }
   };

   self.generateRandomWorld = function() {
      var aRooms = [], iMaxRooms = 1, xStart = 0,
         lastRoom,
         iTotalHeight = 0,
         iMinRoomSize = 5,
         iMaxRoomSize = 15;

      var iHeight = 6, iWidth = 6;
      var rectDimensions = new RectDimensions(xStart, - iHeight / 2, iWidth, iHeight);
      self.generateStartRoom(rectDimensions);
      aRooms.push(rectDimensions);
      xStart += iWidth + 2;

      for (var i = iMaxRooms; i--; ) {
         var iWidth = Util.randomFromInterval(iMinRoomSize, iMaxRoomSize),
            iHeight = Util.randomFromInterval(iMinRoomSize, iMaxRoomSize);

         if ((iWidth % 2) != 0) iWidth += 1;
         if ((iHeight % 2) != 0) iHeight += 1;

         var rectDimensions = new RectDimensions(xStart, - iHeight / 2, iWidth, iHeight);
         self.generateRandomRoom(rectDimensions);
         aRooms.push(rectDimensions);

         iTotalHeight = Math.max(iTotalHeight, iHeight);

         xStart += iWidth + 2;
      }

      iHeight = 6;
      iWidth = 4;
      var rectDimensions = new RectDimensions(xStart, - iHeight / 2, iWidth, iHeight);
      self.generateEndRoom(rectDimensions);
      xStart += iWidth + 2;
      aRooms.push(rectDimensions);

      each(aRooms.slice(0, -1), function(i, room) {
            var center = room.getCenter(),
               xRight = room.getRight(),
               xLeft = xRight + 3;

            for (var j = xRight; j < xLeft; j++) {
               self.world.clearEntities(j, center.y);
               self.world.clearEntities(j, center.y - 1);
               self.world.clearEntities(j, center.y + 1);
               self.world.clearEntities(j, center.y - 2);
               self.world.clearEntities(j, center.y + 2);

               self.world.createGravel(j, center.y);
               self.world.createGravel(j, center.y - 1);
               self.world.createGravel(j, center.y + 1);

               self.world.createEndWall(j, center.y - 2);
               self.world.createEndWall(j, center.y + 2);
            }
      });
   };
};
