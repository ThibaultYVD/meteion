const TTL_MS = 10 * 60 * 1000; // 10 minutes

class TTLMap {
	constructor() {
		this._map = new Map();
		this._timers = new Map();
	}

	set(key, value) {
		this._clearTimer(key);
		this._map.set(key, value);
		this._timers.set(key, setTimeout(() => {
			this._map.delete(key);
			this._timers.delete(key);
		}, TTL_MS));
	}

	get(key) {
		return this._map.get(key);
	}

	delete(key) {
		this._clearTimer(key);
		this._map.delete(key);
	}

	_clearTimer(key) {
		const timer = this._timers.get(key);
		if (timer) {
			clearTimeout(timer);
			this._timers.delete(key);
		}
	}
}

module.exports = new TTLMap();
