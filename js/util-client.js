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

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
   var i = 1000 / 60;
   return  window.requestAnimationFrame       || 
           window.webkitRequestAnimationFrame || 
           window.mozRequestAnimationFrame    || 
           window.oRequestAnimationFrame      || 
           window.msRequestAnimationFrame     || 
           function( callback ){
             window.setTimeout(callback, i);
           };
})();

window.ResourceManager = (function() {
   var m_iTotalImages = 0,
      m_iLoadedImages = 0,
      m_oImages = {},
      m_aImages = [],
      m_fnOnLoadComplete;

   function onImageLoad() {
      m_iLoadedImages++;

      if (m_iLoadedImages == m_iTotalImages) {
         m_fnOnLoadComplete();
      }
   }

   return {
      addImage : function(strImagePath) {
         m_iTotalImages++;

         var img = new Image();
         img.onload = onImageLoad;
         img.toLoad = strImagePath;

         m_oImages[strImagePath] = img;

         m_aImages.push(strImagePath);
      },

      getImage : function(strImagePath) {
         var img = m_oImages[strImagePath];

         if (img) {
            return img;
         } else {
            throw 'Could not find image "' + strImagePath + '".';
         }
      },

      loadImages : function(fnOnLoadComplete) {
         m_fnOnLoadComplete = fnOnLoadComplete;

         each(m_aImages, function(i, strImagePath) {
            var img = m_oImages[strImagePath];
            img.src = 'images/' + img.toLoad;
         });
      }
   }
}());
