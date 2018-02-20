export class EventEmitter extends EventTarget {

	on(type, callback) {
		this.addEventListener(type, callback);
		return this;
	}

	off(type, callback) {
		this.removeEventListener(type, callback);
		return this;
	}

	trigger(type, detail = null) {
		this.dispatchEvent(new CustomEvent(type, {detail}));
		return this;
	}

}
