WanderingEntity = function(world, tile) {
   var self = this,
      m_aMovements = [], // Places where the tile has been
      m_iTickSpeed = 1000,
      m_fnTick,
      m_tile = tile;

   self.move = function(x, y, speed) {
      var iPos = world.getIndexFromPos(x, y);
      if (!m_aMovements[iPos]) m_aMovements[iPos] = 0;
      m_aMovements[iPos]++;

      world.animMoveTile(m_tile, x, y, speed || 10, function() {
         self.runAgainAnotherDay();
      });
   };

   self.setTickSpeed = function(iSpeed) {
      m_iTickSpeed = iSpeed;
   };

   self.runAgainAnotherDay = function() {
      world.setTimeout(m_fnTick, m_iTickSpeed);
   };

   self.getMovesAtPosition = function(x, y) {
      if (!world.locationHasTraits(x, y, [TILE_TRAIT.TRAIT_BLOCKING, TILE_TRAIT.TRAIT_MONSTER_BLOCKING])) {
         var iPos = world.getIndexFromPos(x, y);
         if (!m_aMovements[iPos]) m_aMovements[iPos] = 0;
         return m_aMovements[iPos];
      } else {
         return false;
      }
   }
   
   self.runAmok = function() {
      if (m_tile.isDestroyed()) return;

      var possibleMoves = [
            [m_tile.x, m_tile.y + 1],
            [m_tile.x, m_tile.y - 1],
            [m_tile.x + 1, m_tile.y],
            [m_tile.x - 1, m_tile.y]
         ],
         aBestMoves = [],
         iBestNumMoves = false,
         move,
         iNumMoves,
         iRandomMoveIndex;

      for (var i = 0; i < possibleMoves.length; i++) {
         move = possibleMoves[i];
         iNumMoves = self.getMovesAtPosition(move[0], move[1]);

         // If the move is valid
         if (iNumMoves !== false) {
            // If this is a superior position
            if ((aBestMoves.length == 0) || (iNumMoves < iBestNumMoves)) {
               aBestMoves = [i];
               iBestNumMoves = iNumMoves;
            // If this is an equally good position
            } else if (iNumMoves == iBestNumMoves) {
               aBestMoves.push(i);
            }
         }
      }

      // If NONE of the four directions worked
      if (iBestNumMoves === false) {
         self.runAgainAnotherDay();
      } else {
         iRandomMoveIndex = aBestMoves[Math.floor(Math.random() * aBestMoves.length)];
         move = possibleMoves[iRandomMoveIndex];
         self.move(move[0], move[1]);
      }
   };

   self.startMoving = function (fnCustom) {
      m_fnTick = fnCustom || self.runAmok;
      var s = Math.floor(Math.random() * m_iTickSpeed) + m_iTickSpeed;
      world.setTimeout(m_fnTick, s);
   }
};
