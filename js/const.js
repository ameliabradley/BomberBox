/**
 * Config
 */
//var 

   /* COMMON
    *=======================*/
   TILE_SIZE = 71, // Tile size, in pixels
   TILE_BORDER = 8, // Border, in pixels (which is subtracted from the size, not added)
   TILE_SIZE_SHADOW = 90, // Shadow size, in pixels

   INT_SIZE = 32, // While the ints are actually larger, ECMA-262 bitwise operators act as if the int is 32 bits
   INT_HALF_AND = 0xFFFF, // Used to clear out the first half of the bits

   I = 0,
   OP_WORLD_LOAD = I++,
   OP_WORLD_RESET = I++,
   OP_WORLD_CREATE_TILE = I++,
   OP_WORLD_DELETE_TILE = I++,
   OP_WORLD_MOVE_TILE = I++,
   OP_WORLD_UPDATE_TILE_TEXT = I++,
   OP_WORLD_UPDATE_TILE_STYLE = I++,
   OP_WORLD_ANIM_MOVE = I++,
   OP_PLAYER_BLINK = I++,
   OP_PLAYER_MOVE = I++,
   OP_MONEY_UPDATE = I++,

   OP_PLAYER_CONNECT = I++,
   OP_PLAYER_DISCONNECT = I++,
   OP_PLAYER_SPAWN = I++,
   OP_PLAYER_DIE = I++,

   // TODO: Remove old OP codes
   OP_PLAYER_STATE = I++,
   OP_PLAYER_INFO = I++,
   OP_PLAYER_FIRE = I++,
   OP_POWERUP_SPAWN = I++,
   OP_POWERUP_DIE = I++,
   OP_ROUND_STATE = I++,
   OP_PLAYER_SAY = I++,
   OP_PING = I++,
     
   OP_REQ_SERVER_INFO = I++,
   OP_SERVER_INFO = I++,
   OP_SERVER_EXEC_RESP = I++,
   OP_DISCONNECT_REASON = I++,
   OP_WORLD_DATA = I++,
   OP_WORLD_STATE = I++,
   OP_WORLD_RECONNECT = I++,
   OP_CLIENT_CONNECT = I++,
   OP_CLIENT_JOIN = I++,
   OP_CLIENT_STATE = I++,
   OP_CLIENT_SET = I++,
   OP_CLIENT_EXEC = I++,
   OP_CLIENT_SAY = I++,

   I = 0,
   REQ_PLAYER_MOVE = I++,
   REQ_PLAYER_FIRE = I++,
   REQ_BUY      = I++,
   REQ_GAME     = I++,
   REQ_PING     = I++,


   // Packet types

   // World round states
   ROUND_WARMUP  = 1,
   ROUND_STARTING = 2,
   ROUND_RUNNING  = 3,
   ROUND_FINISHED = 4,

   I = 0,
   TILE_TRAIT = {
      TRAIT_BLOCKING: I++,
      TRAIT_MONSTER_BLOCKING: I++,
      TRAIT_BOMB_INERT: I++,
      TRAIT_BLOCKING_COMPLETE: I++,
      TRAIT_BOMB: I++,
      TRAIT_UNFRAGGABLE: I++,
      TRAIT_STRONG: I++,
      TRAIT_PLAYER: I++
   },

   PRICE_PLAYER_STARTING_ITEM = 0,

   ITEM_TYPE = {
      TYPE_PLAYER_UPGRADE: 1,
      TYPE_WEAPON: 2,
      TYPE_WEAPON_MOD: 3,
      TYPE_BOMB_MOD: 4
   },

   PLAYER_ITEMS = {
      /** PLAYER ATTRIBUTES **/
      PLAYER_ENERGY_TRAINING: {
         itemInfo: {
            name: "Energy Training",
            type: ITEM_TYPE.TYPE_PLAYER_UPGRADE,
            price: 10,
            description: "",
            bonus: "",
            parentItem: null
         },
         playerUpgradeInfo: {
            addEnergy: 100
         }
      },
      PLAYER_ENERGY_TRAINING2: {
         itemInfo: {
            name: "Energy Training 2",
            type: ITEM_TYPE.TYPE_PLAYER_UPGRADE,
            price: 10,
            description: "",
            bonus: "",
            parentItem: "PLAYER_ENERGY_TRAINING"
         },
         playerUpgradeInfo: {
            addEnergy: 100
         }
      },

      /** BOMB **/
      WEAPON_BOMB: {
         itemInfo: {
            name: "Bomb",
            type: ITEM_TYPE.TYPE_WEAPON,
            price: PRICE_PLAYER_STARTING_ITEM,
            description: "Your basic timed explosion",
            bonus: "",
            parentItem: null
         },
         weaponInfo: {
            cooldown: 0,
            energy: 50
         }
      },
      WEAPONMOD_DEPLOYER_EFFICIENCY: {
         itemInfo: {
            name: "Deployer Efficiency",
            type: ITEM_TYPE.TYPE_WEAPON_MOD,
            price: 10,
            description: "",
            bonus: "-25 Energy Usage",
            parentItem: "WEAPON_BOMB"
         },
         weaponModInfo: {
            forWeapon: "WEAPON_BOMB",
            cooldown: 0,
            energy: 25
         }
      },
      WEAPONMOD_BOMB_M2: {
         itemInfo: {
            name: "M2",
            type: ITEM_TYPE.TYPE_WEAPON_MOD,
            price: 10,
            description: "",
            bonus: "+1 Radius",
            parentItem: "WEAPON_BOMB"
         },
         weaponModInfo: {
            forWeapon: "WEAPON_BOMB",
            cooldown: null,
            energy: null
         },
         bombUpgradeInfo: {
            radius: 2
         }
      },

      /** CARPET BOMB **/
      WEAPON_CARPET_BOMB: {
         itemInfo: {
            name: "Carpet Bomb",
            type: ITEM_TYPE.TYPE_WEAPON,
            price: 30,
            description: "Destroys almost all blocks and explodes in circle. Very effective.",
            bonus: "",
            parentItem: null
         },
         weaponInfo: {
            cooldown: 15000,
            energy: 200
         }
      },
      WEAPONMOD_CARPET_BOMB_M2: {
         itemInfo: {
            name: "M2",
            type: ITEM_TYPE.TYPE_WEAPON_MOD,
            price: 20,
            description: "",
            bonus: "30% Faster Recharge",
            parentItem: "WEAPON_CARPET_BOMB"
         },
         weaponModInfo: {
            forWeapon: "WEAPON_CARPET_BOMB",
            cooldown: 10000,
            energy: null
         }
      }

      /** Item - Hint of Glory ... very expensive? does absolutely nothing, but has awesome sub items */
   },

   DIR_LEFT = 0,
   DIR_RIGHT = 1,
   DIR_UP = 3,
   DIR_DOWN = 4,

   /* Client
    *=======================*/
   USE_IMAGES = false, // False will draw placeholder colors

   COLOR_SHADOW = 'rgba(0,0,0,0.1)',
   COLOR_REDSHADOW = 'rgba(255,0,0,0.8)',

   I = 0,
   TILE_STYLE = {
      TILE_TIMEDMINE_RED: ['box_timedmine_red.png', 'gray', COLOR_REDSHADOW, false, true, I++],
      TILE_TIMEDMINE: ['box_timedmine.png', 'gray', COLOR_SHADOW, false, true, I++],
      TILE_QUTE: ['box_qute.png', '#FA2B31', COLOR_SHADOW, false, true, I++],
      TILE_QUTE_BUMP: ['box_qute.png', '#FA2B31', 'orange', false, true, I++],
      TILE_EXPLOSION_YELLOW: ['box_explosion_yellow.png', 'white', COLOR_SHADOW, false, true, I++],
      TILE_EXPLOSION_ORANGE: ['box_explosion_orange.png', COLOR_SHADOW, 'white', false, false, I++],
      TILE_ZOMB: ['box_zomb.png', '#ABE319', COLOR_SHADOW, false, true, I++],
      TILE_BLASTER: [null, 'pink', COLOR_SHADOW, false, true, I++],
      TILE_CHARGER: [null, 'cyan', COLOR_SHADOW, false, true, I++],
      TILE_GHOST: [null, 'rgb(191, 44, 232)', COLOR_SHADOW, false, true, I++],
      TILE_GHOST_INCOGNITO: [null, 'rgba(191, 44, 232, 0.2)', COLOR_SHADOW, false, true, I++],
      TILE_CHARGER_RED: [null, 'cyan', COLOR_REDSHADOW, false, true, I++],
      TILE_STONE_DESTRUCTIBLE: ['box_stone_destructible.png', '#4F83B3', '#58B1C9', false, true, I++],
      TILE_GRAVEL: [null, '#3A3A3A', '#3A3A3A', true, false, I++],
      TILE_LEAVE: [null, '#3A3A3A', '#3A3A3A', true, false, I++],
      TILE_ENTER: [null, '#3A3A3A', '#3A3A3A', true, false, I++],
      TILE_STONE_IMMOVABLE: ['box_stone_immovable.png', '#263B7D', '#285887', false, true, I++],
      TILE_STONE_SURROUND: ['box_stone_immovable.png', '#282E4C', '#2F4563', true, true, I++],
      TILE_WOOD_DESTRUCTIBLE: ['box_wood_destructible.png', '#4F83B3', '#58B1C9', false, true, I++],
      TILE_WOOD_IMMOVABLE: ['box_wood_immovable.png', '#263B7D', '#285887', false, true, I++],
      TILE_TELEPORT: [null, 'rgba(255,0,0,0.5)', COLOR_SHADOW, false, true, I++],
      TILE_GOLD: ['box_gold.png', '#FFBF1F', '#FFF146', false, true, I++]
   },

   STYLE_FROM_ID = [
      "TILE_TIMEDMINE_RED",
      "TILE_TIMEDMINE",
      "TILE_QUTE",
      "TILE_QUTE_BUMP",
      "TILE_EXPLOSION_YELLOW",
      "TILE_EXPLOSION_ORANGE",
      "TILE_ZOMB",
      "TILE_BLASTER",
      "TILE_CHARGER",
      "TILE_GHOST",
      "TILE_GHOST_INCOGNITO",
      "TILE_CHARGER_RED",
      "TILE_STONE_DESTRUCTIBLE",
      "TILE_GRAVEL",
      "TILE_LEAVE",
      "TILE_ENTER",
      "TILE_STONE_IMMOVABLE",
      "TILE_STONE_SURROUND",
      "TILE_WOOD_DESTRUCTIBLE",
      "TILE_WOOD_IMMOVABLE",
      "TILE_TELEPORT",
      "TILE_GOLD"
   ],

   TILE_DRAW_SIZE = TILE_SIZE - 1, // Cause tiles to overlap slightly, fixing some rendering glitches where 1px gaps sporadically appear
   TILE_DRAW_HALF = TILE_DRAW_SIZE / 2,
   TILE_BORDER_TWICE = TILE_BORDER * 2,
   TILE_SHADOW_OFFSET = (TILE_SIZE_SHADOW - TILE_SIZE) / 2,
   TILE_FONT_SIZE = TILE_SIZE - TILE_BORDER_TWICE - 16,
   TILE_FONT = "bold " + TILE_FONT_SIZE.toString() + "px Helvetica",

   INT_SHIFT = INT_SIZE / 2,

   TILE_SETTING = {
      IMAGE: 0,
      BACKGROUND_COLOR: 1,
      BORDER_COLOR: 2,
      SQUARE: 3,
      IS_BACKGROUND: 4,
      ID: 5
   };
