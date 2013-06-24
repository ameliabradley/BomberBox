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
