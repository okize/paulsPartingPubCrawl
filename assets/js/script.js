/*
 * MBP - Mobile boilerplate helper functions
 */

(function(document){

window.MBP = window.MBP || {}; 


/* 
  * Fix for iPhone viewport scale bug 
  * http://www.blog.highub.com/mobile-2/a-fix-for-iphone-viewport-scale-bug/
*/

MBP.viewportmeta = document.querySelector && document.querySelector('meta[name="viewport"]');
MBP.ua = navigator.userAgent;

MBP.scaleFix = function () {
  if (MBP.viewportmeta && /iPhone|iPad|iPod/.test(MBP.ua) && !/Opera Mini/.test(MBP.ua)) {
    MBP.viewportmeta.content = "width=device-width, minimum-scale=1.0, maximum-scale=1.0";
    document.addEventListener("gesturestart", MBP.gestureStart, false);
  }
};
MBP.gestureStart = function () {
  MBP.viewportmeta.content = "width=device-width, minimum-scale=0.25, maximum-scale=1.6";
};


/*
  * Normalized hide address bar for iOS & Android
  * (c) Scott Jehl, scottjehl.com
  * MIT License
*/

// If we split this up into two functions we can reuse
// this function if we aren't doing full page reloads.

// If we cache this we don't need to re-calibrate everytime we call
// the hide url bar
MBP.BODY_SCROLL_TOP = false;

// So we don't redefine this function everytime we
// we call hideUrlBar
MBP.getScrollTop = function(){
  var win = window,
      doc = document;

  return win.pageYOffset || doc.compatMode === "CSS1Compat" && doc.documentElement.scrollTop || doc.body.scrollTop || 0;
};

// It should be up to the mobile
MBP.hideUrlBar = function(){
    var win = window;

    // if there is a hash, or MBP.BODY_SCROLL_TOP hasn't been set yet, wait till that happens
    if( !location.hash && MBP.BODY_SCROLL_TOP !== false){
        win.scrollTo( 0, MBP.BODY_SCROLL_TOP === 1 ? 0 : 1 );
    }
};

MBP.hideUrlBarOnLoad = function () {
  var win = window,
      doc = win.document,
      bodycheck;

  // If there's a hash, or addEventListener is undefined, stop here
  if( !location.hash && win.addEventListener ) {

    //scroll to 1
    window.scrollTo( 0, 1 );
    MBP.BODY_SCROLL_TOP = 1;

    //reset to 0 on bodyready, if needed
    bodycheck = setInterval(function() {
      if( doc.body ) {
        clearInterval( bodycheck );
        MBP.BODY_SCROLL_TOP = MBP.getScrollTop();
        MBP.hideUrlBar();
      }
    }, 15 );

    win.addEventListener( "load", function() {
      setTimeout(function() {
        //at load, if user hasn't scrolled more than 20 or so...
        if( MBP.getScrollTop() < 20 ) {
          //reset to hide addr bar at onload
          MBP.hideUrlBar();
        }
      }, 0);
    } );
  }
};


/* 
   * Fast Buttons - read wiki below before using
   * https://github.com/h5bp/mobile-boilerplate/wiki/JavaScript-Helper
*/

MBP.fastButton = function (element, handler) {
  this.handler = handler;
	
	if (element.length && element.length > 1) {
    for (var singleElIdx in element) {
      this.addClickEvent(element[singleElIdx]);
    }
  } else {
    this.addClickEvent(element);
  }
};
 
MBP.fastButton.prototype.handleEvent = function(event) {
	event = event || window.event;
  switch (event.type) {
    case 'touchstart': this.onTouchStart(event); break;
    case 'touchmove': this.onTouchMove(event); break;
    case 'touchend': this.onClick(event); break;
    case 'click': this.onClick(event); break;
  }
};

MBP.fastButton.prototype.onTouchStart = function(event) {
  var element = event.srcElement;
  event.stopPropagation();
  element.addEventListener('touchend', this, false);
  document.body.addEventListener('touchmove', this, false);
  this.startX = event.touches[0].clientX;
  this.startY = event.touches[0].clientY;
  element.style.backgroundColor = "rgba(0,0,0,.7)";
};

MBP.fastButton.prototype.onTouchMove = function(event) {
  if(Math.abs(event.touches[0].clientX - this.startX) > 10 || 
    Math.abs(event.touches[0].clientY - this.startY) > 10    ) {
    this.reset(element);
  }
};

MBP.fastButton.prototype.onClick = function(event) {
	event = event || window.event;
  var element = event.srcElement;
  if (event.stopPropagation) { event.stopPropagation(); }
  this.reset(event);
  this.handler.apply(event.currentTarget, [event]);
  if(event.type == 'touchend') {
    MBP.preventGhostClick(this.startX, this.startY);
  }
  element.style.backgroundColor = "";
};

MBP.fastButton.prototype.reset = function(event) {
  var element = event.srcElement;
	rmEvt(element, "touchend", this, false);
	rmEvt(document.body, "touchmove", this, false);
  element.style.backgroundColor = "";
};

MBP.fastButton.prototype.addClickEvent = function(element) {
  addEvt(element, "touchstart", this, false);
  addEvt(element, "click", this, false);
};

MBP.preventGhostClick = function (x, y) {
  MBP.coords.push(x, y);
  window.setTimeout(function (){
    MBP.coords.splice(0, 2);
  }, 2500);
};

MBP.ghostClickHandler = function (event) {
  if (!MBP.hadTouchEvent && 'ontouchstart' in window) {
    // This is a bit of fun for Android 2.3...
    // If you change window.location via fastButton, a click event will fire
    // on the new page, as if the events are continuing from the previous page.
    // We pick that event up here, but MBP.coords is empty, because it's a new page,
    // so we don't prevent it. Here's we're assuming that click events on touch devices
    // that occur without a preceding touchStart are to be ignored. 
    event.stopPropagation();
    event.preventDefault();
    return;
  }
  for(var i = 0, len = MBP.coords.length; i < len; i += 2) {
    var x = MBP.coords[i];
    var y = MBP.coords[i + 1];
    if(Math.abs(event.clientX - x) < 25 && Math.abs(event.clientY - y) < 25) {
      event.stopPropagation();
      event.preventDefault();
    }
  }
};

if (document.addEventListener) {
  document.addEventListener('click', MBP.ghostClickHandler, true);
}

addEvt( document.documentElement, 'touchstart', function() {
  MBP.hadTouchEvent = true;
}, false);
                            
MBP.coords = [];

// fn arg can be an object or a function, thanks to handleEvent
// read more about the explanation at: http://www.thecssninja.com/javascript/handleevent
function addEvt(el, evt, fn, bubble) {
  if("addEventListener" in el) {
    // BBOS6 doesn't support handleEvent, catch and polyfill
    try {
      el.addEventListener(evt, fn, bubble);
    } catch(e) {
      if(typeof fn == "object" && fn.handleEvent) {
        el.addEventListener(evt, function(e){
        // Bind fn as this and set first arg as event object
        fn.handleEvent.call(fn,e);
        }, bubble);
      } else {
        throw e;
      }
    }
  } else if("attachEvent" in el) {
    // check if the callback is an object and contains handleEvent
    if(typeof fn == "object" && fn.handleEvent) {
      el.attachEvent("on" + evt, function(){
        // Bind fn as this
        fn.handleEvent.call(fn);
      });
    } else {
      el.attachEvent("on" + evt, fn);
    }
  }
}

function rmEvt(el, evt, fn, bubble) {
  if("removeEventListener" in el) {
    // BBOS6 doesn't support handleEvent, catch and polyfill
    try {
      el.removeEventListener(evt, fn, bubble);
    } catch(e) {
      if(typeof fn == "object" && fn.handleEvent) {
        el.removeEventListener(evt, function(e){
          // Bind fn as this and set first arg as event object
          fn.handleEvent.call(fn,e);
        }, bubble);
      } else {
        throw e;
      }
    }
  } else if("detachEvent" in el) {
    // check if the callback is an object and contains handleEvent
    if(typeof fn == "object" && fn.handleEvent) {
      el.detachEvent("on" + evt, function(){
        // Bind fn as this
        fn.handleEvent.call(fn);
      });
    } else {
      el.detachEvent("on" + evt, fn);
    }
  }
}


/* 
  * Autogrow
  * http://googlecode.blogspot.com/2009/07/gmail-for-mobile-html5-series.html
*/

MBP.autogrow = function (element, lh) {
  function handler(e){
    var newHeight = this.scrollHeight,
        currentHeight = this.clientHeight;
    if (newHeight > currentHeight) {
      this.style.height = newHeight + 3 * textLineHeight + "px";
    }
  }

  var setLineHeight = (lh) ? lh : 12,
      textLineHeight = element.currentStyle ? element.currentStyle.lineHeight : 
                       getComputedStyle(element, null).lineHeight;

  textLineHeight = (textLineHeight.indexOf("px") == -1) ? setLineHeight :
                   parseInt(textLineHeight, 10);

  element.style.overflow = "hidden";
  element.addEventListener ? element.addEventListener('keyup', handler, false) :
                             element.attachEvent('onkeyup', handler);
};


/* 
  * Enable active
  * Enable CSS active pseudo styles in Mobile Safari
  * http://miniapps.co.uk/blog/post/enable-css-active-pseudo-styles-in-mobile-safari/
*/

MBP.enableActive = function () {
  document.addEventListener("touchstart", function() {}, false);
};


/* 
  * Prevent iOS from zooming onfocus
  * https://github.com/h5bp/mobile-boilerplate/pull/108
*/

MBP.preventZoom = function () {
  var formFields = document.querySelectorAll('input, select, textarea'),
  	  contentString = 'width=device-width,initial-scale=1,maximum-scale=',
  	  i = 0;
  for(i = 0; i < formFields.length; i++) {
    formFields[i].onfocus = function() {
      MBP.viewportmeta.content = contentString + '1';
    };
    formFields[i].onblur = function() {
      MBP.viewportmeta.content = contentString + '10';
    };
  }
};

/*
  * iOS Startup Image helper
*/
MBP.startupImage = function () {

	var portrait, landscape, pixelRatio, head, link1, link2;

	pixelRatio = window.devicePixelRatio;
	head = document.getElementsByTagName('head')[0];

	if (navigator.platform === 'iPad') {

		portrait = pixelRatio === 2 ? "img/startup/startup-tablet-portrait-retina.png" : "img/startup/startup-tablet-portrait.png";
		landscape = pixelRatio === 2 ? "img/startup/startup-tablet-landscape-retina.png" : "img/startup/startup-tablet-landscape.png";

		link1 = document.createElement('link');
		link1.setAttribute('rel', 'apple-touch-startup-image');
		link1.setAttribute('media', 'screen and (orientation: portrait)');
		link1.setAttribute('href', portrait);
		head.appendChild(link1);

		link2 = document.createElement('link');
		link2.setAttribute('rel', 'apple-touch-startup-image');
		link2.setAttribute('media', 'screen and (orientation: landscape)');
		link2.setAttribute('href', landscape);
		head.appendChild(link2);

	} else {

		portrait = pixelRatio === 2 ? "img/startup/startup-retina.png" : "img/startup/startup.png";

		link1 = document.createElement('link');
		link1.setAttribute('rel', 'apple-touch-startup-image');
		link1.setAttribute('href', portrait);
		head.appendChild(link1);
	}
};


/* 
  * Original jQuery snippet for Prevent iOS from zooming onfocus
  *  http://nerd.vasilis.nl/prevent-ios-from-zooming-onfocus/
*/
// $('input, select, textarea').bind('focus blur', function(event) {	  	
//	MBP.viewportmeta.content = 'width=device-width,initial-scale=1,maximum-scale=' + (event.type == 'blur' ? 10 : 1);  	
// });

})(document);

/*
 * jQuery Reveal Plugin 1.0
 * www.ZURB.com
 * Copyright 2010, ZURB
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
*/(function(e){e("a[data-reveal-id]").live("click",function(t){t.preventDefault();var n=e(this).attr("data-reveal-id");e("#"+n).reveal(e(this).data())}),e.fn.reveal=function(t){var n={animation:"fadeAndPop",animationSpeed:300,closeOnBackgroundClick:!0,dismissModalClass:"close-reveal-modal"},t=e.extend({},n,t);return this.each(function(){function u(){o.unbind("click.modalEvent"),e("."+t.dismissModalClass).unbind("click.modalEvent"),s||(c(),t.animation=="fadeAndPop"&&(n.css({top:e(document).scrollTop()-i,opacity:0,visibility:"visible"}),o.fadeIn(t.animationSpeed/2),n.delay(t.animationSpeed/2).animate({top:e(document).scrollTop()+r+"px",opacity:1},t.animationSpeed,l)),t.animation=="fade"&&(n.css({opacity:0,visibility:"visible",top:e(document).scrollTop()+r}),o.fadeIn(t.animationSpeed/2),n.delay(t.animationSpeed/2).animate({opacity:1},t.animationSpeed,l)),t.animation=="none"&&(n.css({visibility:"visible",top:e(document).scrollTop()+r}),o.css({display:"block"}),l())),n.unbind("reveal:open",u)}function a(){s||(c(),t.animation=="fadeAndPop"&&(o.delay(t.animationSpeed).fadeOut(t.animationSpeed),n.animate({top:e(document).scrollTop()-i+"px",opacity:0},t.animationSpeed/2,function(){n.css({top:r,opacity:1,visibility:"hidden"}),l()})),t.animation=="fade"&&(o.delay(t.animationSpeed).fadeOut(t.animationSpeed),n.animate({opacity:0},t.animationSpeed,function(){n.css({opacity:1,visibility:"hidden",top:r}),l()})),t.animation=="none"&&(n.css({visibility:"hidden",top:r}),o.css({display:"none"}))),n.unbind("reveal:close",a)}function l(){s=!1}function c(){s=!0}var n=e(this),r=parseInt(n.css("top")),i=n.height()+r,s=!1,o=e(".reveal-modal-bg");o.length==0&&(o=e('<div class="reveal-modal-bg" />').insertAfter(n),o.fadeTo("fast",.8)),n.bind("reveal:open",u),n.bind("reveal:close",a),n.trigger("reveal:open");var f=e("."+t.dismissModalClass).bind("click.modalEvent",function(){n.trigger("reveal:close")});t.closeOnBackgroundClick&&(o.css({cursor:"pointer"}),o.bind("click.modalEvent",function(){n.trigger("reveal:close")})),e("body").keyup(function(e){e.which===27&&n.trigger("reveal:close")})})}})(jQuery);



/*! jQuery slabtext plugin v2 MIT/GPL2 @freqdec */
(function($){$.fn.slabText=function(options){var settings={fontRatio:0.78,forceNewCharCount:true,wrapAmpersand:true,headerBreakpoint:null,viewportBreakpoint:null,noResizeEvent:false};$("body").addClass("slabtexted");return this.each(function(){if(options){$.extend(settings,options)}var $this=$(this),keepSpans=$("span.slabtext",$this).length,words=keepSpans?[]:String($.trim($this.text())).replace(/\s{2,}/g," ").split(" "),origFontSize=null,idealCharPerLine=null,fontRatio=settings.fontRatio,forceNewCharCount=settings.forceNewCharCount,headerBreakpoint=settings.headerBreakpoint,viewportBreakpoint=settings.viewportBreakpoint,resizeThrottle=null,viewportWidth=$(window).width();var grabPixelFontSize=function(){var dummy=jQuery('<div style="display:none;font-size:1em;margin:0;padding:0;height:auto;line-height:1;border:0;">&nbsp;</div>').appendTo($this),emH=dummy.height();dummy.remove();return emH};var resizeSlabs=function resizeSlabs(){var parentWidth=$this.width(),fs;$this.removeClass("slabtextdone slabtextinactive");if(viewportBreakpoint&&viewportBreakpoint>viewportWidth||headerBreakpoint&&headerBreakpoint>parentWidth){$this.addClass("slabtextinactive");return}fs=grabPixelFontSize();if(!keepSpans&&(forceNewCharCount||fs!=origFontSize)){origFontSize=fs;var newCharPerLine=Math.min(60,Math.floor(parentWidth/(origFontSize*fontRatio))),wordIndex=0,lineText=[],counter=0,preText="",postText="",finalText="",preDiff,postDiff;if(newCharPerLine!=idealCharPerLine){idealCharPerLine=newCharPerLine;while(wordIndex<words.length){postText="";while(postText.length<idealCharPerLine){preText=postText;postText+=words[wordIndex]+" ";if(++wordIndex>=words.length){break}}preDiff=idealCharPerLine-preText.length;postDiff=postText.length-idealCharPerLine;if((preDiff<postDiff)&&(preText.length>2)){finalText=preText;wordIndex--}else{finalText=postText}lineText.push('<span class="slabtext">'+(settings.wrapAmpersand?finalText.replace("&",'<span class="amp">&amp;</span>'):finalText)+"</span>")}$this.html(lineText.join(""))}}else{origFontSize=fs}$("span.slabtext",$this).each(function(){var $span=$(this),innerText=$span.text(),wordSpacing=innerText.split(" ").length>1,diff,ratio,fontSize;$span.css("word-spacing",0).css("letter-spacing",0);ratio=parentWidth/$span.width();fontSize=parseFloat(this.style.fontSize)||origFontSize;$span.css("font-size",(fontSize*ratio).toFixed(3)+"px");diff=parentWidth-$span.width();if(diff){$span.css((wordSpacing?"word":"letter")+"-spacing",(diff/(wordSpacing?innerText.split(" ").length-1:innerText.length)).toFixed(3)+"px")}});$this.addClass("slabtextdone")};resizeSlabs();if(!settings.noResizeEvent){$(window).resize(function(){if($(window).width()==viewportWidth){return}viewportWidth=$(window).width();clearTimeout(resizeThrottle);resizeThrottle=setTimeout(resizeSlabs,300)})}})}})(jQuery);