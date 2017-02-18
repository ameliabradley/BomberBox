FogOfWar = function(world, x, y) {
   "use strict";

   var self = this,

      m_world,
      m_oVisiblePoints = {},

      VisionPoint = function (id, x, y, pos, radius) {
         var self = this;
         self.id = id;
         self.x = x;
         self.y = y;
         self.pos = index;
         self.radius = radius;
      },

      m_tileManipulationObserver,

      m_oVisionPointById = [],
      m_iTotalVisionPoints = 0,

      addVisionPoint = function (x, y, radius) {
         var iPos = m_world.getIndexFromPos(x, y);
         m_oVisiblePoints[m_world.getIndexFromPos(x

         var visionPoint = new VisionPoint(m_iTotalVisionPoints, x, y, pos, radius);
         m_oVisionPointById[m_iTotalVisionPoints] = visionPoint;
         m_iTotalVisionPoints++;

         return visionPoint;
      },

      removeVisionPoint = function (visionPoint) {
         var id = visionPoint.id;
         delete m_oVisionPointById[id];
      },

      moveVisionPoint = function (visionPoint, x, y) {
         visionPoint.x = x;
         visionPoint.y = y;
      },

      initialize = function (world, tileManipulationObserver) {
         m_world = world;
         m_tileManipulationObserver = tileManipulationObserver;

         world.setTileManipulationObserver({
               reset: function () {
                  broadcast(OP_WORLD_RESET);
               },
               createTile: function (tile) {
                  broadcast(OP_WORLD_CREATE_TILE, tile.toJson());
               },
               deleteTile: function (tile) {
                  broadcast(OP_WORLD_DELETE_TILE, tile.getId());
               },
               moveTile: function (tile, x, y) {
                  broadcast(OP_WORLD_MOVE_TILE, [
                        tile.getId(),
                        x,
                        y
                     ]);
               },
               animMoveTile: function (tile, x, y, speed) {
                  broadcast(OP_WORLD_ANIM_MOVE, [
                        tile.getId(),
                        x,
                        y,
                        speed
                     ]);
               },
               tileStyleChange: function (tile) {
                  broadcast(OP_WORLD_UPDATE_TILE_STYLE, [
                        tile.getId(),
                        tile.styleToJson()
                     ]);
               },
               tileTextChange: function (tile) {
                  broadcast(OP_WORLD_UPDATE_TILE_TEXT, [
                        tile.getId(),
                        tile.getText()
                     ]);
               }
            });
      };

   self.addVisionPoint = addVisionPoint;
   self.initialize = initialize;
};
