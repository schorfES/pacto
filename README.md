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
    - [Values](#values)
  - [Collection](#collection)
  - [Model](#model)
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

In contrast to other libraries, Pacto follows the traditional approach of a MVC
framework, but only ships features for state management (Model) and application
logic (Control). It keeps the decision open for a developer which library to
choose for the view component.

The core of Pacto is a context instance. This is based on a typical event bus
where events can be added, removed and triggered (pubsub pattern). The context
instance also allows to add actions to certain events. An action is
designed to hold a part of the application logic. Each time a relevant event
occurs, an added action will run to execute a logic like update a state, fetch
or recalculate data.

The state management in Pacto is not solved using a giant monolithic state
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
})('/path/to/app-with-pacto.js');
```

## Documentation

### Context

#### Actions

#### Values

### Collection

### Model

## Contribution

## License

[LICENSE (MIT)](./LICENSE)
