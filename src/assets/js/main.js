// External
import 'airbnb-browser-shims';

// Internal
import { removeClass } from './modules/util';
import './modules/helpers';
// import './modules/typed';
import './modules/hero';

// Remove loading class fron bosy on window load.
const body = document.getElementsByTagName("body")[0];
window.onload = () => {
	window.setTimeout(() => {
		removeClass(body, 'is-loading');
	}, 100);
};
