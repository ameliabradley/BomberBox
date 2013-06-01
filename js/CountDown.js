/**
 * Call the callback function until the counter reaches the total
 * @param fnCallback the function to call back
 * @param iInterval how often to call back
 * @param iEnd the ending point
 * @param iIncrement how much to increment
 * @param iStart the starting point
 */
CountDown = function (fnCallback, setTimeout, iInterval, iEnd, iIncrement) {
   var self = this;
   self.cancelled = false;

   self.start = function(iStart) {
      if (self.cancelled) return;
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
      self.cancelled = true;
   }
}
