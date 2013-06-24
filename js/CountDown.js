/**
 * Copyright © 2012-2013 Lee Bradley 
 * All Rights Reserved
 * 
 * NOTICE: All information herein is, and remains the property of
 * Lee Bradley. Dissemation of this information or reproduction of
 * this material is strictly forbidden unless prior written permission
 * is obtained from Lee Bradley.
 * 
 * The above copyright notice and this notice shall be included in
 * all copies or substantial portions of the Software.
 */

/**
 * Call the callback function until the counter reaches the total
 * @param fnCallback the function to call back
 * @param iInterval how often to call back
 * @param iEnd the ending point
 * @param iIncrement how much to increment
 * @param iStart the starting point
 */
CountDown = function (fnCallback, setTimeout, iInterval, iEnd, iIncrement) {
   var self = this,
      m_bCancelled = false;

   self.start = function(iStart) {
      if (m_bCancelled) return;
      if (!iStart) iStart = 0;

      fnCallback(iStart);

      if (iStart >= iEnd) return;
      setTimeout(function() {
         var iNewStart = iStart + iIncrement;
         if (iNewStart > iEnd) iNewStart = iEnd;
         self.start(iNewStart);
      }, iInterval);
   }
   
   self.cancel = function() {
      m_bCancelled = true;
   }
}
