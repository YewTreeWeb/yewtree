// External
import 'airbnb-browser-shims';

// Internal
import { setAttributes, removeAttributes } from './modules/util';
import './modules/helpers';
// import './modules/typed';
import './modules/hero';

const body = document.getElementsByTagName("body")[0];

// Remove loading class fron bosy on window load.
window.onload = () => {
	window.setTimeout(() => {
		removeClass(body, 'is-loading');
	}, 100);
};

// LocalStroage
if (localStorage.getItem('theme')) {
  const theme = localStorage.getItem('theme');
  body.removeAttributes('data-theme', 'light');
  body.removeAttributes('data-theme', 'dark');
  body.setAttributes(theme);
}

const switchTheme = document.getElementById('switch-theme');
// const toggleLight = document.querySelector('.toggle-light');
// const toggleDark = document.querySelector('.toggle-dark');

switchTheme.addEventListener('click', function(e) {
  e.preventDefault();
  if (body.getAttribute('data-theme') === "light") {
    localStorage.setItem('theme', 'dark');
    sessionStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
    sessionStorage.setItem('theme', 'light');
  }
});
// toggleLight.addEventListener('click', function(e) {
//   e.preventDefault();
//   addClass(body, 'light');
//   removeClass(body, 'dark');
//   localStorage.setItem('theme', 'light');
// });
// toggleDark.addEventListener('click', function(e) {
//   e.preventDefault();
//   addClass(body, 'dark');
//   removeClass(body, 'light');
//   localStorage.setItem('theme', 'dark');
// });
