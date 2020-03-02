import { toggleClass, hasClass } from './util';

(function() {
	const StickyBackground = function(element) {
		this.element = element;
		this.scrollingElement = this.element.getElementsByClassName('sticky-hero__content')[0];
		this.nextElement = this.element.nextElementSibling;
		this.scrollingTreshold = 0;
		this.nextTreshold = 0;
		initStickyEffect(this);
	};

	function initStickyEffect(element) {
		const observer = new IntersectionObserver(stickyCallback.bind(element), {
			threshold: [ 0, 0.1, 1 ]
		});
		observer.observe(element.scrollingElement);
		if (element.nextElement) observer.observe(element.nextElement);
	}

	function stickyCallback(entries, observer) {
		const threshold = entries[0].intersectionRatio.toFixed(1);
		entries[0].target == this.scrollingElement
			? (this.scrollingTreshold = threshold)
			: (this.nextTreshold = threshold);

		toggleClass(this.element, 'sticky-hero--media-is-fixed', this.nextTreshold > 0 || this.scrollingTreshold > 0);
	}

	const stickyBackground = document.getElementsByClassName('js-sticky-hero'),
		intersectionObserverSupported =
			'IntersectionObserver' in window &&
			'IntersectionObserverEntry' in window &&
			'intersectionRatio' in window.IntersectionObserverEntry.prototype;
	if (stickyBackground.length > 0 && intersectionObserverSupported) {
		// if IntersectionObserver is not supported, animations won't be triggeres
		for (let i = 0; i < stickyBackground.length; i++) {
			(function(i) {
				// if animations are enabled -> init the StickyBackground object
				if (hasClass(stickyBackground[i], 'sticky-hero--overlay-layer'))
					new StickyBackground(stickyBackground[i]);
			})(i);
		}
	}
})();
