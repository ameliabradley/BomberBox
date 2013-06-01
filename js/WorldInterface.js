/**
 * A map of the world. Also a factory for tiles
 * @param game
 */
WorldInterface = function(game, world) {
   var self = this,
      m_world = world,
      xPos, yPos, width, height,

      m_iOffsetTop = 0, m_iOffsetLeft = 0, m_iPixelWidth = 0, m_iPixelHeight = 0,
      m_iCameraWidth = 0, m_iCameraHeight = 0, m_iCameraZoom = 1,
      
      m_iDefaultZoom = 0.75, m_iCurrentZoom = 1, m_cache = new ContextCache(),

      // Clip
      m_iEntityClipMinX, m_iEntityClipMinY, m_iEntityClipMaxX, m_iEntityClipMaxY,

      // Frame pause
      m_bPauseAnimFinished = false, m_bPausedFrameRendered = false, m_ctxPauseCanvas, m_imgPausedFrameGray, m_iPauseOpacity = 0,

      initialize = function () {
         m_world.addResetObserver(function () {
            xPos = 0;
            yPos = 0;
         });
      };

   self.setZoom = function(iZoom) {
      m_iCurrentZoom = iZoom;
      self.moveCamera(xPos, yPos, m_iCurrentZoom);
   };

   self.getZoom = function() {
      return m_iCurrentZoom;
   };

   self.resetZoom = function() {
      m_iCurrentZoom = m_iDefaultZoom;
      self.moveCamera(xPos, yPos, m_iCurrentZoom);
   };

   self.decreaseZoom = function() {
      if (m_iCurrentZoom < 0.25) return;
      m_iCurrentZoom /= 2;
      self.moveCamera(xPos, yPos, m_iCurrentZoom, {
         duration: 1500,
         easing: 'easeInOutQuad'
      });
   };

   self.increaseZoom = function() {
      if (m_iCurrentZoom > 5) return;
      m_iCurrentZoom *= 2;
      self.moveCamera(xPos, yPos, m_iCurrentZoom, {
         duration: 1500,
         easing: 'easeInOutQuad'
      });
   };

   self.onCameraChange = function() {
      // Pause
      m_bPausedFrameRendered = false;
      m_imgPausedFrameGray = null;

      // Clip
      m_iEntityClipMinX = ((-m_iCameraWidth / 2) / m_iCameraZoom) - m_iOffsetLeft - TILE_SIZE;
      m_iEntityClipMinY = ((-m_iCameraHeight / 2) / m_iCameraZoom) - m_iOffsetTop - TILE_SIZE;
      m_iEntityClipMaxX = ((m_iCameraWidth / 2) / m_iCameraZoom) - m_iOffsetLeft;
      m_iEntityClipMaxY = ((m_iCameraHeight / 2) / m_iCameraZoom) - m_iOffsetTop;
   };

   self.setCameraSize = function(w, h) {
      m_iCameraWidth = w;
      m_iCameraHeight = h;

      self.onCameraChange();
   };

   self.moveCamera = function(x, y, zoom, oAnimOptions) {
      if (self.cameraAnim) {
         self.cameraAnim.stop();
         self.cameraAnim = false;
      }

      // Get the new position, in pixels
      var pos = self.getCellCenter(x, y);
      var iEndZoom = zoom || m_iCurrentZoom;

      if (oAnimOptions !== false) {
         var options = oAnimOptions || {},
            iStartX = 0,
            iStartY = 0,
            iEndX = pos.x, //Math.round((m_iCameraWidth / 2) + pos.x);
            iEndY = pos.y; //Math.round((m_iCameraHeight / 2) + pos.y);

         self.cameraAnim = Util.anim(world, {
            start: 0,
            end: 1,
            easing: (options.easing) ? options.easing : "easeOutQuad",
            duration: options.duration || 1000,
            step: function(iVal) {
               m_iOffsetLeft = Math.floor(m_iOffsetLeft + ((iEndX - m_iOffsetLeft) * iVal));
               m_iOffsetTop = Math.floor(m_iOffsetTop + ((iEndY - m_iOffsetTop) * iVal));
               m_iCameraZoom = m_iCameraZoom + ((iEndZoom - m_iCameraZoom) * iVal);
               self.onCameraChange();
            },
            complete: function() {
               self.cameraAnim = false;
            }
         });
      } else {
         m_iOffsetLeft = pos.x;
         m_iOffsetTop = pos.y;
         m_iCameraZoom = iEndZoom;
         self.onCameraChange();
      }

      xPos = x;
      yPos = y;
   };

   /**
    * Move the camera to a cell position
    * @param x
    * @param y
    */
   self.moveCamera2 = function(x, y, zoom) {
      if (self.cameraAnim) {
         self.cameraAnim.cancel();
      }

      // Get the new position, in pixels
      var pos = self.getCellCenter(x, y),
         iStartX = 0,
         iStartY = 0,
         iEndX = pos.x, //Math.round((m_iCameraWidth / 2) + pos.x);
         iEndY = pos.y, //Math.round((m_iCameraHeight / 2) + pos.y);
         iEndZoom = zoom || m_iCurrentZoom,
         iSteps = 10;

      // Smoothly move the camera
      self.cameraAnim = new CountDown(function(i) {
         var iStepsLeft = (iSteps - i);
         if (iStepsLeft == 0) return;
         m_iOffsetLeft = Math.round(m_iOffsetLeft + ((iEndX - m_iOffsetLeft) / iStepsLeft));
         m_iOffsetTop = Math.round(m_iOffsetTop + ((iEndY - m_iOffsetTop) / iStepsLeft));
         m_iCameraZoom = m_iCameraZoom + ((iEndZoom - m_iCameraZoom) / iStepsLeft);
         self.onCameraChange();
      }, self.setTimeout, 30, iSteps, 1);

      self.cameraAnim.start();

      xPos = x;
      yPos = y;
   };

   // Source: http://www.htmlgoodies.com/html5/javascript/display-images-in-black-and-white-using-the-html5-canvas.html#fbid=IXoXabp9SXW
   self.grayScale = function(imgData) {
      var pixels  = imgData.data;

      for (var i = 0, n = pixels.length; i < n; i += 4) {
         var grayscale = pixels[i] * .3 + pixels[i+1] * .59 + pixels[i+2] * .11;
         pixels[i  ] = grayscale;        // red
         pixels[i+1] = grayscale;        // green
         pixels[i+2] = grayscale;        // blue
         //pixels[i+3]              is alpha
      }

      return imgData;
   }
   
   /**
    * Convert a cell position to pixels
    * @param x
    * @param y
    */
   self.getCellCenter = function(x, y) {
      var xPx = - ((x * TILE_DRAW_SIZE) + TILE_DRAW_HALF),
         yPx = - ((y * TILE_DRAW_SIZE) + TILE_DRAW_HALF);

      return {
         x: xPx,
         y: yPx
      };
   }

   self.cacheEntities = function(ctx) {
      each(TILE_STYLE, function(strName, aStyle) {
         var ctx = m_cache.makeNew(aStyle, TILE_SIZE, TILE_SIZE),
            strTileImage = aStyle[TILE_SETTING.IMAGE],
            strBorderColor = aStyle[TILE_SETTING.BORDER_COLOR],
            strBackgroundColor = aStyle[TILE_SETTING.BACKGROUND_COLOR],
            bSquare = aStyle[TILE_SETTING.SQUARE],
            iInsideStartX = TILE_BORDER,
            iInsideStartY = TILE_BORDER,
            iInsideSize = TILE_SIZE - TILE_BORDER_TWICE,
            iBorderRadius = 5,
            x = 0, y = 0;

         ctx.save();

         /*
         if (strTileImage) {
            var img = ResourceManager.getImage(strTileImage);
            ctx.drawImage(img, x, y);
         }
         */
         
         if (bSquare) {
            ctx.fillStyle = strBorderColor;
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

            ctx.fillStyle = strBackgroundColor;
            ctx.fillRect(iInsideStartX, iInsideStartY, iInsideSize, iInsideSize);
         } else {
            ctx.fillStyle = strBorderColor;
            Util.roundRect(ctx, x, y, TILE_SIZE, TILE_SIZE, 10, true, false);

            ctx.fillStyle = strBackgroundColor;
            Util.roundRect(ctx, iInsideStartX, iInsideStartY, iInsideSize, iInsideSize, iBorderRadius, true, false);
            //Util.roundRect(ctx, x + TILE_BORDER, y + TILE_BORDER, TILE_SIZE - TILE_BORDER_TWICE, TILE_SIZE - TILE_BORDER_TWICE, 5, true, false);
         }

         ctx.restore();
      });
   };

   self.renderEntityDebug = function(ctx, tile) {
      var x = tile.getOffsetLeft(),
         y = tile.getOffsetTop(),
         strTile = tile.getStyle(),
         img = m_cache.getCanvas(strTile);

      self.drawEntityClip(ctx, img, x, y);

      if (tile.getText()) {
         ctx.font = TILE_FONT;
         ctx.textAlign = "center";
         ctx.fillStyle = "rgba(255,255,255,0.3)";
         ctx.fillText(tile.getText(), x + (TILE_SIZE / 2) + 1, 1 + y + (TILE_SIZE + TILE_SIZE - TILE_FONT_SIZE) / 2);
         ctx.fillStyle = "rgba(0,0,0,0.6)";
         ctx.fillText(tile.getText(), x + (TILE_SIZE / 2), y + (TILE_SIZE + TILE_SIZE - TILE_FONT_SIZE) / 2);
      }
   };

   self.renderRunningFrame = function(ctx) {
      ctx.save();

      self.resetDisplay(ctx);

      var oEntities = m_world.getTiles();
      each(oEntities, function(id, tile) {
         self.renderEntityDebug(ctx, tile);
      });

      //self.drawTouchPoints(ctx);
      ctx.restore();

   }

   self.renderPausedFrame = function(ctx) {
      if (m_bPauseAnimFinished && m_bPausedFrameRendered) return;
      m_bPausedFrameRendered = true;

      self.renderRunningFrame(ctx);

      self.drawPause(ctx);
   }

   self.renderDebug = function(ctx) {
      if (m_world.isPaused()) {
         self.renderPausedFrame(ctx);
      } else {
         self.renderRunningFrame(ctx);
      }
   }

   self.resetDisplay = function(ctx) {
      // Reset the display
      ctx.fillStyle = "#444";
      ctx.fillRect(0, 0, m_iCameraWidth, m_iCameraHeight);

      // Set camera position
      ctx.translate(
         (m_iOffsetLeft * m_iCameraZoom) + (m_iCameraWidth / 2),
         (m_iOffsetTop * m_iCameraZoom) + (m_iCameraHeight / 2)
      );
      ctx.scale(m_iCameraZoom, m_iCameraZoom);
   }

   self.drawShadows = function(ctx) {
      var shadow = ResourceManager.getImage('shadow.png');
      var oEntities = m_world.getTiles();
      each(oEntities, function(id, tile) {
         ctx.save();

         var x = tile.getOffsetLeft() - TILE_SHADOW_OFFSET,
            y = tile.getOffsetTop() - TILE_SHADOW_OFFSET,
            bHasShadow = tile.getStyle()[TILE_SETTING.IS_BACKGROUND];

         if (bHasShadow) {
            ctx.drawImage(shadow, x, y);
         }

         ctx.restore();
      });
   }

   self.drawPause = function(ctx) {
      ctx.save();

      if (!m_imgPausedFrameGray) {
         var elPauseCanvas = document.createElement('canvas');
         elPauseCanvas.height = canvas.height;
         elPauseCanvas.width = canvas.width;

         var imgPauseFrame = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
         m_imgPausedFrameGray = self.grayScale(imgPauseFrame);

         m_ctxPauseCanvas = elPauseCanvas.getContext("2d");
      }

      // redraw the image in black & white
      ctx.globalAlpha = m_iPauseOpacity;
      m_ctxPauseCanvas.putImageData(m_imgPausedFrameGray, 0, 0);
      ctx.drawImage(m_ctxPauseCanvas.canvas, 0, 0);

      ctx.restore();
   };

   self.drawEntityClip = function(ctx, img, x, y) {
      // Don't bother drawing tiles that wouldn't appear anyway
      if (x < m_iEntityClipMinX) return;
      if (y < m_iEntityClipMinY) return;
      if (x > m_iEntityClipMaxX) return;
      if (y > m_iEntityClipMaxY) return;

      ctx.drawImage(img, x, y);
   };

   self.render = function(ctx) {
      ctx.save();

      self.resetDisplay(ctx);

      self.drawShadows(ctx);

      // Draw each tile
      var oEntities = m_world.getTiles();
      each(oEntities, function(id, tile) {
         ctx.save();

         var x = tile.getOffsetLeft(),
            y = tile.getOffsetTop(),
            strTileImage = tile.getTileImage();

         if (strTileImage) {
            var img = ResourceManager.getImage(strTileImage);
            self.drawEntityClip(ctx, img, x, y);
         } else {
            self.renderEntityDebug(ctx, tile);
         }

         ctx.restore();
      });

      ctx.restore();
   };

   initialize();
};
