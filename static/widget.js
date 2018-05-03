(function() {
  'use strict';

  var domId = 'RED_ALERT_WIDGET';
  var animationDuration = 200;

  // user-configurable options
  var opts = window.RED_ALERT_OPTIONS || {};
  var org = opts.org || null;
  var cookieExpirationDays = parseFloat(opts.cookieExpirationDays || 1);
  var alwaysShow = !!(opts.alwaysShow || window.location.hash.indexOf('ALWAYS_SHOW_RED_ALERT') !== -1);
  var disableGoogleAnalytics = !!opts.disableGoogleAnalytics;
  var iframeHost = opts.iframeHost !== undefined ? opts.iframeHost : 'https://redalert.battleforthenet.com';
  var position = opts.position || null;
  var cowardlyRefuseToMaximize = !!opts.cowardlyRefuseToMaximize;

  var stylesToReset = {};

  function maximize() {
    stylesToReset = {
      overflow: document.body.style.overflow
    };

    document.getElementById(domId).classList.add('RAW--maximized');

    setTimeout(function(){
      document.body.style.overflow = 'hidden';

      var isProbablyMobile = window.innerWidth < 500;

      if (isProbablyMobile) {
        stylesToReset.position = document.body.style.position;
        stylesToReset.scrollTop = window.pageYOffset;
        document.body.style.position = 'fixed';
      }
    }, animationDuration);
  }

  function closeWindow() {
    document.body.style.overflow = stylesToReset.overflow;

    if (stylesToReset.position !== undefined) {
      document.body.style.position = stylesToReset.position;
    }

    if (stylesToReset.scrollTop !== undefined) {
      window.scrollTo(0, stylesToReset.scrollTop);
    }

    window.removeEventListener('message', receiveMessage);

    var el = document.getElementById(domId);
    el.classList.add('RAW--closing')
    setTimeout(function(){
      el.parentNode.removeChild(el);
    }, animationDuration);
  }

  function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    var c;

    for(var i = 0; i < ca.length; i++) {
      c = ca[i].trim();
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }

    return "";
  }

  function setCookie(name, val, exdays) {
    var d = new Date();
    d.setTime(d.getTime()+(exdays*24*60*60*1000));

    var expires = "expires="+d.toGMTString();
    document.cookie = name + "=" + val + "; " + expires + "; path=/";
  }

  function getIframeSrc() {
    var src = iframeHost + '/?';

    if (org) {
      src += 'org=' + encodeURIComponent(org) + '&';
    }

    if (disableGoogleAnalytics) {
      src += 'ga=false&';
    }

    if (position) {
      src += 'position=' + position + '&';
    }

    if (cowardlyRefuseToMaximize) {
      src += 'dayofaction=false&';
    }

    return src.replace(/(\?|&)$/, '');
  }

  function createIframe() {
    var wrapper = document.createElement('div');
    wrapper.id = domId;
    var iframe = document.createElement('iframe');
    iframe.src = getIframeSrc();
    iframe.frameBorder = 0;
    iframe.allowTransparency = true;
    // iframe.style.display = 'none';
    wrapper.appendChild(iframe);
    document.body.appendChild(wrapper);
    return wrapper;
  }

  function injectCSS(id, css) {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.id = id;
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    }
    else {
      style.appendChild(document.createTextNode(css));
    }
    document.head.appendChild(style);
  }

  function receiveMessage(event) {
    if (!event.data.RED_ALERT) return;

    switch (event.data.action) {
      case 'maximize':
        return maximize();
      case 'closeWindow':
        return closeWindow();
    }
  }

  function init() {
    var cookieName = '_RED_ALERT_WIDGET_SHOWN';
    var hasNotBeenShown = !getCookie(cookieName);

    if (alwaysShow || hasNotBeenShown) {
      setCookie(cookieName, 'true', cookieExpirationDays);

      var left, right;

      if (position === 'left') {
        left = '0';
        right = 'auto';
      }
      else {
        left = 'auto';
        right = '0';
      }

      injectCSS('RED_ALERT_CSS',
        '#' + domId + ' { position: fixed; right: ' + right + '; left: ' + left + '; bottom: 0px; width: 450px; height: 350px; z-index: 20000; -webkit-overflow-scrolling: touch; overflow: hidden; transition: width ' + animationDuration + 'ms ease-in, height ' + animationDuration + 'ms ease-in; } ' +
        '#' + domId + '.RAW--maximized { width: 100%; height: 100%; } ' +
        '#' + domId + '.RAW--closing { transform: scale(0); transform-origin: bottom right; opacity: 0; transition: transform ' + animationDuration + 'ms ease-in, opacity ' + animationDuration + 'ms ease-in; } ' +
        '#' + domId + ' iframe { width: 100%; height: 100%; }'
      );

      createIframe();

      // listen for messages from iframe
      window.addEventListener('message', receiveMessage);
    }

    document.removeEventListener('DOMContentLoaded', init);
  }

  // Wait for DOM content to load.
  switch(document.readyState) {
    case 'complete':
    case 'loaded':
    case 'interactive':
      init();
      break;
    default:
      document.addEventListener('DOMContentLoaded', init);
  }
})();
