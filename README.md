# Pacto

[![Build Status](https://travis-ci.org/schorfES/pacto.svg?branch=master)](https://travis-ci.org/schorfES/pacto)
[![Coverage Status on Codecov](https://codecov.io/gh/schorfES/pacto/branch/master/graph/badge.svg)](https://codecov.io/gh/schorfES/pacto)
[![Known Vulnerabilities](https://snyk.io/test/github/schorfES/pacto/badge.svg)](https://snyk.io/test/github/schorfES/pacto)
[![Minified gzipped size](https://badgen.net/bundlephobia/minzip/pacto)](https://bundlephobia.com/result?p=pacto)

A lightweight framework for non SPA websites.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Why?](#why)
- [The Concepts](#the-concepts)
- [Installation](#installation)
- [Requirements](#requirements)
  - [Support NodeList.prototype.forEach](#support-nodelistprototypeforeach)
- [Documentation](#documentation)
  - [Context](#context)
    - [Actions](#actions)
      - [Initialize](#initialize)
      - [InitializeLazy](#initializelazy)
      - [Handling Errors](#handling-errors)
    - [Values](#values)
  - [View](#view)
  - [EventEmitter](#eventemitter)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Why?

There are a [lot of great frameworks](https://javascriptreport.com/the-ultimate-guide-to-javascript-frameworks/)
out there which are supposed to be used for _single page applications (SPA)_.
When using them on regular websites it's hard to apply those frameworks to an
already server-side rendered DOM or to enhance certain sections with some
_interaction candy_. On the other hand, the network payload to ship an SPA
framework is quite huge when using for example only the _state management_ or
_virtual DOM_ of that framework. This may results in a higher _time to
interactive_ due to network traffic, parse, interpret and execution time.

Pacto tries to reduce those problems by shipping small features which are using
latest browser features like [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver)
and [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Weakmap).

## The Concepts

In contrast to other libraries, pacto follows the traditional approach of an MVC
framework. The core of pacto is a context instance. This is based on a typical
event bus where events can be added, removed and triggered (pubsub pattern). The
context instance also allows adding actions to certain events. An action is
designed to hold a part of the application logic. Each time a relevant event
occurs, an added action will run to execute a logic like to update a state, to
fetch or to recalculate data.

These actions allow creating modules. Each module should contain at least one
[initialize action](#initialize) but can be composed of multiple actions,
stores, states, services, views etc. This initialize action is meant to be
the entry point of each module. It setups and executes its module:

![pacto app module structure](https://raw.githubusercontent.com/schorfES/pacto/master/docs/app.png)

The state management is not solved by pacto, but there is small _backbone/mobx inspired_
model and collection extension for pacto called [pacto.model](https://github.com/schorfES/pacto.model).

## Installation

Pacto is available on [NPM](https://www.npmjs.com/package/pacto):

```bash
npm install pacto --save
```

## Requirements

Pacto is _dependency free_, but it requires latest browser features.
So you may need to add a polyfill for [WeakMap](https://www.npmjs.com/package/weakmap-polyfill).
When using [InitializeLazy](#initializelazy) you can also add a polyfill for
[IntersectionObserver](https://www.npmjs.com/package/intersection-observer).

Using dynamic imports, this boilerplate can be used to load all required
polyfills before loading and running the app:

```javascript
(function(src){
	Promise.all([
		(!!window.WeakMap || import('weakmap-polyfill')),
		(!!window.IntersectionObserver || import('intersection-observer')),
	]).then(() => {
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.charset = 'utf-8';
		script.async = true;
		script.defer = true;
		script.src = src;
		document.body.appendChild(script);
	});
})('/path/to/app-using-pacto.js');
```

### Support NodeList.prototype.forEach

Pacto expects the support of `NodeList.prototype.forEach`. For older Browsers such
as IE11 you need to add another [polyfill](https://www.npmjs.com/package/nodelist-foreach-polyfill).

## Documentation

### Context

An instance of pacto's Context has typical known properties of an
[EventEmitter](#eventemitter) like `.on()`, `.off()` and `.trigger()`. It also
allows to handle [Actions](#actions) and store/receive [Values](#values) in each
instance.

```javascript
import {Context} from 'pacto';

const context = new Context();
context
	.on('event:type', (event) => console.log('The event occurred.', event))
	.trigger('event:type', {foo: 'bar'})
	.off('event:type');
```

The context can store the event-histroy. This allows modules to load lazy and
react on previous events from history, if required. The history is disabled by
default. To enable this feature pass `{history: true}` into the constructor. The
history can be flushed.

```javascript
import {Context} from 'pacto';

const context = new Context({history: true});
context.trigger('event:type');
context.trigger('event:type', {foo: 'bar'});
context.histroy; // logs: [{type: 'event:type', data: null}, {type: 'event:type', data {foo: 'bar'}}]
context.flushHistory();
context.histroy; // logs: []
```

#### Actions

An Action is a class which can bound to a specific event. Each action class
needs to contain at least a `.run()` method. When an action relevant event is
dispatched through the context, an instance of the action class will be created
and executed. The instance of each action has access to the context and
the passed event data which triggered the execution of that action.

Action management is done by the `.actions` property of the context instance.

```javascript
import {Context} from 'pacto';

class Action {
	run() {
		console.log('I am an action', this.context, this.event);
	}
}

const context = new Context();
context.actions.add('event:type', Action);
context.trigger('event:type', {foo: 'bar'}); // logs: 'I am an action', {context}, {event}
```

Read more about the [actions API](./docs/Context.md#actions).

#### Build-in actions

Pacto offers build-in actions that help to define modules by using a configuration.

##### Initialize

The initialize action setups a module and wires a [view](#view) to a DOM element. Each
initialize action is described by its settings: `selector`, `view`, `namespace`.
The selector is a CSS valid selector to define which elements to use for each
view instance. The created view instance is grouped in a list of views
by the initialize action. This list is stored inside the context values using a
given namespace (take a look at [Values](#values)).

```javascript
// Initialize.js
import {Initialize} from 'pacto';
import {View} from 'mymodule/views/View';

export class Action extends Initialize {
	get settings() {
		return {
			selector: '.mymodule',
			namespace: 'mymodule:views'
			view: View
		};
	}
}

// App.js
import {Context} from 'pacto';
import {Action as MyModule} from 'mymodule/actions/Initialize';

const context = new Context();
context.actions.add('app:start', [
	MyModule,
	// Add more modules here...
]);
context.trigger('app:start');
```

The initialize action of pacto ships some hooks which are called while executing
and creating views. These hooks can be used by overwriting them:

* `beforeAll()`
* `beforeEach(options, el, index)`
* `afterEach(view, el, index)`
* `afterAll(views)`

`beforeAll`, `beforeEach` and `afterEach` can return `false` to skip the current
execution phase.

##### InitializeLazy

Using an app bundler like webpack, parcel or rollup allows using code splitting
by defining dynamic imports. Using them creates a smaller app build by
separating them into chunks. The InitializeLazy action of pacto offers the
possibility to simply use that feature and only load a certain module when its
corresponding element exists inside the users DOM. If at least one of these
elements is found and visible, the initialize action of that module will be
imported, instantiated and executed. Once loaded the specific action will
replace the lazy action.

![pacto app module structure with lazy initialize action](https://raw.githubusercontent.com/schorfES/pacto/master/docs/appchunk.png)

```javascript
// Initialize.js
import {Initialize} from 'pacto';
import {View} from 'mymodule/views/View';

export class Action extends Initialize {
	get settings() {
		return {
			selector: '.mymodule',
			namespace: 'mymodule:views'
			view: View
		};
	}
}

// InitializeLazy.js
import {InitializeLazy} from 'pacto';

export class Action extends InitializeLazy {
	get settings() {
		return {
			selector: '.mymodule',
		};
	}

	get import() {
		return import('mymodule/actions/Initialize');
	}
}

// App.js
import {Context} from 'pacto';
import {Action as MyLazyModule} from 'mymodule/actions/InitializeLazy';

const context = new Context();
context.actions.add('app:start', [
	MyLazyModule,
	// Add more modules here...
]);
context.trigger('app:start');
```

##### Define a custom conditon

The `InitializeLazy` action has a getter `condition` that returns a promise. It
allows customizing the load condition when executing the startup (lookup for
matching elements) process. The default implementation waits for the DOM-ready
state to be "complete" (using the `DOMContentLoaded` event to wait for).

```javascript
export class Action extends InitializeLazy {
	get settings() {
		return {
			selector: '.mymodule',
		};
	}

	get import() {
		return import('mymodule/actions/Initialize');
	}

	get condition() {
		// Not a real world example...
		return new Promise((resolve) => setTimeout(resolve, 1000));
	}
}
```

##### Handling errors

Note that due to various reasons there could be an error during the
execution of your actions. To be able to catch these you can listen
for `<action-id>:error` to get notified when an error occurs.

So in our `App.js` we can add the `app:start:error` handler to get notified:

```javascript
context.on('app:start:error', (event) => {
	const {error} = event.data;

	alert('An error while initializing the App occured.. ' + error.message);
});
```

#### Values

The `.values` property of a context instance is a key/value storage. Each
type of value can be stored using a unique namespace (key).

```javascript
import {Context} from 'pacto';

const context = new Context();
context.values.add('name:space', {foo: 'bar'});
console.log(context.values.has('name:space')); // logs: true
console.log(context.values.get('name:space')); // logs: {foo: 'bar'}

context.values.remove('name:space');
console.log(context.values.has('name:space')); // logs: false
console.log(context.values.get('name:space')); // logs: undefined
```

Read more about the [values API](./docs/Context.md#values).

### View

A view is a simple wrapper class for DOM elements. It holds the references to
its DOM element and context. An instance of this class is meant to be the
communicator between user interactions and pacto framework actions. It is also
the right place to do complex renderings using virtual DOM libraries by
overwriting the `render()` function.

```javascript
import {View} from 'pacto';

class ToggleButton extends View {
	render() {
		this.el.addEventListener('click', (event) => {
			this.el.classList.toggle('foo');
			this.context.trigger('togglebutton:toggle');
		});
	}
}
```

### EventEmitter

All objects that emit events are instances of the EventEmitter class. These
objects expose an `.on()` function that allows one or more functions to be
attached to named events emitted by the object. To remove those attached
functions the `.off()` function can be used. When a specific event is dispatched
on an EventEmitter instance, all attached functions by that event are called
synchronously.

## License

[LICENSE (MIT)](./LICENSE)
