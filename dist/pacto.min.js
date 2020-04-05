(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.pacto = {}));
}(this, (function (exports) { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _createSuper(Derived) {
    return function () {
      var Super = _getPrototypeOf(Derived),
          result;

      if (_isNativeReflectConstruct()) {
        var NewTarget = _getPrototypeOf(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn(this, result);
    };
  }

  function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = _getPrototypeOf(object);
      if (object === null) break;
    }

    return object;
  }

  function _get(target, property, receiver) {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get;
    } else {
      _get = function _get(target, property, receiver) {
        var base = _superPropBase(target, property);

        if (!base) return;
        var desc = Object.getOwnPropertyDescriptor(base, property);

        if (desc.get) {
          return desc.get.call(receiver);
        }

        return desc.value;
      };
    }

    return _get(target, property, receiver || target);
  }

  var __refs = new WeakMap();

  var EventEmitter = /*#__PURE__*/function () {
    function EventEmitter() {
      _classCallCheck(this, EventEmitter);

      __refs.set(this, {});
    }

    _createClass(EventEmitter, [{
      key: "on",
      value: function on(type, callback) {
        var refs = __refs.get(this);

        refs[type] = refs[type] || [];
        refs[type].push(callback);
        return this;
      }
    }, {
      key: "off",
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
      key: "trigger",
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

  var __Resolver = /*#__PURE__*/function () {
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
      key: "add",
      value: function add(namespace, value) {
        var _refs$get = __refs$1.get(this),
            register = _refs$get.register;

        register[namespace] = value;
        return this;
      }
    }, {
      key: "remove",
      value: function remove(namespace) {
        var _refs$get2 = __refs$1.get(this),
            register = _refs$get2.register;

        register[namespace] = undefined;
        delete register[namespace];
        return this;
      }
    }, {
      key: "get",
      value: function get(namespace) {
        var _refs$get3 = __refs$1.get(this),
            register = _refs$get3.register;

        return register[namespace];
      }
    }, {
      key: "has",
      value: function has(namespace) {
        return !!this.get(namespace);
      }
    }]);

    return __Resolver;
  }();

  var __Actions = /*#__PURE__*/function (_Resolver) {
    _inherits(__Actions, _Resolver);

    var _super = _createSuper(__Actions);

    function __Actions(context) {
      var _this;

      _classCallCheck(this, __Actions);

      _this = _super.call(this, context);

      var refs = __refs$1.get(_assertThisInitialized(_this)),
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

      return _this;
    }

    _createClass(__Actions, [{
      key: "add",
      value: function add(type, actions) {
        var refs = __refs$1.get(this),
            context = refs.context,
            onAction = refs.onAction,
            registered = this.get(type);

        if (!registered) {
          context.on(type, onAction);
        }

        actions = (registered || []).concat(actions);
        return _get(_getPrototypeOf(__Actions.prototype), "add", this).call(this, type, actions);
      }
    }, {
      key: "remove",
      value: function remove(type, actions) {
        var registered = this.get(type);

        if (registered && registered.length) {
          if (!actions) {
            return _get(_getPrototypeOf(__Actions.prototype), "remove", this).call(this, type);
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
            return _get(_getPrototypeOf(__Actions.prototype), "remove", this).call(this, type);
          }
        }

        return this;
      }
    }]);

    return __Actions;
  }(__Resolver);

  var Context = /*#__PURE__*/function (_EventEmitter) {
    _inherits(Context, _EventEmitter);

    var _super2 = _createSuper(Context);

    function Context() {
      var _this2;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      _classCallCheck(this, Context);

      _this2 = _super2.call(this);
      var refs = {
        actions: new __Actions(_assertThisInitialized(_this2)),
        values: new __Resolver(_assertThisInitialized(_this2)),
        options: options
      };

      if (options && options.history) {
        // All triggered events will be stored here until they are flushed
        // away using flushHistroy():
        refs.history = [];
      }

      __refs$1.set(_assertThisInitialized(_this2), refs);

      return _this2;
    }

    _createClass(Context, [{
      key: "trigger",
      value: function trigger(type) {
        var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var history = this.history;
        history && history.push({
          type: type,
          data: data
        });
        return _get(_getPrototypeOf(Context.prototype), "trigger", this).call(this, type, data);
      }
    }, {
      key: "flushHistory",
      value: function flushHistory() {
        var history = this.history;
        history && history.splice(0, history.length);
      }
    }, {
      key: "actions",
      get: function get() {
        return __refs$1.get(this).actions;
      }
    }, {
      key: "values",
      get: function get() {
        return __refs$1.get(this).values;
      }
    }, {
      key: "history",
      get: function get() {
        return __refs$1.get(this).history || null;
      }
    }]);

    return Context;
  }(EventEmitter);

  function __isFalse(value) {
    return typeof value === 'boolean' && !value;
  }

  function __getSettings(instance) {
    var settings = instance.settings;

    if (!settings || _typeof(settings) !== 'object') {
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

  var Initialize = /*#__PURE__*/function () {
    function Initialize() {
      _classCallCheck(this, Initialize);
    }

    _createClass(Initialize, [{
      key: "run",
      value: function run() {
        var _this = this;

        var settings = __getSettings(this),
            context = this.context,
            event = this.event,
            data = event.data,
            views = context.values.get(settings.namespace) || [],
            root = data && data.root ? data.root : document.body;

        var result, elements;
        result = this.beforeAll();

        if (__isFalse(result)) {
          return;
        }

        elements = root.querySelectorAll(settings.selector);

        if (elements.length === 0) {
          return;
        }

        elements.forEach(function (el, index) {
          if (views.some(function (view) {
            return view.el == el;
          })) {
            return;
          }

          var options = _objectSpread2({
            el: el,
            context: context
          }, settings.params);

          var view = null;
          result = _this.beforeEach(options, el, index);

          if (__isFalse(result)) {
            return;
          }

          view = new settings.view(options);
          view.render();
          result = _this.afterEach(view, el, index);

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
      key: "beforeAll",
      value: function beforeAll() {// Overwrite this...
      }
    }, {
      key: "beforeEach",
      value: function beforeEach()
      /* options, el, index */
      {// Overwrite this...
      }
    }, {
      key: "afterEach",
      value: function afterEach()
      /* view, el, index */
      {// Overwrite this...
      }
    }, {
      key: "afterAll",
      value: function afterAll()
      /* views */
      {// Overwrite this...
      }
    }, {
      key: "settings",
      get: function get() {
        return null;
      }
    }]);

    return Initialize;
  }();

  function __getSettings$1(instance) {
    var settings = instance.settings;

    if (!settings || _typeof(settings) !== 'object') {
      throw new Error('Define settings object');
    }

    if (!settings.selector) {
      throw new Error('Define a selector');
    }

    return settings;
  }

  var InitializeLazy = /*#__PURE__*/function () {
    function InitializeLazy() {
      _classCallCheck(this, InitializeLazy);

      this._onIntersect = this._onIntersect.bind(this);
    }

    _createClass(InitializeLazy, [{
      key: "run",
      value: function run() {
        var settings = __getSettings$1(this);

        this._lookup(settings.selector);
      }
    }, {
      key: "_lookup",
      value: function _lookup(selector) {
        var _this = this;

        var event = this.event,
            data = event.data,
            root = data && data.root ? data.root : document.body,
            elements = root.querySelectorAll(selector);

        if (elements.length === 0) {
          return;
        }

        if (document.readyState === 'complete') {
          this._setup(elements);
        } else {
          window.addEventListener('load', function () {
            return _this._setup(elements);
          }, {
            once: true
          });
        }
      }
    }, {
      key: "_setup",
      value: function _setup(elements) {
        if (window.IntersectionObserver) {
          this._observe(elements);
        } else {
          this._fetch();
        }
      }
    }, {
      key: "_observe",
      value: function _observe(elements) {
        var _this2 = this;

        this._observer = new window.IntersectionObserver(this._onIntersect, this.observerSettings);
        elements.forEach(function (element) {
          return _this2._observer.observe(element);
        });
      }
    }, {
      key: "_disconnect",
      value: function _disconnect() {
        this._observer.disconnect();

        this._observer = null;
      }
    }, {
      key: "_fetch",
      value: function _fetch() {
        var _this3 = this;

        var event = this.event;
        this.import.then(function (module) {
          var Action = module.Action || module.default;

          if (!Action) {
            throw new Error('Module must export Action or default');
          }

          if (!(typeof Action.prototype.run === 'function')) {
            throw new Error('Module must be an Action');
          } // Replace the proxy action with the loaded action


          _this3.context.actions.add(event.type, Action).remove(event.type, _this3.constructor); // Execute the current action:


          _this3._execute(Action);
        }).catch(function (error) {
          _this3.context.trigger(_this3.event.type + ':error', {
            error: error
          }); // Only for testing reasons


          throw error;
        });
      }
    }, {
      key: "_execute",
      value: function _execute(Action) {
        var action = new Action();
        action.context = this.context;
        action.event = this.event;
        action.run();
      }
    }, {
      key: "_onIntersect",
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
      key: "settings",
      get: function get() {
        return null;
      }
    }, {
      key: "import",
      get: function get() {
        return null;
      }
    }, {
      key: "observerSettings",
      get: function get() {
        return {
          rootMargin: '0px',
          threshold: [0, 0.5, 1]
        };
      }
    }]);

    return InitializeLazy;
  }();

  var View = /*#__PURE__*/function (_EventEmitter) {
    _inherits(View, _EventEmitter);

    var _super = _createSuper(View);

    function View(options) {
      var _this;

      _classCallCheck(this, View);

      _this = _super.call(this);
      _this.options = options;
      _this.context = options.context;
      _this.el = options.el;
      return _this;
    }

    _createClass(View, [{
      key: "render",
      value: function render() {
        return this;
      }
    }, {
      key: "destroy",
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

  Object.defineProperty(exports, '__esModule', { value: true });

})));
