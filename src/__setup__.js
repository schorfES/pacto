let __documentReadyState = 'complete';

Object.defineProperty(document, 'readyState', {

	get() {
		return __documentReadyState;
	},

	set(value) {
		__documentReadyState = value;
	}

});
