import { addClass, removeClass } from './util';

// Create random selection of quotes
const quote = document.getElementsByClassName('hero__quote');
function randHeadings() {
	const random = Math.floor(Math.random() * quote.length) + 0;
	for (let i = 0; i < quote.length; i++) {
        setTimeout(() => {
            addClass(quote[random], 'hero__quote--active');
            setTimeout(() => {
                quote[i].style.opacity = '0';
                setTimeout(() => {
                    removeClass(quote[i], 'hero__quote--active');
                }, 1500);
            }, 2950);
        }, 960);
	}
}
randHeadings();