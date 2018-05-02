document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  var opts = window.RED_ALERT_OPTIONS || {};
  var bodyStyles = {};

  var widget = {
    id: 'RED_ALERT_WIDGET',
    org: (opts.org || null),
    cookieExpirationDays: parseFloat((opts.cookieExpirationDays || 1)),
    alwaysShow: !!(opts.alwaysShow || false),
    disableGoogleAnalytics: !!(opts.disableGoogleAnalytics || false),
    iframeHost: (typeof(opts.iframeHost) === 'undefined' ? 'https://redalert.battleforthenet.com' : opts.iframeHost),
    position: (opts.position || null),

    maximize: function() {
      document.getElementById(this.id).classList.add('RAW--maximized');
      bodyStyles.overflow = document.body.style.overflow;
      bodyStyles.position = document.body.style.position;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
    },

    closeWindow: function() {
      var el = document.getElementById(this.id);
      el.classList.add('RAW--closing')
      setTimeout(function(){
        el.parentNode.removeChild(el);
        document.body.style.overflow = bodyStyles.overflow;
        document.body.style.position = bodyStyles.position;
      }, 300);
    },

    getCookie: function(cname) {
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
    },

    setCookie: function(name, val, exdays) {
      var d = new Date();
      d.setTime(d.getTime()+(exdays*24*60*60*1000));

      var expires = "expires="+d.toGMTString();
      document.cookie = name + "=" + val + "; " + expires + "; path=/";
    },

    getIframeSrc: function() {
      var src = this.iframeHost + '/?';

      if (this.org) {
        src += 'org=' + encodeURIComponent(this.org) + '&';
      }

      if (this.disableGoogleAnalytics) {
        src += 'ga=false&';
      }

      if (this.position) {
        src += 'position=' + this.position + '&';
      }

      return src.replace(/(\?|&)$/, '');
    },

    createIframe: function() {
      var wrapper = document.createElement('div');
      wrapper.id = this.id;
      var iframe = document.createElement('iframe');
      iframe.src = this.getIframeSrc();
      iframe.frameBorder = 0;
      iframe.allowTransparency = true;
      // iframe.style.display = 'none';
      wrapper.appendChild(iframe);
      document.body.appendChild(wrapper);
      return wrapper;
    },

    injectCSS: function(id, css) {
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
    },

    receiveMessage: function(event) {
      if (!event.data.RED_ALERT) return;

      switch (event.data.action) {
        case 'maximize':
          return this.maximize();
        case 'closeWindow':
          return this.closeWindow();
      }
    },

    init: function() {
      var cookieName = '_RED_ALERT_WIDGET_SHOWN';

      if (this.alwaysShow || window.location.href.indexOf(this.id) !== -1 || !this.getCookie(cookieName)) {
        this.setCookie(cookieName, 'true', this.cookieExpirationDays);

        var left, right;

        if (this.position === 'left') {
          left = '0';
          right = 'auto';
        }
        else {
          left = 'auto';
          right = '0';
        }

        this.injectCSS('RED_ALERT_CSS',
          '#' + this.id + ' { position: fixed; right: ' + right + '; left: ' + left + '; bottom: 0px; width: 450px; height: 350px; z-index: 20000; -webkit-overflow-scrolling: touch; overflow: hidden; transition: width .2s ease-in, height .2s ease-in; } ' +
          '#' + this.id + '.RAW--maximized { width: 100%; height: 100%; } ' +
          '#' + this.id + '.RAW--closing { transform: scale(0); transform-origin: bottom right; opacity: 0; transition: transform .2s ease-in, opacity .2s ease-in; } ' +
          '#' + this.id + ' iframe { width: 100%; height: 100%; }'
        );

        this.createIframe();

        window.addEventListener('message', this.receiveMessage.bind(this));
      }
    }
  };

  widget.init();
});
