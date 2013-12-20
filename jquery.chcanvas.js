/* ****************************************************************************
 * Filename: jquery.chcanvas.js
 * Version: 0.7.0, July 2013
 * Tested jquery versions:
 * - jQuery v0.1
 * ****************************************************************************
 *  * DESCRIPTION:
 * ****************************************************************************
 * 
 * HTML5 image and audio preloader and use images in div elements or canvas
 * 
 * ****************************************************************************
 *  * LICENSE:
 * ****************************************************************************
 *  
 * This project is build under the MIT License (MIT)
 *
 * Copyright (C) 2013
 *  * Christian Amenós - christian.amenos@gmail.com - http://christianamenos.es
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * ****************************************************************************
 */

(function($) {

  var canvas = true;// 0 => canvas; 1 => div (canvas to print images)
  var container = null;//element selected as canvas/container to print images on it
  var context = null;
  var autoprint = false;
  var images = new Array();
  var imagesToLoad = 0;
  var imagesLoaded = 0;
  var imagesLoadedCallback = null;
  var audios = new Array();
  var audiosToLoad = 0;
  var audiosLoaded = 0;
  var audiosLoadedCallback = null;
  var autoloop = false;
  var autoplay = false;
  var removePreviousContent = true;
  var cssBackground = true;
  var extension = 'mp3';

  //PRIVATE FUNCTIONS

  /*****************************************************************************
   * Description: this function will serve as a mere alias for console.log
   * message. In case there is not such a cappability it will throw an alert.
   * In params:
   *  @obj {object}: variable to be debugged
   * Return: none
   ****************************************************************************/
  function _log(obj) {
    if (window.console) {
      console.log(obj);
    } else {
      alert(obj);
    }
  }

  function _increaseImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded === imagesToLoad && imagesLoadedCallback !== null) {
      imagesLoadedCallback();
    }
  }

  function _increaseAudiosLoaded() {
    audiosLoaded++;
    if (audiosLoaded === audiosToLoad && audiosLoadedCallback !== null) {
      audiosLoadedCallback();
    }
  }

  //PLUGIN CONSTRUCTOR
  /*****************************************************************************
   * @autoprint {bool}: if autoprint is set to true, the plugin will print the
   * images on the selected element as soon as it gets all the elements loaded.
   * @imagesCallback {function}: if set is the function that will be called when
   * all the images are loaded.
   * @audiosCallback {function}: if set is the function that will be called when
   * all the audio files are loaded.
   * @autoloop {bool}: if set is to true by default all audio files will be payed
   * on loop mode.
   * @removePreviousContent {bool}: if set is to true by default all content will
   * be erased and the image will be appened in the container if is not a canvas
   * element
   * @cssBackground {bool}: if set is to true by default set the image as the
   * background of the container if is not a canvas element (it's more mandatory
   * than removePreviousContent attribute)
   ****************************************************************************/
  jQuery.fn.setCanvas = function(options) {
    //Default plugin's attributes
    var defaults = {
      autoprint: false,
      autoplay: false,
      imagesCallback: null,
      audiosCallback: null,
      autoloop: false,
      removePreviousContent: true,
      cssBackground: true
    };
    //Option settings. Overwritten if defined by the programmer
    var o = jQuery.extend(defaults, options);
    autoprint = o.autoprint;
    imagesLoadedCallback = o.imagesCallback;
    audiosLoadedCallback = o.audiosCallback;
    autoplay = o.autoplay;
    autoloop = o.autoloop;
    removePreviousContent = o.removePreviousContent;
    cssBackground = o.cssBackground;
    /* 
     * If the selected element is detected as a canvas, the plugin will undestand
     * that the will be necessary to use canvas printing functionalitites.
     * 
     * Otherwise the element will be used as a container by default and the
     * images will be appended on it.
     */
    canvas = $(this).prop("tagName").toLowerCase() === 'canvas';
    if (canvas) {
      context = $(this)[0].getContext('2d');
    } else {
      container = $(this);
    }
    //we have to return the selected element with the changes on it
    return this;
  };

  jQuery.fn.preloadImages = function(arrayOfImages) {
    $(arrayOfImages).each(function(element) {
      imagesToLoad++;
      $('<img/>').attr('src', arrayOfImages[element]).on('load', function() {
        this.filename = arrayOfImages[element];
        images.push(this);
        if (!canvas && autoprint) {
          if (autoprint) {
            if (cssBackground) {
              $(container).css('background-image', 'url(' + this.src + ')');
              $(container).css('background-position', 'center center');
              $(container).css('background-repeat', 'no-repeat');
            } else {
              if (removePreviousContent) {
                $(container).html();
              }
              $(container).append(this);
            }
          }
        }
        _increaseImagesLoaded();
      });
    });
    return this;
  };

  jQuery.fn.preloadAudios = function(arrayOfAudios) {
    //check the available audio type of data in order to see if the browser allows this kind of file and add the fileextension automatically
    var aux = document.createElement('audio');
    extension = 'mp3';
    if (!(aux.canPlayType && aux.canPlayType('audio/mpeg;').replace(/no/, ''))) {
      extension = 'ogg';
      if (!(aux.canPlayType && aux.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''))) {
        extension = 'wav';
      }
    }

    $(arrayOfAudios).each(function(element) {
      audiosToLoad++;
      $('<audio/>').attr('src', arrayOfAudios[element] + '.' + extension).on('loadeddata', function() {
        this.filename = arrayOfAudios[element];
        audios.push(this);
        if (autoplay) {
          if (autoloop) {
            $(this).loop = true;
          }
          $(this).play();
        }
        _increaseAudiosLoaded();
      });
    });
    return this;
  };

  //print an image on canvas or in a div; depending on the image identifier
  jQuery.fn.print = function(identifier, xPos, yPos, imageWidth, imageHeight, frameWidth, frameHeight, frameX, frameY) {
    /*
     * - identifier: is the filename
     * - xPos: is the x position where we want to print the image
     * - yPos: is the y position where we want to print the image
     * - imageWidth: is the width in pixels of the original image
     * - imageHeight: is the height in pixels of the original image
     * - frameWidth: is the width of the frame on the original image
     * - frameHeight: is the height of the frame on the original image
     * - frameX: is the horizontal position of the frame to be displayed starts on 0
     * - frameY: is the vertical position of the frame to be displayed starts on 0
     */

    /* -----------------------------
     *  SIMPLE:
     * -----------------------------
     * drawImage(img,x,y);
     * - img: image to print
     * - x: coordinate x to print
     * - y:coordinate y to print
     * -----------------------------
     *  ADVANCED:
     * -----------------------------
     * drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
     * - img: image to print
     * - sx: x coordinate to start clipping (optional)
     * - sy: y coordinate to start clipping (optional)
     * - swidth: the width of the clipped image; width from the original image (optional)
     * - sheight: the height of the clipped image; height from the original image (optional)
     * - x: the x coordinate to place the image on the canvas
     * - y: the y coordinate to place the image on the canvas
     * - width: the final width of the image; reduces or scale the image (optional)
     * - height: the final height of the image; reduces or scale the image (optional)
     */

    img = null;
    for (var i = 0; i < images.length; i++) {
      if (identifier === images[i].filename) {
        img = images[i];
        break;
      }
    }
    if (canvas) {
      var simple = true;
      if (typeof xPos === 'undefined') {
        xPos = 0;
        yPos = 0;

      } else {
        if (typeof yPos === 'undefined') {
          yPos = xPos;
        } else {
          if (typeof imageWidth !== 'undefined') {
            simple = false;
            if (typeof imageHeight !== 'undefined') {
              imageHeight = imageWidth;
            } else {
              if (typeof frameWidth !== 'undefined') {
                frameWidth = imageWidth;
              } else {
                if (typeof frameHeight !== 'undefined') {
                  frameHeight = frameWidth;
                } else {
                  if (typeof frameX !== 'undefined') {
                    frameX = 0;
                  }
                  if (typeof frameY !== 'undefined') {
                    frameY = 0;
                  }
                }
              }
            }
          }
        }
      }
      if (simple) {
        context.drawImage(img, xPos, yPos);
      } else {
        context.drawImage(img, frameWidth * frameX, frameWidth * frameY, frameWidth, frameHeight, xPos, yPos, frameWidth, frameHeight);
      }
    } else {
      if (cssBackground) {
        $(container).css('background-image', 'url(' + img.src + ')');
        $(container).css('background-position', 'center center');
        $(container).css('background-repeat', 'no-repeat');
      } else {
        if (removePreviousContent) {
          $(container).html();
        }
        $(container).append(img);
      }
    }
  };

  //plays an audio file; from it's identifier
  jQuery.fn.reproduce = function(identifier, loop) {
    for (var i = 0; i < audios.length; i++) {
      if (identifier === audios[i].filename) {
        audio = audios[i];
        break;
      }
    }
    if (autoloop) {
      audio.loop = true;
    }
    audio.play();
  };

})(jQuery);
