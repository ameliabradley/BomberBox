BombBase = function(world, x, y, timeout, radius) {
   var self = this,
      m_tile,
      m_bExploded = false,
      m_fnOnExplode;

   self.tick = function() {
      m_tile.setStyle(TILE_STYLE.TILE_TIMEDMINE_RED);
      world.setTimeout(function() {
         m_tile.setStyle(TILE_STYLE.TILE_TIMEDMINE);
      }, 300);
   }

   self.explode = function() {
      if (m_bExploded == true) return;
      m_bExploded = true;

      m_tile.destroy();

      if (m_fnOnExplode) m_fnOnExplode();
   };

   self.deploy = function(fnOnExplode) {
      if (world.locationHasTraits(x, y, [TILE_TRAIT.TRAIT_BOMB_INERT])) {
         if (fnOnExplode) fnOnExplode();
         return;
      };

      m_tile = new Tile(world);
      m_tile.setStyle(TILE_STYLE.TILE_TIMEDMINE);
      m_tile.setPosition(x, y);
      m_tile.setTrait(TILE_TRAIT.TRAIT_BLOCKING, true);
      m_tile.setTrait(TILE_TRAIT.TRAIT_BOMB, true);
      world.createTile(m_tile);

      m_fnOnExplode = fnOnExplode;

      m_tile.setOnFrag(self.explode);

      if (timeout) {
         var countDown = new CountDown(function(i) {
            if (i == timeout) {
               self.explode();
               return;
            };

            self.tick();
            m_tile.setText((timeout - i).toString());
         }, world.setTimeout, 1000, timeout, 1);
      }

      if (countDown) countDown.start();
   }
};
