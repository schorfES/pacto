'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (global, factory) {
	(typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define(['exports'], factory) : factory(global.pacto = {});
})(undefined, function (exports) {
	'use strict';

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

	var Model = function (_EventEmitter) {
		_inherits(Model, _EventEmitter);

		function Model() {
			var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			_classCallCheck(this, Model);

			var _this2 = _possibleConstructorReturn(this, (Model.__proto__ || Object.getPrototypeOf(Model)).call(this));

			props = _extends({}, _this2.defaults, props);

			var handler = {
				set: function set(target, property, value) {
					var isChanged = target[property] !== value;
					target[property] = value;

					if (isChanged) {
						_this2.trigger('change', { prop: property, value: value });
					}

					return true;
				}
			},
			    proxy = new Proxy(props, handler);

			__refs$1.set(_this2, proxy);
			return _this2;
		}

		_createClass(Model, [{
			key: 'defaults',
			get: function get() {
				return null;
			}
		}, {
			key: 'props',
			get: function get() {
				return __refs$1.get(this);
			}
		}]);

		return Model;
	}(EventEmitter);

	var __refs$2 = new WeakMap();

	var Collection = function (_EventEmitter2) {
		_inherits(Collection, _EventEmitter2);

		function Collection() {
			var models = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

			_classCallCheck(this, Collection);

			var _this3 = _possibleConstructorReturn(this, (Collection.__proto__ || Object.getPrototypeOf(Collection)).call(this));

			var enshureIsModel = function enshureIsModel(model) {
				return model instanceof Model ? model : new _this3.Model(model);
			},
			    handler = {
				get: function get(target, property) {
					var method = target[property];

					if (typeof method === 'function') {
						return function () {
							for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
								args[_key] = arguments[_key];
							}

							var isChanged = false,
							    result = void 0;

							switch (property) {
								case 'pop':
								case 'reverse':
								case 'shift':
								case 'sort':
									isChanged = true;
									break;

								case 'fill':
									isChanged = true;
									args[0] = enshureIsModel(args[0]);
									break;

								case 'push':
								case 'unshift':
									isChanged = true;
									args = args.map(enshureIsModel);
									break;

								case 'splice':
									isChanged = true;
									args = args.map(function (arg, index) {
										return index > 1 ? enshureIsModel(arg) : arg;
									});
									break;
							}

							result = method.apply(target, args);

							if (isChanged) {
								_this3.trigger('change', { method: property });
							}

							return result;
						};
					}

					return method;
				}
			},
			    proxy = new Proxy(models.map(enshureIsModel), handler);

			__refs$2.set(_this3, proxy);
			return _this3;
		}

		_createClass(Collection, [{
			key: 'Model',
			get: function get() {
				return Model;
			}
		}, {
			key: 'models',
			get: function get() {
				return __refs$2.get(this);
			}
		}]);

		return Collection;
	}(EventEmitter);

	var __refs$3 = new WeakMap();

	var __Resolver = function () {
		function __Resolver(context) {
			_classCallCheck(this, __Resolver);

			var register = {},
			    refs = {
				context: context,
				register: register
			};

			__refs$3.set(this, refs);
		}

		_createClass(__Resolver, [{
			key: 'add',
			value: function add(key, value) {
				var _refs$3$get = __refs$3.get(this),
				    register = _refs$3$get.register;

				register[key] = value;
				return this;
			}
		}, {
			key: 'remove',
			value: function remove(key) {
				var _refs$3$get2 = __refs$3.get(this),
				    register = _refs$3$get2.register;

				register[key] = undefined;
				delete register[key];
				return this;
			}
		}, {
			key: 'get',
			value: function get(key) {
				var _refs$3$get3 = __refs$3.get(this),
				    register = _refs$3$get3.register;

				return register[key];
			}
		}, {
			key: 'has',
			value: function has(key) {
				return !!this.get(key);
			}
		}]);

		return __Resolver;
	}();

	var __Actions = function (_Resolver) {
		_inherits(__Actions, _Resolver);

		function __Actions(context) {
			_classCallCheck(this, __Actions);

			var _this4 = _possibleConstructorReturn(this, (__Actions.__proto__ || Object.getPrototypeOf(__Actions)).call(this, context));

			var refs = __refs$3.get(_this4),
			    register = refs.register;


			refs.onAction = function (event) {
				var type = event.type,
				    actions = register[type];


				if (actions) {
					actions.forEach(function (Action) {
						var action = new Action();
						action.context = context;
						action.event = event;
						action.run();
					});
				}
			};
			return _this4;
		}

		_createClass(__Actions, [{
			key: 'add',
			value: function add(type, actions) {
				var refs = __refs$3.get(this),
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

	var Context = function (_EventEmitter3) {
		_inherits(Context, _EventEmitter3);

		function Context() {
			_classCallCheck(this, Context);

			var _this5 = _possibleConstructorReturn(this, (Context.__proto__ || Object.getPrototypeOf(Context)).call(this));

			__refs$3.set(_this5, {
				actions: new __Actions(_this5),
				values: new __Resolver(_this5)
			});
			return _this5;
		}

		_createClass(Context, [{
			key: 'actions',
			get: function get() {
				return __refs$3.get(this).actions;
			}
		}, {
			key: 'values',
			get: function get() {
				return __refs$3.get(this).values;
			}
		}]);

		return Context;
	}(EventEmitter);

	exports.Collection = Collection;
	exports.Context = Context;
	exports.EventEmitter = EventEmitter;
	exports.Model = Model;

	Object.defineProperty(exports, '__esModule', { value: true });
});
