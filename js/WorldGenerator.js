WorldGenerator = function() {
   var self = this,
      m_world;

   self.generateEndRoom = function(rectDimensions, fnFinish) {
      m_world.createTileRect(rectDimensions, m_world.createEndWall);

      var center = rectDimensions.getCenter();
      var endEntity = new Tile(m_world);
      endEntity.setStyle(TILE_STYLE.TILE_LEAVE);
      endEntity.setPosition(center.x, center.y);
      endEntity.setText("F");
      m_world.createTile(endEntity);

      endEntity.setInteract(fnFinish);

      m_world.createEndWall(center.x + 1, center.y);
      m_world.createEndWall(center.x + 1, center.y - 1);
      m_world.createEndWall(center.x + 1, center.y + 1);
      m_world.createEndWall(center.x, center.y + 1);
      m_world.createEndWall(center.x, center.y - 1);
   };

   self.generateStartRoom = function(rectDimensions) {
      m_world.createTileRect(rectDimensions, m_world.createEndWall);
      var center = rectDimensions.getCenter();
      var startEntity = new Tile(m_world);
      startEntity.setStyle(TILE_STYLE.TILE_ENTER);
      startEntity.setPosition(center.x, center.y);
      startEntity.setText("S");
      m_world.createTile(startEntity);
   };

   self.generateRandomRoom = function(rectDimensions) {
      var outerWidth = rectDimensions.getOuterWidth(),
         outerHeight = rectDimensions.getOuterHeight(),
         xStart = rectDimensions.getLeft(),
         yStart = rectDimensions.getTop(),
         innerWidth = outerWidth - 2,
         innerHeight = outerHeight - 2;

      m_world.createTileRect(rectDimensions, m_world.createEndWall);

      // Generate some randomness!
      for (var x = innerWidth + 1; x--; ) {
         for (var y = innerHeight + 1; y--; ) {
            var xAbsolute = xStart + x + 1,
               yAbsolute = yStart + y + 1;

            // Every other space is an indestructible wall!
            if ((x % 2 == 1) && (y % 2 == 1)) {
               m_world.createWall(xAbsolute, yAbsolute);
            } else {
               Util.chances({
                  30: function() {
                     m_world.createDestructibleWall(xAbsolute, yAbsolute);
                  },
                  3: function() {
                     new Charger(m_world, xAbsolute, yAbsolute);
                  },
                  10: function() {
                     new Sentry(m_world, xAbsolute, yAbsolute);
                  },
                  1: function() {
                     new Charger(m_world, xAbsolute, yAbsolute);
                  },
                  2: function() {
                     new Ghost(m_world, xAbsolute, yAbsolute);
                  },
                  300: null
               });
            }
         }
      }
   };

   self.generateRandomWorld = function(world, fnFinish) {
      var aRooms = [], iMaxRooms = 1, xStart = 0,
         lastRoom,
         iTotalHeight = 0,
         iMinRoomSize = 5,
         iMaxRoomSize = 15;

      m_world = world;

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
      self.generateEndRoom(rectDimensions, fnFinish);
      xStart += iWidth + 2;
      aRooms.push(rectDimensions);

      each(aRooms.slice(0, -1), function(i, room) {
            var center = room.getCenter(),
               xRight = room.getRight(),
               xLeft = xRight + 3;

            for (var j = xRight; j < xLeft; j++) {
               m_world.clearEntities(j, center.y);
               m_world.clearEntities(j, center.y - 1);
               m_world.clearEntities(j, center.y + 1);
               m_world.clearEntities(j, center.y - 2);
               m_world.clearEntities(j, center.y + 2);

               m_world.createGravel(j, center.y);
               m_world.createGravel(j, center.y - 1);
               m_world.createGravel(j, center.y + 1);

               m_world.createEndWall(j, center.y - 2);
               m_world.createEndWall(j, center.y + 2);
            }
      });
   };
};
