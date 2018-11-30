(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define('pacto', ['exports'], factory);
	} else if (typeof exports !== "undefined") {
		factory(exports);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod.exports);
		global.pacto = mod.exports;
	}
})(this, function (exports) {
	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _extends = Object.assign || function (target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i];

			for (var key in source) {
				if (Object.prototype.hasOwnProperty.call(source, key)) {
					target[key] = source[key];
				}
			}
		}

		return target;
	};

	function _toConsumableArray(arr) {
		if (Array.isArray(arr)) {
			for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
				arr2[i] = arr[i];
			}

			return arr2;
		} else {
			return Array.from(arr);
		}
	}

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
		return typeof obj;
	} : function (obj) {
		return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	};

	function _possibleConstructorReturn(self, call) {
		if (!self) {
			throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
		}

		return call && (typeof call === "object" || typeof call === "function") ? call : self;
	}

	var _get = function get(object, property, receiver) {
		if (object === null) object = Function.prototype;
		var desc = Object.getOwnPropertyDescriptor(object, property);

		if (desc === undefined) {
			var parent = Object.getPrototypeOf(object);

			if (parent === null) {
				return undefined;
			} else {
				return get(parent, property, receiver);
			}
		} else if ("value" in desc) {
			return desc.value;
		} else {
			var getter = desc.get;

			if (getter === undefined) {
				return undefined;
			}

			return getter.call(receiver);
		}
	};

	function _inherits(subClass, superClass) {
		if (typeof superClass !== "function" && superClass !== null) {
			throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
		}

		subClass.prototype = Object.create(superClass && superClass.prototype, {
			constructor: {
				value: subClass,
				enumerable: false,
				writable: true,
				configurable: true
			}
		});
		if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	}

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	var _createClass = function () {
		function defineProperties(target, props) {
			for (var i = 0; i < props.length; i++) {
				var descriptor = props[i];
				descriptor.enumerable = descriptor.enumerable || false;
				descriptor.configurable = true;
				if ("value" in descriptor) descriptor.writable = true;
				Object.defineProperty(target, descriptor.key, descriptor);
			}
		}

		return function (Constructor, protoProps, staticProps) {
			if (protoProps) defineProperties(Constructor.prototype, protoProps);
			if (staticProps) defineProperties(Constructor, staticProps);
			return Constructor;
		};
	}();

	var __refs = new WeakMap();

	var EventEmitter = function () {
		function EventEmitter() {
			_classCallCheck(this, EventEmitter);

			__refs.set(this, {});
		}

		_createClass(EventEmitter, [{
			key: 'on',
			value: function on(type, callback) {
				var refs = __refs.get(this);

				refs[type] = refs[type] || [];
				refs[type].push(callback);

				return this;
			}
		}, {
			key: 'off',
			value: function off(type, callback) {
				var refs = __refs.get(this);

				if (!refs[type]) {
					return this;
				}

				if (callback) {
					refs[type] = refs[type].filter(function (cb) {
						return cb !== callback;
					});
				} else {
					refs[type] = [];
				}

				return this;
			}
		}, {
			key: 'trigger',
			value: function trigger(type) {
				var _this = this;

				var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

				var refs = __refs.get(this);

				refs[type] && refs[type].forEach(function (callback) {
					return callback.call(null, {
						sender: _this,
						type: type,
						data: data
					});
				});

				return this;
			}
		}]);

		return EventEmitter;
	}();

	var __refs$1 = new WeakMap();

	var __Resolver = function () {
		function __Resolver(context) {
			_classCallCheck(this, __Resolver);

			var register = {},
			    refs = {
				context: context,
				register: register
			};

			__refs$1.set(this, refs);
		}

		_createClass(__Resolver, [{
			key: 'add',
			value: function add(namespace, value) {
				var _refs$1$get = __refs$1.get(this),
				    register = _refs$1$get.register;

				register[namespace] = value;
				return this;
			}
		}, {
			key: 'remove',
			value: function remove(namespace) {
				var _refs$1$get2 = __refs$1.get(this),
				    register = _refs$1$get2.register;

				register[namespace] = undefined;
				delete register[namespace];
				return this;
			}
		}, {
			key: 'get',
			value: function get(namespace) {
				var _refs$1$get3 = __refs$1.get(this),
				    register = _refs$1$get3.register;

				return register[namespace];
			}
		}, {
			key: 'has',
			value: function has(namespace) {
				return !!this.get(namespace);
			}
		}]);

		return __Resolver;
	}();

	var __Actions = function (_Resolver) {
		_inherits(__Actions, _Resolver);

		function __Actions(context) {
			_classCallCheck(this, __Actions);

			var _this2 = _possibleConstructorReturn(this, (__Actions.__proto__ || Object.getPrototypeOf(__Actions)).call(this, context));

			var refs = __refs$1.get(_this2),
			    register = refs.register;


			refs.onAction = function (event) {
				var type = event.type,
				    actions = register[type];


				if (actions) {
					[].concat(actions).forEach(function (Action) {
						var action = new Action();
						action.context = context;
						action.event = event;
						action.run();
					});
				}
			};
			return _this2;
		}

		_createClass(__Actions, [{
			key: 'add',
			value: function add(type, actions) {
				var refs = __refs$1.get(this),
				    context = refs.context,
				    onAction = refs.onAction,
				    registered = this.get(type);


				if (!registered) {
					context.on(type, onAction);
				}

				actions = (registered || []).concat(actions);
				return _get(__Actions.prototype.__proto__ || Object.getPrototypeOf(__Actions.prototype), 'add', this).call(this, type, actions);
			}
		}, {
			key: 'remove',
			value: function remove(type, actions) {
				var registered = this.get(type);

				if (registered && registered.length) {
					if (!actions) {
						return _get(__Actions.prototype.__proto__ || Object.getPrototypeOf(__Actions.prototype), 'remove', this).call(this, type);
					}

					if (!(actions instanceof Array)) {
						actions = [actions];
					}

					actions.forEach(function (action) {
						var index = registered.indexOf(action);
						while (index > -1) {
							registered.splice(index, 1);
							index = registered.indexOf(action);
						}
					});

					if (registered.length === 0) {
						return _get(__Actions.prototype.__proto__ || Object.getPrototypeOf(__Actions.prototype), 'remove', this).call(this, type);
					}
				}

				return this;
			}
		}]);

		return __Actions;
	}(__Resolver);

	var Context = function (_EventEmitter) {
		_inherits(Context, _EventEmitter);

		function Context() {
			_classCallCheck(this, Context);

			var _this3 = _possibleConstructorReturn(this, (Context.__proto__ || Object.getPrototypeOf(Context)).call(this));

			__refs$1.set(_this3, {
				actions: new __Actions(_this3),
				values: new __Resolver(_this3)
			});
			return _this3;
		}

		_createClass(Context, [{
			key: 'actions',
			get: function get() {
				return __refs$1.get(this).actions;
			}
		}, {
			key: 'values',
			get: function get() {
				return __refs$1.get(this).values;
			}
		}]);

		return Context;
	}(EventEmitter);

	function __isFalse(value) {
		return typeof value === 'boolean' && !value;
	}

	function __getSettings(instance) {
		var settings = instance.settings;

		if (!settings || (typeof settings === 'undefined' ? 'undefined' : _typeof(settings)) !== 'object') {
			throw new Error('Define settings object');
		}

		if (!settings.view) {
			throw new Error('Define a view');
		}

		if (!settings.selector) {
			throw new Error('Define a selector');
		}

		if (!settings.namespace) {
			throw new Error('Define a namespace');
		}

		return settings;
	}

	var Initialize = function () {
		function Initialize() {
			_classCallCheck(this, Initialize);
		}

		_createClass(Initialize, [{
			key: 'run',
			value: function run() {
				var _this4 = this;

				var settings = __getSettings(this),
				    context = this.context,
				    event = this.event,
				    data = event.data,
				    views = context.values.get(settings.namespace) || [],
				    root = data && data.root ? data.root : document.body;


				var result = void 0;

				result = this.beforeAll();
				if (__isFalse(result)) {
					return;
				}

				[].concat(_toConsumableArray(root.querySelectorAll(settings.selector))).forEach(function (el, index) {
					if (views.some(function (view) {
						return view.el == el;
					})) {
						return;
					}

					var options = _extends({ el: el, context: context }, settings.params);
					var view = null;

					result = _this4.beforeEach(options, el, index);
					if (__isFalse(result)) {
						return;
					}

					view = new settings.view(options);
					view.render();

					result = _this4.afterEach(view, el, index);
					if (__isFalse(result)) {
						return;
					}

					views.push(view);
				});

				if (views.length > 0) {
					context.values.add(settings.namespace, views);
				}

				this.afterAll(views);
			}
		}, {
			key: 'beforeAll',
			value: function beforeAll() {
				// Overwrite this...
			}
		}, {
			key: 'beforeEach',
			value: function beforeEach() /* options, el, index */{
				// Overwrite this...
			}
		}, {
			key: 'afterEach',
			value: function afterEach() /* view, el, index */{
				// Overwrite this...
			}
		}, {
			key: 'afterAll',
			value: function afterAll() /* views */{
				// Overwrite this...
			}
		}, {
			key: 'settings',
			get: function get() {
				return null;
			}
		}]);

		return Initialize;
	}();

	function __getSettings$1(instance) {
		var settings = instance.settings;

		if (!settings || (typeof settings === 'undefined' ? 'undefined' : _typeof(settings)) !== 'object') {
			throw new Error('Define settings object');
		}

		if (!settings.selector) {
			throw new Error('Define a selector');
		}

		return settings;
	}

	var InitializeLazy = function () {
		function InitializeLazy() {
			_classCallCheck(this, InitializeLazy);

			this._onIntersect = this._onIntersect.bind(this);
		}

		_createClass(InitializeLazy, [{
			key: 'run',
			value: function run() {
				var settings = __getSettings$1(this);
				this._lookup(settings.selector);
			}
		}, {
			key: '_lookup',
			value: function _lookup(selector) {
				var event = this.event,
				    data = event.data,
				    root = data && data.root ? data.root : document.body,
				    elements = root.querySelectorAll(selector);


				if (elements.length === 0) {
					return;
				}

				if (window.IntersectionObserver) {
					this._observe(elements);
				} else {
					this._fetch();
				}
			}
		}, {
			key: '_observe',
			value: function _observe(elements) {
				var _this5 = this;

				this._observer = new window.IntersectionObserver(this._onIntersect, this.observerSettings);
				[].concat(_toConsumableArray(elements)).forEach(function (element) {
					return _this5._observer.observe(element);
				});
			}
		}, {
			key: '_disconnect',
			value: function _disconnect() {
				this._observer.disconnect();
				this._observer = null;
			}
		}, {
			key: '_fetch',
			value: function _fetch() {
				var _this6 = this;

				var event = this.event;


				this.import.then(function (module) {
					var Action = module.Action || module.default;
					var error = null;

					if (!Action) {
						error = new Error('Module must export Action or default');
						_this6.context.trigger(_this6.event.type + ':error', { error: error }); // Only for testing reasons
						throw error;
					}

					if (!(typeof Action.prototype.run === 'function')) {
						error = new Error('Module must be an Action');
						_this6.context.trigger(_this6.event.type + ':error', { error: error }); // Only for testing reasons
						throw error;
					}

					// Replace the proxy action with the loaded action
					_this6.context.actions.add(event.type, Action).remove(event.type, _this6.constructor);

					// Execute the current action:
					_this6._execute(Action);
				});
			}
		}, {
			key: '_execute',
			value: function _execute(Action) {
				var action = new Action();
				action.context = this.context;
				action.event = this.event;
				action.run();
			}
		}, {
			key: '_onIntersect',
			value: function _onIntersect(entries) {
				var isVisible = entries.some(function (entry) {
					return entry.isIntersecting;
				});

				if (isVisible) {
					this._disconnect();
					this._fetch();
				}
			}
		}, {
			key: 'settings',
			get: function get() {
				return null;
			}
		}, {
			key: 'import',
			get: function get() {
				return null;
			}
		}, {
			key: 'observerSettings',
			get: function get() {
				return {
					rootMargin: '0px',
					threshold: [0, 0.5, 1]
				};
			}
		}]);

		return InitializeLazy;
	}();

	var View = function (_EventEmitter2) {
		_inherits(View, _EventEmitter2);

		function View(options) {
			_classCallCheck(this, View);

			var _this7 = _possibleConstructorReturn(this, (View.__proto__ || Object.getPrototypeOf(View)).call(this));

			_this7.options = options;
			_this7.context = options.context;
			_this7.el = options.el;
			return _this7;
		}

		_createClass(View, [{
			key: 'render',
			value: function render() {
				return this;
			}
		}, {
			key: 'destroy',
			value: function destroy() {
				this.options = null;
				this.context = null;
				this.el = null;
				return this;
			}
		}]);

		return View;
	}(EventEmitter);

	exports.Context = Context;
	exports.EventEmitter = EventEmitter;
	exports.Initialize = Initialize;
	exports.InitializeLazy = InitializeLazy;
	exports.View = View;
});