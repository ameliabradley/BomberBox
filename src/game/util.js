/**
 * Static class containing utility methods
 */
const Util = {
   randomFromInterval: function(from, to) {
       return Math.floor(Math.random()*(to-from+1)+from);
   },

   chances: function(o) {
      var iMax = 0,
         oNew = {},
         oNext = {};

      each(o, function(i, fn) {
         var iNext = parseInt(i) + iMax;
         oNew[iMax] = fn;
         oNext[iMax] = iNext;
         iMax = iNext;
      });

      var iRandom = Math.floor(Math.random() * iMax);

      each(oNew, function(i, fn) {
         if ((iRandom >= parseInt(i)) && (iRandom < oNext[i])) {
            if (fn) fn();
         }
      });
   },

   /**
    * Draws a rounded rectangle using the current state of the canvas.
    * If you omit the last three params, it will draw a rectangle
    * outline with a 5 pixel border radius
    * @param {CanvasRenderingContext2D} ctx
    * @param {Number} x The top left x coordinate
    * @param {Number} y The top left y coordinate
    * @param {Number} width The width of the rectangle
    * @param {Number} height The height of the rectangle
    * @param {Number} radius The corner radius. Defaults to 5;
    * @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
    * @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
    */
   roundRect: function(ctx, x, y, width, height, radius, fill, stroke) {
     if (typeof stroke == "undefined" ) {
       stroke = true;
     }
     if (typeof radius === "undefined") {
       radius = 5;
     }
     ctx.beginPath();
     ctx.moveTo(x + radius, y);
     ctx.lineTo(x + width - radius, y);
     ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
     ctx.lineTo(x + width, y + height - radius);
     ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
     ctx.lineTo(x + radius, y + height);
     ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
     ctx.lineTo(x, y + radius);
     ctx.quadraticCurveTo(x, y, x + radius, y);
     ctx.closePath();
     if (stroke) {
       ctx.stroke();
     }
     if (fill) {
       ctx.fill();
     }
   },

   lineDistance: function(x1, y1, x2, y2) {
      var xs = 0;
      var ys = 0;

      xs = x2 - x1;
      xs = xs * xs;

      ys = y2 - y1;
      ys = ys * ys;

      return Math.sqrt( xs + ys );
   },

   pathfind: function(world, entityTraitToFind, aTraits, aTraitsDifficulty, iRadius, xOrigin, yOrigin) {
      var oMadeMoves = {},
         aFoundEntities = [],
         doStep = function (x, y, index) {
            var possibleMoves = [
                  [x, y + 1],
                  [x, y - 1],
                  [x + 1, y],
                  [x - 1, y]
               ];

            oMadeMoves[index] = {};

            each(possibleMoves, function(i, move) {
               // If move is not possible
               var xNew = move[0],
                  yNew = move[1],
                  indexNew = world.getIndexFromPos(xNew, yNew),
                  oTraitsLocation = world.getLocationTraits(xNew, yNew),
                  bCanMove = true,
                  iMoveDifficulty = 1;

               var iDistance = Util.lineDistance(xOrigin, yOrigin, xNew, yNew);

               if (iDistance > iRadius) return;

               if (aTraits) {
                  each(aTraits, function(i, strTrait) {
                     if (!oTraitsLocation[strTrait]) return;

                     var iDifficulty = aTraitsDifficulty[i];

                     if (iDifficulty === false) {
                        bCanMove = false;
                        return false;
                     } else {
                        iMoveDifficulty = iDifficulty;
                     }
                  });
               }

               if (!bCanMove) return;

               oMadeMoves[index][indexNew] = iMoveDifficulty;

               if (oMadeMoves[indexNew]) return;

               var aEntities = world.getTilesAtPosition(xNew, yNew);

               each(aEntities, function(iEntity, entity) {
                  if (entity.getTrait(entityTraitToFind)) {
                     aFoundEntities.push(entity);
                  }
               });

               doStep(xNew, yNew, indexNew);
            });
         };

      // Map out the world in the radius, marking entities with the traits we want
      var index = world.getIndexFromPos(xOrigin, yOrigin);
      doStep(xOrigin, yOrigin, index);

      // Find the closest path
      var aShortestPath;
      each(aFoundEntities, function(i, entity) {
         /* global dijkstra */
         var iEntityPos = world.getIndexFromPos(entity.x, entity.y),
            aPath = dijkstra.find_path(oMadeMoves, index.toString(), iEntityPos.toString());

         if (aShortestPath == null) {
            aShortestPath = aPath;
         } else {
            if (aPath.length < aShortestPath.length) {
               aShortestPath = aPath;
            }
         }
      });

      return aShortestPath;
   },

   easing: {
       swing: function (x, t, b, c, d) {
           return Util.easing[Util.easing.def](x, t, b, c, d);
       },
       easeInQuad: function (x, t, b, c, d) {
           return c*(t/=d)*t + b;
       },
       easeOutQuad: function (x, t, b, c, d) {
           return -c *(t/=d)*(t-2) + b;
       },
       easeInOutQuad: function (x, t, b, c, d) {
           if ((t/=d/2) < 1) return c/2*t*t + b;
           return -c/2 * ((--t)*(t-2) - 1) + b;
       },
       easeInCubic: function (x, t, b, c, d) {
           return c*(t/=d)*t*t + b;
       },
       easeOutCubic: function (x, t, b, c, d) {
           return c*((t=t/d-1)*t*t + 1) + b;
       },
       easeInOutCubic: function (x, t, b, c, d) {
           if ((t/=d/2) < 1) return c/2*t*t*t + b;
           return c/2*((t-=2)*t*t + 2) + b;
       },
       easeInQuart: function (x, t, b, c, d) {
           return c*(t/=d)*t*t*t + b;
       },
       easeOutQuart: function (x, t, b, c, d) {
           return -c * ((t=t/d-1)*t*t*t - 1) + b;
       },
       easeInOutQuart: function (x, t, b, c, d) {
           if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
           return -c/2 * ((t-=2)*t*t*t - 2) + b;
       },
       easeInQuint: function (x, t, b, c, d) {
           return c*(t/=d)*t*t*t*t + b;
       },
       easeOutQuint: function (x, t, b, c, d) {
           return c*((t=t/d-1)*t*t*t*t + 1) + b;
       },
       easeInOutQuint: function (x, t, b, c, d) {
           if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
           return c/2*((t-=2)*t*t*t*t + 2) + b;
       },
       easeInSine: function (x, t, b, c, d) {
           return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
       },
       easeOutSine: function (x, t, b, c, d) {
           return c * Math.sin(t/d * (Math.PI/2)) + b;
       },
       easeInOutSine: function (x, t, b, c, d) {
           return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
       },
       easeInExpo: function (x, t, b, c, d) {
           return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
       },
       easeOutExpo: function (x, t, b, c, d) {
           return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
       },
       easeInOutExpo: function (x, t, b, c, d) {
           if (t==0) return b;
           if (t==d) return b+c;
           if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
           return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
       },
       easeInCirc: function (x, t, b, c, d) {
           return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
       },
       easeOutCirc: function (x, t, b, c, d) {
           return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
       },
       easeInOutCirc: function (x, t, b, c, d) {
           if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
           return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
       },
       easeInElastic: function (x, t, b, c, d) {
           var s=1.70158;var p=0;var a=c;
           if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
           if (a < Math.abs(c)) { a=c; var s=p/4; }
           else var s = p/(2*Math.PI) * Math.asin (c/a);
           return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
       },
       easeOutElastic: function (x, t, b, c, d) {
           var s=1.70158;var p=0;var a=c;
           if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
           if (a < Math.abs(c)) { a=c; var s=p/4; }
           else var s = p/(2*Math.PI) * Math.asin (c/a);
           return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
       },
       easeInOutElastic: function (x, t, b, c, d) {
           var s=1.70158;var p=0;var a=c;
           if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
           if (a < Math.abs(c)) { a=c; var s=p/4; }
           else var s = p/(2*Math.PI) * Math.asin (c/a);
           if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
           return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
       },
       easeInBack: function (x, t, b, c, d, s) {
           if (s == undefined) s = 1.70158;
           return c*(t/=d)*t*((s+1)*t - s) + b;
       },
       easeOutBack: function (x, t, b, c, d, s) {
           if (s == undefined) s = 1.70158;
           return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
       },
       easeInOutBack: function (x, t, b, c, d, s) {
           if (s == undefined) s = 1.70158;
           if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
           return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
       },
       easeInBounce: function (x, t, b, c, d) {
           return c - Util.easing.easeOutBounce (x, d-t, 0, c, d) + b;
       },
       easeOutBounce: function (x, t, b, c, d) {
           if ((t/=d) < (1/2.75)) {
               return c*(7.5625*t*t) + b;
           } else if (t < (2/2.75)) {
               return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
           } else if (t < (2.5/2.75)) {
               return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
           } else {
               return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
           }
       },
       easeInOutBounce: function (x, t, b, c, d) {
           if (t < d/2) return Util.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
           return Util.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
       },
       linear: function (x, t, b, c, d) {
         return b + c * x;
       }
   },

   anim: function (game, o) {
      var iStart = o.start || 0,
         iEnd = o.end,
         fnStep = o.step,
         fnComplete = o.complete,
         iDuration = o.duration,
         iUpdatesPerSecond = o.ups || 60,
         fnEasing = (o.easing) ? Util.easing[o.easing] : Util.easing.linear,

         iMilliseconds = Math.floor(1000 / iUpdatesPerSecond) || 1,

         iElapsedMilliseconds = 0,
         iTimeout,

         bCancel = false,

         step = function () {
            iTimeout = game.setTimeout(function () {
               var iPercent, iVal;

               if (bCancel) {
                  return;
               }

               iElapsedMilliseconds += iMilliseconds;
               iPercent = iElapsedMilliseconds / iDuration;

               if (iPercent >= 1) {
                  iElapsedMilliseconds = iDuration;
                  iPercent = 1;
                  if (fnComplete) {
                     fnComplete();
                  }
               } else {
                  step(iVal);
               }

               iVal = fnEasing(iPercent, iElapsedMilliseconds, iStart, iEnd, iDuration);
               fnStep(iVal);
            }, iMilliseconds);
         };

      step();

      return {
         stop: function () {
            bCancel = true;
         }
      };
   }
};

/**
 * Loop through each element in an array, calling the specified function
 * @param a the array to loop through
 * @param fn the function to call
 */
export const each = function(a, fn) {
   var len = a.length, key, bValue;
   if (len) {
      for (var key = 0; key < len; key++) {
         bValue = fn(key, a[key]);
         if (bValue === false) break;
      }
   } else {
      for (key in a) {
         if (a.hasOwnProperty(key)) {
            bValue = fn(key, a[key]);
            if (bValue === false) break;
         }
      }
   }
};

export default Util;
