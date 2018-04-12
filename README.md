# Pacto

[![Build Status](https://travis-ci.org/schorfES/pacto.svg?branch=master)](https://travis-ci.org/schorfES/pacto)
[![Coverage Status on Coveralls](https://coveralls.io/repos/github/schorfES/pacto/badge.svg?branch=master)](https://coveralls.io/github/schorfES/pacto?branch=master)
[![Coverage Status on Codecov](https://codecov.io/gh/schorfES/pacto/branch/master/graph/badge.svg)](https://codecov.io/gh/schorfES/pacto)

A lightweight framework for non SPA websites.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Why?](#why)
- [The Concepts](#the-concepts)
- [Installation](#installation)
- [Requirements](#requirements)
- [Documentation](#documentation)
  - [Context](#context)
    - [Actions](#actions)
      - [Initialize](#initialize)
      - [InitializeLazy](#initializelazy)
    - [Values](#values)
  - [Model](#model)
  - [Collection](#collection)
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
latest browser features like [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy),
[IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver) and
[WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Weakmap).

## The Concepts

In contrast to other libraries, pacto follows the traditional approach of an MVC
framework. The core of pacto is a context instance. This is based on a typical
event bus where events can be added, removed and triggered (pubsub pattern). The
context instance also allows adding actions to certain events. An action is
designed to hold a part of the application logic. Each time a relevant event
occurs, an added action will run to execute a logic like to update a state, to
fetch or to recalculate data.

These actions allow creating modules. Each module should contain at least one
initialize action but can be composed of multiple actions, models, collections,
services view etc. This initialize action is meant to be the entry point of each
module. It setups and executes its module:

@TODO: Insert diagram of the module structure

The state management in pacto is not solved using a giant monolithic state
object. It comes with classic _backbone inspired_ model and collection classes.
Instances of them or any other object can be stored and accessed through the
context like a simple key/value store.

## Installation

Pacto is available on [NPM](https://www.npmjs.com/package/pacto):

```bash
npm install pacto --save
```

## Requirements

Pacto is _dependency free_, but it requires latest browser features.
So you may need to add a polyfill for [WeakMap](https://www.npmjs.com/package/weakmap-polyfill).
When using pacto's [Collection](#collection) or [Model](#model) you may also
need a polyfill for [Proxy](https://www.npmjs.com/package/proxy-polyfill).
When using [InitializeLazy](#initializelazy) you can also add a polyfill for
[IntersectionObserver](https://www.npmjs.com/package/intersection-observer).

Using dynamic imports, this boilerplate can be used to load all required
polyfills before loading and running the app:

```javascript
(function(src){
	Promise.all([
		(!!window.WeakMap || import('weakmap-polyfill')),
		(!!window.Proxy || import('proxy-polyfill')),
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
context.action.add('event:type', Action);
context.trigger('event:type', {foo: 'bar'}); // logs: 'I am an action', {context}, {event}
```

Read more about the [actions API](./docs/Context.md#actions).

##### Initialize

@TODO: Add documentation

##### InitializeLazy

@TODO: Add documentation

#### Values

The `.values` property of a context instance is a key/value storage. Each
type of value can be stored using a unique key.

```javascript
import {Context} from 'pacto';

const context = new Context();
context.values.add('key:name', {foo: 'bar'});
console.log(context.values.has('key:name')); // logs: true
console.log(context.values.get('key:name')); // logs: {foo: 'bar'}

context.values.remove('key:name');
console.log(context.values.has('key:name')); // logs: false
console.log(context.values.get('key:name')); // logs: undefined
```

Read more about the [values API](./docs/Context.md#values).

### Model

A model is an observed object. It detects changes to its properties and
dispatches a `'change'` event. All properties of a model instance are accessible
through the `.props` property.

```javascript
import {Model} from 'pacto';

const data = {foo: 'bar'};
const model = new Model(data);

model.on('change', () => console.log(model.props)); // logs: {foo: 'baz'}
model.props.foo = 'baz';
```

A model can be created using defaults for its properties. If one or more of
these properties are not passed into the model, the model will use the
predefined default values until the value will be set.

```javascript
import {Model} from 'pacto';

class MyModel extends Model {
	get defaults() {
		return {foo: 'foo', baz: 'baz'};
	}
}

const data = {foo: 'bar'};
const model = new MyModel(data);
console.log(model.props); // logs: {foo: 'bar', baz: 'baz'}
```

### Collection

A collection is an observed array of [Models](#model). These models are
accessible through the `.models` property. This property offers all
[array functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array).
When one of these functions changes the array, the collection instance
dispatches a `'change'` event.

All items which are passed into the collection will be transformed into a
[Model](#model). Which type of Model should be used is defined in the `.Model`
getter of a Collection instance.

```javascript
import {Collection, Model} from 'pacto';

class MyModel extends Model {
	get defaults() {
		return {foo: 'foo', baz: 'baz'};
	}
}

class MyCollection extends Collection {
	get Model() {
		return MyModel;
	}
}

const collection = new MyCollection([{foo: 'bar'}]);
collection.on('change', () => console.log(collection.models)); // logs: [{foo: 'bar', baz: 'baz'}, {foo: 'foo', baz: 'bar'}]
collection.models.push({baz: 'bar'});
```

### View

@TODO: Add documentation

### EventEmitter

All objects that emit events are instances of the EventEmitter class. These
objects expose an `.on()` function that allows one or more functions to be
attached to named events emitted by the object. To remove those attached
functions the `.off()` function can be used. When a specific event is dispatched
on an EventEmitter instance, all attached functions by that event are called
synchronously.

## License

[LICENSE (MIT)](./LICENSE)
