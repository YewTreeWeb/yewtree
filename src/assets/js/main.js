// External
import 'airbnb-browser-shims';

// Internal
import { removeClass } from './modules/util';
import './modules/helpers';
// import './modules/typed';
import './modules/hero';

const body = document.getElementsByTagName('body')[0];

// Remove loading class fron bosy on window load.
window.onload = () => {
	window.setTimeout(() => {
		removeClass(body, 'is-loading');
	}, 100);
};

// LocalStroage
if (typeof localStorage != 'undefined') {
	if (localStorage.getItem('theme')) {
		const theme = localStorage.getItem('theme');
		body.removeAttribute('data-theme', 'light');
		body.removeAttribute('data-theme', 'dark');
		body.setAttribute('data-theme', theme);
	}
}

// sessionStorage
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

const switchTheme = document.getElementById('switch-theme');
// const toggleLight = document.querySelector('.toggle-light');
// const toggleDark = document.querySelector('.toggle-dark');

switchTheme.addEventListener('click', function(e) {
  e.preventDefault();
  console.log('clicked');
  
	if (body.getAttribute('data-theme') === 'light') {
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
