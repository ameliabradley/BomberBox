var ContextCache = function() {
   var self = this,
      oCanvas = {},
      oContext = {};

   self.makeNew = function(key, width, height) {
      var canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      var ctx = canvas.getContext("2d");

      oCanvas[key] = canvas;
      oContext[key] = ctx;

      return ctx;
   };

   self.getCanvas = function(key) {
      return oCanvas[key];
   };

   self.getContext = function(key) {
      return oContext[key];
   };
};
