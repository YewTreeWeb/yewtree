import {
  addClass,
  removeClass
} from './util';

// Avoid `console` errors in browsers that lack a console.
(function () {
  var method;
  var noop = function () {};
  var methods = [
    'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
    'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
    'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
    'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
  ];
  var length = methods.length;
  var console = (window.console = window.console || {});

  while (length--) {
    method = methods[length];

    // Only stub undefined methods.
    if (!console[method]) {
      console[method] = noop;
    }
  }
}());

// Fallback for font-display, once the API knows a font has loaded, we can apply a class of fonts-loaded to the <html> tag.
(function () {
  try {
    const e = document.createElement('style');
    e.textContent = '@font-face { font-display: swap; }';
    document.documentElement.appendChild(e);
    var isFontDisplaySupported = e.sheet.cssRules[0].cssText.indexOf('font-display') !== -1;
    e.remove();
  } catch (e) {}

  if (isFontDisplaySupported === false && 'fonts' in document) {
    document.fonts.load('1em Open Sans Regular');
    document.fonts.ready.then(function (fontFaceSet) {
      document.documentElement.className += ' fonts-loaded';
    })
  } else {
    // Maybe figure out your own strategy, but this might be sensible:
    document.documentElement.className += ' fonts-loaded';
  }
}());

// Add tabbing indicator to window
function handleFirstTab(e) {
  if (e.keyCode === 9) { // the "I am a keyboard user" key
    document.body.classList.add('user-is-tabbing');
    window.removeEventListener('keydown', handleFirstTab);
  }
}

window.addEventListener('keydown', handleFirstTab);


// Detect if mobile or desktop

const body = document.getElementsByTagName("body")[0];
breakpoints({
  xlarge: ['1281px', '1680px'],
  large: ['981px', '1280px'],
  medium: ['737px', '980px'],
  small: ['481px', '736px'],
  xsmall: [null, '480px']
});

if (browser.mobile) {
  addClass(body, 'is-mobile');
} else {
  breakpoints.on('>medium', function () {
    removeClass(body, 'is-mobile');
    addClass(body, 'is-desktop');
  });
  breakpoints.on('<=medium', function () {
    addClass(body, 'is-mobile');
  });
}
