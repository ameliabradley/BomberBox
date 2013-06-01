// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
   return  window.requestAnimationFrame       || 
           window.webkitRequestAnimationFrame || 
           window.mozRequestAnimationFrame    || 
           window.oRequestAnimationFrame      || 
           window.msRequestAnimationFrame     || 
           function( callback ){
             window.setTimeout(callback, 1000 / 60);
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
