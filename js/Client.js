// blah
window.Client = function () {
   var self = this,

      m_ctx,
      m_world,
      m_worldInterface,
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
            //m_world.togglePause();
            break;
      }

      if (m_world.isPaused()) return;

      var cancel = false;

      switch (evt.keyCode) {
         case 37: // LEFT
         case 65: // A
            self.sendRequest(REQ_PLAYER_MOVE, DIR_LEFT);
            break;   

         case 38: // UP
         case 87: // W
            self.sendRequest(REQ_PLAYER_MOVE, DIR_UP);
            break;

         case 39: // RIGHT
         case 68: // D
            self.sendRequest(REQ_PLAYER_MOVE, DIR_RIGHT);
            break;

         case 40: // DOWN
         case 83: // S
            self.sendRequest(REQ_PLAYER_MOVE, DIR_DOWN);
            break;

         // Space bar
         case 32:
            self.sendRequest(REQ_PLAYER_FIRE);
            break;

         // Q key
         case 81:
            m_worldInterface.decreaseZoom();
            break;

         // E key
         case 69:
            m_worldInterface.increaseZoom();
            break;
      }
   };

   self.renderDebugFrame = function() {
      m_worldInterface.renderDebug(m_ctx);
      requestAnimFrame(self.renderDebugFrame);
   };

   self.start = function () {
      window.onresize = function() {
         self.doResize();
      }

      m_world = new World();
      m_worldInterface = new WorldInterface(self, m_world);

      var elCanvas = document.getElementById('canvas');
      m_ctx = elCanvas.getContext('2d');
      self.doResize();
      //self.reset();

      ResourceManager.addImage('btn_play.png');
      ResourceManager.loadImages(function() {
         m_worldInterface.cacheEntities(m_ctx);
         self.renderDebugFrame();
      });
   };

   self.doResize = function() {
      m_ctx.canvas.width = window.innerWidth;
      m_ctx.canvas.height = window.innerHeight;
      m_worldInterface.setCameraSize(window.innerWidth, window.innerHeight);
      m_worldInterface.renderDebug(m_ctx);
   };

   self.interpretCommand = function (iCommandId, o) {
      switch (iCommandId) {
      case OP_WORLD_LOAD:
         m_world.fromJson(o);
         break;

      case OP_WORLD_RESET:
         m_world.reset();
         //m_world = new World();
         //m_worldInterface.setWorld(m_world);
         break;

      case OP_WORLD_CREATE_TILE:
         var tile = new Tile(m_world);
         tile.fromJson(o);
         m_world.createTileClient(tile.getId(), tile);
         break;

      case OP_WORLD_DELETE_TILE:
         m_world.deleteTileClient(o);
         break;

      case OP_WORLD_MOVE_TILE:
         m_world.moveTileClient(o[0], o[1], o[2]);
         break;

      case OP_WORLD_UPDATE_TILE_TEXT:
         var tile = m_world.getTile(o[0]);
         tile.setText(o[1]);
         break;

      case OP_WORLD_UPDATE_TILE_STYLE:
         var tile = m_world.getTile(o[0]);
         tile.styleFromJson(o[1]);
         break;

      case OP_WORLD_ANIM_MOVE:
         m_world.animMoveTileClient(o[0], o[1], o[2], o[3]);
         break;

      case OP_PLAYER_BLINK:
         m_world.blinkPlayer(o);
         break;

      case OP_MONEY_UPDATE:
         $("#storeSelector").html(o[0]).css({
            backgroundColor: "#FFBF1F",
            borderColor: "#FFF146"
         }).animate({
            backgroundColor: "#9a7a2f",
            borderColor: "#9a9343"
         }, 1000);
         $("#storeSelectorContainer").css({ top: -50 }).animate({ top: 10 }, { duration: 600, easing: "easeOutElastic" })
         break;

      /*
      case OP_PLAYER_SPAWN:
         break;

      case OP_PLAYER_DIE:
         break;
      */

      case OP_PLAYER_MOVE:
         m_worldInterface.moveCamera(o[0], o[1], null, {
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
