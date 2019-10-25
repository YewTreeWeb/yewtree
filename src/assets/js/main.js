// External
import 'airbnb-browser-shims';

// Internal
import {
  removeClass,
  addClass
} from './modules/util';
import './modules/helpers';
import './modules/hero';
import './modules/sticky-hero';

const body = document.getElementsByTagName('body')[0];
const html = document.getElementsByTagName('html')[0];

// Remove loading class fron bosy on window load.
window.onload = () => {
  window.setTimeout(() => {
    removeClass(body, 'is-loading');
  }, 100);
};

html.setAttribute('data-browser', browser.name);

// LocalStroage.
if (typeof localStorage != 'undefined') {
  if (localStorage.getItem('theme')) {
    const theme = localStorage.getItem('theme');
    body.removeAttribute('data-theme', 'light');
    body.removeAttribute('data-theme', 'dark');
    body.setAttribute('data-theme', theme);
  }
}

// sessionStorage.
if (typeof sessionStorage != 'undefined') {
  const bubble = document.querySelector('.bubble');
  if (sessionStorage.getItem('theme')) {
    if (sessionStorage['theme'] == 'light') {
      bubble.innerHTML = '<h3>I see you walk the path of light.</h3>';
    } else {
      bubble.innerHTML = '<h3>The dark side is strong with you.</h3>';
    }
  }
}

// set dark mode if user's system prefers it.
if (window.matchMedia) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('supports matchmedia');
  }
  if (matchMedia('(prefers-color-scheme: dark)').matches && localStorage.getItem('theme') === null) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('prefers dark');
    }
    body.removeAttribute('data-theme', 'light');
    body.setAttribute('data-theme', 'dark');
  }
}

// Switch between dark and light mode.
const switchTheme = document.getElementById('switch-theme');

switchTheme.addEventListener('click', function (e) {
  e.preventDefault();

  addClass(body, 'color-theme-in-transition');
  if (body.getAttribute('data-theme') === 'light') {
    body.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    sessionStorage.setItem('theme', 'dark');
    document.querySelector('.bubble').innerHTML = '<h3>The dark side is strong with you.</h3>';
  } else {
    body.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
    sessionStorage.setItem('theme', 'light');
    document.querySelector('.bubble').innerHTML = '<h3>I see you walk the path of light.</h3>';
  }
  window.setTimeout(() => {
    removeClass(body, 'color-theme-in-transition');
  }, 1500);
});
