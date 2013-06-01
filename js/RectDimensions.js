RectDimensions = function(xStart, yStart, outerWidth, outerHeight) {
   var self = this,
      m_xStart = xStart,
      m_yStart = yStart,
      m_outerWidth = outerWidth,
      m_outerHeight = outerHeight,
      m_xCenter = (outerWidth / 2) + xStart,
      m_yCenter = (outerHeight / 2) + yStart;

   self.getLeft = function() {
      return m_xStart;
   }

   self.getRight = function() {
      return m_xStart + m_outerWidth;
   };

   self.getTop = function() {
      return m_yStart;
   }

   self.getBottom = function() {
      return m_yStart + m_outerHeight;
   }

   self.getCenter = function() {
      return {
         x: m_xCenter,
         y: m_yCenter
      }
   };

   self.getOuterWidth = function() {
      return m_outerWidth;
   };

   self.getOuterHeight = function() {
      return m_outerHeight;
   };
};
