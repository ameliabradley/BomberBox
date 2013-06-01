// blah
window.Client = function () {
   var self = this,

      m_ctx,
      m_bIsConnected = false,
      
      clientObjectManager = new ClientObjectManager(),

      m_playerTile,

      setWorld = function (worldData) {
      },

      addPlayer = function (strPlayerId, playerData) {
      },

      killPlayer = function (strPlayerId) {
      },

      updatePlayerState = function (strPlayerId, iX, iY) {
      };

   document.onkeyup = function(evt) {
      evt = (evt) ? evt : ((window.event) ? event : null);
      if (!evt) return;

      switch (evt.keyCode) {
         // Escape key
         case 27:
            //self.reset();
            break;

         // P key
         case 80:
            //self.world.togglePause();
            break;
      }

      if (self.world.isPaused()) return;

      var cancel = false;

      switch (evt.keyCode) {
         case 37: // LEFT
         case 65: // A
            //m_cameraCursor.shift("left");
            self.sendRequest(REQ_PLAYER_MOVE, DIR_LEFT);
            break;   

         case 38: // UP
         case 87: // W
            //m_cameraCursor.shift("up");
            self.sendRequest(REQ_PLAYER_MOVE, DIR_UP);
            break;

         case 39: // RIGHT
         case 68: // D
            //m_cameraCursor.shift("right");
            self.sendRequest(REQ_PLAYER_MOVE, DIR_RIGHT);
            break;

         case 40: // DOWN
         case 83: // S
            //m_cameraCursor.shift("down");
            self.sendRequest(REQ_PLAYER_MOVE, DIR_DOWN);
            break;

         // Space bar
         case 32:
            self.sendRequest(REQ_PLAYER_FIRE);
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

   self.renderDebugFrame = function() {
      self.worldInterface.renderDebug(m_ctx);
      requestAnimFrame(self.renderDebugFrame);
   };

   self.start = function () {
      window.onresize = function() {
         self.doResize();
      }

      self.world = new World();

      self.worldInterface = new WorldInterface(self, self.world);
      var elCanvas = document.getElementById('canvas');
      m_ctx = elCanvas.getContext('2d');
      self.doResize();
      //self.reset();

      ResourceManager.addImage('btn_play.png');
      ResourceManager.loadImages(function() {
         self.worldInterface.cacheEntities(m_ctx);
         self.renderDebugFrame();
      });
   };

   self.doResize = function() {
      m_ctx.canvas.width = window.innerWidth;
      m_ctx.canvas.height = window.innerHeight;
      self.worldInterface.setCameraSize(window.innerWidth, window.innerHeight);
      self.worldInterface.renderDebug(m_ctx);
   };

   self.interpretCommand = function (iCommandId, o) {
      switch (iCommandId) {
      case OP_WORLD_LOAD:
         self.world.fromJson(o);
         break;

      case OP_WORLD_RESET:
         self.world.reset();
         break;

      case OP_WORLD_CREATE_TILE:
         var tile = new Tile(self.world);
         tile.fromJson(o);
         self.world.createTileClient(tile.getId(), tile);
         break;

      case OP_WORLD_DELETE_TILE:
         self.world.deleteTileClient(o);
         break;

      case OP_WORLD_MOVE_TILE:
         self.world.moveTileClient(o[0], o[1], o[2]);
         break;

      case OP_WORLD_ANIM_MOVE:
         self.world.animMoveTileClient(o[0], o[1], o[2], o[3]);
         break;

      case OP_PLAYER_BLINK:
         self.world.blinkPlayer(o);
         break;

      /*
      case OP_PLAYER_SPAWN:
         break;

      case OP_PLAYER_DIE:
         break;
      */

      case OP_PLAYER_MOVE:
         self.worldInterface.moveCamera(o[0], o[1], null, {
            easing: 'linear',
            duration: 800
         });
         break;

      default:
         console.debug("unrecognized command", iCommandId, "DATA", o);
      };
   };

   self.fromServerJson = function (aSerializedObjects) {
      var iCurrent = aSerializedObjects.length,
         oJsonObject,
         strObjectType,
         o;

      while (iCurrent--) {
         oJsonObject = aSerializedObjects[iCurrent];
         strObjectType = oJsonObject[0];
         o = oJsonObject[1];

   /*
   self.createWall = function(x, y) {
   self.createEndWall = function(x, y) {
   self.createGravel = function(x, y) {
   self.createDestructibleWall = function(x, y) {
   self.createPortalSet = function(x1, y1, x2, y2) {
   var BombFragment = function(world, x, y, bSuper) {
   var MoneyBlock = function(world, x, y, iAmount) {
   var CarpetBomb = function(world, x, y, timeout, radius, fnCallback) {
   var Bomb = function(world, x, y, timeout, radius, fnCallback) {
   var Ghost = function(world, x, y) {
   var Sentry = function(world, x, y) {
   var Charger = function(world, x, y) {
   */
         /*
         case OBTY_MONEYBLOCK:
         case OBTY_CARPETBOMB:
         case OBTY_BOMB:
         case OBTY_BOMBFRAGMENT:
         */
      };
   };

   self.join = function (url) {
      if (!m_bIsConnected) {
         //self.disconnect_reason = 'Unknown reason';
         console.debug('Trying to join server at ' + url + '...');
         self.conn = new WebSocket(url);

         /**
         *  Override the onopen event of the WebSocket instance.
         *  @param {WebSocketEvent} event The websocket event object.
         *  @returns {undefined} Nothing
         */
         self.conn.onopen = function(event) {
            m_bIsConnected = true;
/*
            self.set_state(CLIENT_CONNECTING);
            setTimeout(function() {
               self.conn.send(JSON.stringify([OP_REQ_SERVER_INFO]));
            }, 100);
*/
         };

         /**
         *  Override the onmessage event of the WebSocket instance.
         *  @param {WebSocketEvent} event The websocket event object.
         *  @returns {undefined} Nothing
         */
         self.conn.onmessage = function(event) {
            self.receiveCommand(event.data);
         }
      }
   };

   self.sendRequest = function (iRequestId, oMessage) {
      if (self.conn) {
         var strRequest = msgpack.pack([iRequestId, oMessage], true);
         //parent.frames.server.receive(strMessage);
         self.conn.send(strRequest);
      }
   };

   self.receiveCommand = function (strCommand) {
      var aCommand = msgpack.unpack(strCommand),
         iCommandId = aCommand[0],
         oCommandData = aCommand[1];

      self.interpretCommand(iCommandId, oCommandData);
   };
};
