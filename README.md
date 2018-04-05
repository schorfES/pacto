# Pacto

[![Build Status](https://travis-ci.org/schorfES/pacto.svg?branch=master)](https://travis-ci.org/schorfES/pacto)
[![Coverage Status](https://coveralls.io/repos/github/schorfES/pacto/badge.svg?branch=master)](https://coveralls.io/github/schorfES/pacto?branch=master)

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
      - [context.actions.add(type, actions)](#contextactionsaddtype-actions)
      - [context.actions.remove(type, actions)](#contextactionsremovetype-actions)
      - [context.actions.get(type)](#contextactionsgettype)
      - [context.actions.has(type)](#contextactionshastype)
    - [Values](#values)
      - [context.values.add(key, value)](#contextvaluesaddkey-value)
      - [context.values.remove(key)](#contextvaluesremovekey)
      - [context.values.get(key)](#contextvaluesgetkey)
      - [context.values.has(key)](#contextvalueshaskey)
  - [Collection](#collection)
  - [Model](#model)
  - [EventEmitter](#eventemitter)
- [Contribution](#contribution)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Why?

There are a [lot of great frameworks](https://javascriptreport.com/the-ultimate-guide-to-javascript-frameworks/)
out there which are supposed to be used for _single page applications (SPA)_.
When using them on regular websites it's hard to apply those frameworks to an
already server side rendered DOM or to enhance certain sections with some
_interaction candy_. On the other hand the network payload to ship a SPA
framework is quiet huge when using for example only the _state management_ or
_virtual DOM_ of that framework. This may results in a higher _time to
interactive_ due to network traffic, parsing, parse, interpret and execution time.

Pacto tries to reduce those problems by shipping small features which are using
latest browser features like [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
and
[WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Weakmap).

## The Concepts

In contrast to other libraries, pacto follows the traditional approach of a MVC
framework, but only ships features for state management (Model) and application
logic (Control). It keeps the decision open for a developer which library to
choose for the view component.

The core of pacto is a context instance. This is based on a typical event bus
where events can be added, removed and triggered (pubsub pattern). The context
instance also allows to add actions to certain events. An action is
designed to hold a part of the application logic. Each time a relevant event
occurs, an added action will run to execute a logic like update a state, fetch
or recalculate data.

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

Using webpack's dynamic import feature, this boilerplate can be used to load all
required polyfills before loading and running the app:

```javascript
(function(src){
	Promise.all([
		(!!window.Proxy || import(/* webpackChunkName: "proxy-polyfill" */ 'proxy-polyfill')),
		(!!window.WeakMap || import(/* webpackChunkName: "weakmap-polyfill" */ 'weakmap-polyfill'))
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
[EventEmitter](#eventemitter) like `.on()`, `.off()` and `.dispatch()`. It also
allows to handle [Actions](#actions) and store/receive [Values](#values) in each
instance.

```javascript
import {Context} from 'pacto';

const context = new Context();
context
	.on('event:type', (event) => console.log('The event occurred.', event))
	.dispatch('event:type', {foo: 'bar'})
	.off('event:type');
```

#### Actions

An Action is a class which can bound on a specific event. Each action class
needs to contain at least a `.run()` method. When an action relevant event is
dispatched through the context, an instance of the action class will be created
and executed. The instance of each action has access to the context and
the passed event data which triggered the execution of that action.

An action can is handled using on the `.actions` property of the context instance.

```javascript
import {Context} from 'pacto';

class Action {
	run() {
		console.log('I am an action', this.context, this.event);
	}
}

const context = new Context();
context.action.add('event:type', Action);
context.dispatch('event:type', {foo: 'bar'}); // logs 'I am an action', {context}, {event}
```

##### context.actions.add(type, actions)

Adds one or more actions to a specific event type.

|name     |type                      |description          |
|---------|--------------------------|---------------------|
|`type`   |`String`                  |The name of the event|
|`actions`|`Action,[Array of Action]`|A single action class or an array of actions which should be bound to the event|

##### context.actions.remove(type, actions)

Removes all, one or more registered actions from a specific event type.

|name     |type                                |description          |
|---------|------------------------------------|---------------------|
|`type`   |`String`                            |The name of the event|
|`actions`|`undefined,Action,[Array of Action]`|A single action class or an array of actions which should be bound to the event|

##### context.actions.get(type)

Returns all registered actions from a specific event type.

|name     |type    |description          |
|---------|--------|---------------------|
|`type`   |`String`|The name of the event|

##### context.actions.has(type)

Returns `true` if at least one registered action is bound to a specific event
type, otherwise `false`.

|name     |type    |description          |
|---------|--------|---------------------|
|`type`   |`String`|The name of the event|

#### Values

##### context.values.add(key, value)

Stores a given value using a key.

|name   |type    |description                             |
|-------|--------|----------------------------------------|
|`type` |`String`|The key which is used to store the value|
|`value`|`*`     |The value to store                      |

##### context.values.remove(key)

Removes an existing value by a given key.

|name   |type    |description       |
|-------|--------|------------------|
|`type` |`String`|The key of a value|

##### context.values.get(key)

Returns an existing value by a given key.

|name   |type    |description       |
|-------|--------|------------------|
|`type` |`String`|The key of a value|

##### context.values.has(key)

Returns `true` if the given key has a stored value, otherwise `false`.

|name   |type    |description       |
|-------|--------|------------------|
|`type` |`String`|The key of a value|

### Collection

### Model

### EventEmitter

## Contribution

## License

[LICENSE (MIT)](./LICENSE)
