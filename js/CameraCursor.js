CameraCursor = function () {
   var self = this,
      m_worldInterface,
      m_iX,
      m_iY;

   self.shift = function(iDirection) {
      switch (iDirection) {
      case "left":
         m_iX -= 1;
         break;
      case "right":
         m_iX += 1;
         break;
      case "up":
         m_iY -= 1;
         break;
      case "down":
         m_iY += 1;
         break;
      }

      m_worldInterface.moveCamera(m_iX, m_iY);
   };

   self.initialize = function (worldInterface, iX, iY) {
      m_worldInterface = worldInterface;
      m_iX = iX;
      m_iY = iY;
   };
};
