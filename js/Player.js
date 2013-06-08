Player = function() {
   var self = this,
      m_iX, m_iY,
      m_storeControl,
      m_moneyControl,
      m_weaponSlotControl,
      m_world,
      m_tile,

      // As in, not a BROADCAST
      m_fnSendToClient,

      m_aDeathObservers = [],
      onDeath = function(strKilledBy) {
         each(m_aDeathObservers, function(i, fn) {
            fn(strKilledBy);
         });
      };

   self.getTile = function() {
      return m_tile;
   };

   self.getStoreControl = function() {
      return m_storeControl;
   };

   self.getMoneyControl = function() {
      return m_moneyControl;
   };

   self.getWeaponSlotControl = function() {
      return m_weaponSlotControl;
   };

   self.getWorld = function() {
      return m_world;
   };

   self.removeFromWorld = function () {
      m_world.deleteTile(m_tile);
   };

   self.blinkPlayer = function() {
      m_fnSendToClient(OP_PLAYER_BLINK, m_tile.getId());
   }

   self.activateWeapon = function() {
      var weapon = m_weaponSlotControl.getSelectedWeapon();
      if (weapon) {
         weapon.activate(m_tile.x, m_tile.y);
      }
   }

   self.addWeapon = function(strId) {
      var weapon;
      
      switch (strId) {
         case 'WEAPON_BOMB':
            weapon = new BombDeployer();
            break;

         case 'WEAPON_CARPET_BOMB':
            weapon = new CarpetBombDeployer();
            break;
      }

      weapon.initialize(m_world);
      m_weaponSlotControl.addWeapon(weapon.getWeapon());
   }

   self.shift = function(iDirection) {
      if (m_tile.isDestroyed()) return;

      var x = m_tile.x,
         y = m_tile.y;

      switch (iDirection) {
      case DIR_LEFT:
         x -= 1;
         break;
      case DIR_RIGHT:
         x += 1;
         break;
      case DIR_UP:
         y -= 1;
         break;
      case DIR_DOWN:
         y += 1;
         break;
      }

      if (m_world.locationHasTraits(x, y, [TILE_TRAIT.TRAIT_BLOCKING])) {
         self.blinkPlayer();
         return;
      }

      m_fnSendToClient(OP_PLAYER_MOVE, [x, y]);
      m_world.moveTile(m_tile, x, y);
   }

   self.addDeathObserver = function(fnObserver) {
      m_aDeathObservers.push(fnObserver);
   };

   self.setWorld = function(world, iX, iY) {
      m_world = world;

      m_tile = new Tile(m_world);
      m_tile.setStyle(TILE_STYLE.TILE_QUTE);
      m_tile.setPosition(iX, iY);
      m_tile.setText('P');
      m_tile.setTrait(TILE_TRAIT.TRAIT_PLAYER, true);
      m_world.createTile(m_tile);

      m_tile.teleport = function(x, y) {
         self.world.setTimeout(function() {
            self.world.moveTile(m_tile, x, y);
            self.world.moveCamera(x, y);
         }, 100);
      };

      m_tile.eatMoney = function(iAmount) {
         m_moneyControl.modifyMoney(iAmount);
      };

      m_tile.dieBy = function(strName) {
         m_tile.destroy();
         onDeath(strName);
      };

      m_tile.setOnFrag(function() {
         m_tile.destroy();
         onDeath("Bomb");
      });

      if (!m_storeControl) {
         m_storeControl = new StoreControl();
         m_storeControl.initialize(self);
      }

      m_fnSendToClient(OP_PLAYER_MOVE, [iX, iY]);
   };

   self.getMoneyControl = function () {
      return m_moneyControl;
   };

   self.initialize = function(fnSendCommand) {
      m_weaponSlotControl = new WeaponSlotControl();
      m_weaponSlotControl.initialize();

      m_moneyControl = new MoneyControl();
      m_moneyControl.initialize();

      m_fnSendToClient = fnSendCommand;
   };
};
