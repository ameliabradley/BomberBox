import {
  TILE_SETTING,
  TILE_STYLE,
  STYLE_FROM_ID,
} from 'game/const'

/**
 * Represents the basic building block of the world. Literally.
 * @param world
 */
const Tile = function(world) {
   var self = this,
      m_oTraits = {},
      m_strText = "",
      m_iOffsetTop = 0,
      m_iOffsetLeft = 0,
      m_bDestroyed = false,
      m_aStyle,
      m_strTileImage,
      m_id,
      m_bInitialized,

      m_fnGetState,
      m_fnOnFrag,
      m_fnOnSuperFrag,
      m_fnInteract,
      m_bManaged,
      m_anim;

   self.xMovingTo = 0;
   self.yMovingTo = 0;

   self.x = 0;
   self.y = 0;

   /** CLIENT ONLY **/
   self.setStyle = function(aStyle) {
      if (m_aStyle === aStyle) return;

      m_strTileImage = aStyle[TILE_SETTING.IMAGE];
      m_aStyle = aStyle;

      if (m_bInitialized) {
         world.tileStyleChange(self);
      }
   };

   self.getTileImage = function() {
      return m_strTileImage;
   };

   self.getStyle = function() {
      return m_aStyle;
   };

   self.setText = function(strText) {
      m_strText = strText;
      if (m_bInitialized) {
         world.tileTextChange(self);
      }
   };

   self.getText = function() {
      return m_strText;
   };

   /** SERVER ONLY **/
   self.destroy = function(bFromDifferentCall) {
      m_bDestroyed = true;
      world.deleteTile(self, bFromDifferentCall);
   };

   self.setManaged = function (bManaged) {
      m_bManaged = bManaged;
   };

   self.getManaged = function () {
      return m_bManaged;
   };

   self.isDestroyed = function() {
      return m_bDestroyed;
   };

   self.setTrait = function(trait, bValue) {
      m_oTraits[trait] = bValue;
   };

   self.getTrait = function(trait) {
      return m_oTraits[trait];
   };

   self.getTraits = function() {
      return m_oTraits;
   };

   self.setOffset = function(iOffsetLeft, iOffsetTop) {
      m_iOffsetLeft = iOffsetLeft;
      m_iOffsetTop = iOffsetTop;
   };

   self.getOffsetLeft = function() {
      return m_iOffsetLeft;
   };

   self.getOffsetTop = function() {
      return m_iOffsetTop;
   };

   self.setGetState = function (fnGetState) {
      m_fnGetState = fnGetState;
   };

   self.setOnFrag = function (fnOnFrag) {
      m_fnOnFrag = fnOnFrag;
   };

   self.setOnSuperFrag = function (fnOnSuperFrag) {
      m_fnOnSuperFrag = fnOnSuperFrag;
   };

   self.setInteract = function (fnInteract) {
      m_fnInteract = fnInteract;
   };

   self.frag = function () {
      if (m_fnOnFrag) {
         m_fnOnFrag();
      }
   };

   self.superFrag = function () {
      if (m_fnOnSuperFrag) {
         m_fnOnSuperFrag();
      }
   };

   self.interact = function (tile) {
      if (m_bDestroyed) {
         return;
      }

      if (m_fnInteract) {
         m_fnInteract(tile);
      }
   };

   self.setPosition = function (x, y) {
      self.x = x;
      self.y = y;
   };

   self.setId = function (id) {
      m_id = id;
      m_bInitialized = true;
   };

   self.getId = function () {
      return m_id;
   };

   self.styleToJson = function () {
      return m_aStyle[TILE_SETTING.ID];
   };

   self.styleFromJson = function (json) {
      self.setStyle(TILE_STYLE[STYLE_FROM_ID[json]]);
   };

   self.toJson = function () {
      return [
         m_oTraits,
         m_strText,
         m_iOffsetTop,
         m_iOffsetLeft,
         m_bDestroyed,
         m_aStyle[TILE_SETTING.ID],
         self.x,
         self.y,
         self.xMovingTo,
         self.yMovingTo,
         m_id
      ];
   };

   self.fromJson = function (json) {
      m_oTraits = json[0];
      m_strText = json[1];
      m_iOffsetTop = json[2];
      m_iOffsetLeft = json[3];
      m_bDestroyed = json[4];
      self.setStyle(TILE_STYLE[STYLE_FROM_ID[json[5]]]);
      self.x = json[6];
      self.y = json[7];
      self.xMovingTo = json[8];
      self.yMovingTo = json[9];
      m_id = json[10];
   };

   self.setAnim = function (anim) {
      m_anim = anim;
   };

   self.stopAnim = function () {
      if (m_anim) {
         m_anim.stop();
      }
   };
};

export default Tile;
