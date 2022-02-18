'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const __refs$1 = new WeakMap();

class EventEmitter {
  constructor() {
    __refs$1.set(this, {});
  }

  on(type, callback) {
    const refs = __refs$1.get(this);

    refs[type] = refs[type] || [];
    refs[type].push(callback);
    return this;
  }

  off(type, callback) {
    const refs = __refs$1.get(this);

    if (!refs[type]) {
      return this;
    }

    if (callback) {
      refs[type] = refs[type].filter(cb => cb !== callback);
    } else {
      refs[type] = [];
    }

    return this;
  }

  trigger(type) {
    let data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    const refs = __refs$1.get(this);

    refs[type] && refs[type].forEach(callback => callback.call(null, {
      sender: this,
      type,
      data
    }));
    return this;
  }

}

const __refs = new WeakMap();

class __Resolver {
  constructor(context) {
    const register = {},
          refs = {
      context,
      register
    };

    __refs.set(this, refs);
  }

  add(namespace, value) {
    const {
      register
    } = __refs.get(this);

    register[namespace] = value;
    return this;
  }

  remove(namespace) {
    const {
      register
    } = __refs.get(this);

    register[namespace] = undefined;
    delete register[namespace];
    return this;
  }

  get(namespace) {
    const {
      register
    } = __refs.get(this);

    return register[namespace];
  }

  has(namespace) {
    return !!this.get(namespace);
  }

}

class __Actions extends __Resolver {
  constructor(context) {
    super(context);

    const refs = __refs.get(this),
          {
      register
    } = refs;

    refs.onAction = event => {
      const {
        type
      } = event,
            actions = register[type];

      if (actions) {
        [].concat(actions).forEach(Action => {
          var action = new Action();
          action.context = context;
          action.event = event;
          action.run();
        });
      }
    };
  }

  add(type, actions) {
    const refs = __refs.get(this),
          {
      context,
      onAction
    } = refs,
          registered = this.get(type);

    if (!registered) {
      context.on(type, onAction);
    }

    actions = (registered || []).concat(actions);
    return super.add(type, actions);
  }

  remove(type, actions) {
    const registered = this.get(type);

    if (registered && registered.length) {
      if (!actions) {
        return super.remove(type);
      }

      if (!(actions instanceof Array)) {
        actions = [actions];
      }

      actions.forEach(action => {
        let index = registered.indexOf(action);

        while (index > -1) {
          registered.splice(index, 1);
          index = registered.indexOf(action);
        }
      });

      if (registered.length === 0) {
        return super.remove(type);
      }
    }

    return this;
  }

}

class Context extends EventEmitter {
  constructor() {
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    super();
    const refs = {
      actions: new __Actions(this),
      values: new __Resolver(this),
      options
    };

    if (options && options.history) {
      // All triggered events will be stored here until they are flushed
      // away using flushHistroy():
      refs.history = [];
    }

    __refs.set(this, refs);
  }

  get actions() {
    return __refs.get(this).actions;
  }

  get values() {
    return __refs.get(this).values;
  }

  get history() {
    return __refs.get(this).history || null;
  }

  trigger(type) {
    let data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    const {
      history
    } = this;
    history && history.push({
      type,
      data
    });
    return super.trigger(type, data);
  }

  flushHistory() {
    const {
      history
    } = this;
    history && history.splice(0, history.length);
  }

}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }

  return target;
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

function __isFalse(value) {
  return typeof value === 'boolean' && !value;
}

function __getSettings$1(instance) {
  const settings = instance.settings;

  if (!settings || typeof settings !== 'object') {
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

class Initialize {
  get settings() {
    return null;
  }

  run() {
    const settings = __getSettings$1(this),
          {
      context,
      event
    } = this,
          {
      data
    } = event,
          views = context.values.get(settings.namespace) || [],
          root = data && data.root ? data.root : document.body;

    let result, elements;
    result = this.beforeAll();

    if (__isFalse(result)) {
      return;
    }

    elements = root.querySelectorAll(settings.selector);

    if (elements.length === 0) {
      return;
    }

    elements.forEach((el, index) => {
      if (views.some(view => view.el == el)) {
        return;
      }

      const options = _objectSpread2({
        el,
        context
      }, settings.params);

      let view = null;
      result = this.beforeEach(options, el, index);

      if (__isFalse(result)) {
        return;
      }

      view = new settings.view(options);
      view.render();
      result = this.afterEach(view, el, index);

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

  beforeAll() {// Overwrite this...
  }

  beforeEach() {// Overwrite this...
  }

  afterEach() {// Overwrite this...
  }

  afterAll() {// Overwrite this...
  }

}

function __getSettings(instance) {
  const settings = instance.settings;

  if (!settings || typeof settings !== 'object') {
    throw new Error('Define settings object');
  }

  if (!settings.selector) {
    throw new Error('Define a selector');
  }

  return settings;
}

function __error(action, error) {
  window.console && window.console.error && window.console.error('[InitializeLazy] ' + error.message);
  action.context.trigger(action.event.type + ':error', {
    error
  });
}

class InitializeLazy {
  constructor() {
    this._onIntersect = this._onIntersect.bind(this);
  }

  get settings() {
    return null;
  }

  get import() {
    return null;
  }

  get condition() {
    if (document.readyState === 'complete') {
      return Promise.resolve();
    }

    return new Promise(resolve => window.addEventListener('DOMContentLoaded', resolve, {
      once: true
    }));
  }

  get observerSettings() {
    return {
      rootMargin: '0px',
      threshold: [0, 0.5, 1]
    };
  }

  run() {
    const {
      selector
    } = __getSettings(this);

    const {
      condition
    } = this;

    if (!(condition instanceof Promise)) {
      throw new Error('A conditon must be an instance of promise.');
    }

    condition.then(() => this._lookup(selector)).catch(error => __error(this, error));
  }

  _lookup(selector) {
    const {
      event
    } = this;
    const {
      data
    } = event;
    const root = data && data.root ? data.root : document.body;
    const elements = root.querySelectorAll(selector);

    if (elements.length === 0) {
      return;
    }

    this._setup(elements);
  }

  _setup(elements) {
    if (window.IntersectionObserver) {
      this._observe(elements);
    } else {
      this._fetch();
    }
  }

  _observe(elements) {
    this._observer = new window.IntersectionObserver(this._onIntersect, this.observerSettings);
    elements.forEach(element => this._observer.observe(element));
  }

  _disconnect() {
    this._observer.disconnect();

    this._observer = null;
  }

  _fetch() {
    const {
      event
    } = this;
    this.import.then(module => {
      const Action = module.Action || module.default;

      if (!Action) {
        throw new Error('Module must export Action or default');
      }

      if (!(typeof Action.prototype.run === 'function')) {
        throw new Error('Module must be an Action');
      } // Replace the proxy action with the loaded action


      this.context.actions.add(event.type, Action).remove(event.type, this.constructor); // Execute the current action:

      this._execute(Action);
    }).catch(error => __error(this, error));
  }

  _execute(Action) {
    const action = new Action();
    action.context = this.context;
    action.event = this.event;
    action.run();
  }

  _onIntersect(entries) {
    const isVisible = entries.some(entry => entry.isIntersecting);

    if (isVisible) {
      this._disconnect();

      this._fetch();
    }
  }

}

class View extends EventEmitter {
  constructor(options) {
    super();
    this.options = options;
    this.context = options.context;
    this.el = options.el;
  }

  render() {
    return this;
  }

  destroy() {
    this.options = null;
    this.context = null;
    this.el = null;
    return this;
  }

}

exports.Context = Context;
exports.EventEmitter = EventEmitter;
exports.Initialize = Initialize;
exports.InitializeLazy = InitializeLazy;
exports.View = View;
