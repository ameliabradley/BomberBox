window.ServerTest = function() {
   var self = this,
      m_serverObjectManager,
      m_cameraCursor,
      m_ctx,
      m_aClients = [];

   document.onkeyup = function(evt) {
      evt = (evt) ? evt : ((window.event) ? event : null);
      if (!evt) return;

      switch (evt.keyCode) {
         // Escape key
         case 27:
            self.reset();
            break;

         // P key
         case 80:
            self.world.togglePause();
            break;
      }

      if (self.world.isPaused()) return;

      var cancel = false;

      switch (evt.keyCode) {
         case 37: // LEFT
         case 65: // A
            m_cameraCursor.shift("left");
            break;   

         case 38: // UP
         case 87: // W
            m_cameraCursor.shift("up");
            break;

         case 39: // RIGHT
         case 68: // D
            m_cameraCursor.shift("right");
            break;

         case 40: // DOWN
         case 83: // S
            m_cameraCursor.shift("down");
            break;

         // Space bar
         case 32:
            break;

         // Z key
         case 90:
            //self.triggerBombs();
            break;

         // Q key
         case 81:
            self.worldInterface.decreaseZoom();
            break;

         // E key
         case 69:
            self.worldInterface.increaseZoom();
            break;
      }
   };

   self.doResize = function() {
      m_ctx.canvas.width = window.innerWidth;
      m_ctx.canvas.height = window.innerHeight;
      self.worldInterface.setCameraSize(window.innerWidth, window.innerHeight);
   };

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

   self.start = function() {
      var iEntityMoveSize = TILE_SIZE / 2,
         posLast = null,
         m_iZoom;

      setTimeout(function () {
         if (parent.frames.client) {
            var clientWindow = parent.frames.client,
               client = clientWindow.client;

            client = new clientWindow.Client();
            client.start();

            self.addClient(client);
         }
      }, 1000);

      window.onresize = function() {
         self.doResize();
      }

      m_cameraCursor = new CameraCursor();
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

      self.worldInterface = new WorldInterface(self, self.world);
      var elCanvas = document.getElementById('canvas');
      m_ctx = elCanvas.getContext('2d');
      self.doResize();
      self.reset();

      // TODO: Add death observer for each player

      ResourceManager.addImage('btn_play.png');
      ResourceManager.loadImages(function() {
         self.worldInterface.cacheEntities(m_ctx);
         self.renderDebugFrame();
      });
   };

   self.renderDebugFrame = function() {
      self.worldInterface.renderDebug(m_ctx);
      requestAnimFrame(self.renderDebugFrame);
   };

   self.reset = function() {
      self.world.reset();

      self.generateRandomWorld();

      m_cameraCursor.initialize(self.worldInterface, 3, 0);
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

      // Set the camera front and center
      self.worldInterface.moveCamera((xStart) / 2, iTotalHeight / 2, 0.2, {
         duration: 1500,
         easing: 'easeInOutQuad'
      });

      // Hold on a sec before centering on the player
      self.world.setTimeout(function() {
         self.worldInterface.moveCamera(3, 0, undefined, {
            duration: 1500,
            easing: 'easeInOutQuad'
         });
      }, 1500);
   };
};
