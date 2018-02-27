# lil'MC

## Possible names

* aliud => different
* ???

## Examples

### Context

```javascript
import {Context} from 'lilMC';


// Setup actions:
class SomeAction {
	run() {
		console.log('Run some action');
	}
}

class SomeOtherAction {
	run() {
		console.log('Run some other action');
	}
}

// Setup context:
const context = new Context();

// Handle actions
context.actions
	.add('some:event', SomeAction)
	.add('some:other:event', |SomeAction, SomeOtherAction])
	.remove('older:event');

// Handle values
context.values
	.add('some:value', 1)
	.add('some:other:value', {foo: 'bar'});

// Trigger actions
context.trigger('some:event');
```

### Model
```javascript
import {Model} from 'lilMC';


const model = new Model({
	foo: 1,
	bar: 'baz'
});

model.on('change', (event) => {
	console.log('Model changed: ', event.sender.props); // logs: 2
});
console.log(model.props); // logs: 1

model.props = 2;
```

### Collection
```javascript
import {Collection} from 'lilMC';


const collection = new Collection([
	{foo: 'foo'},
	{bar: 'bar'}
]);

collection.on('change', (event) => {
	console.log('Collection changed: ', event.sender.models); // logs: [{foo: 'foo'}]
});
console.log(collection.models); // logs: [{foo: 'foo'}, {bar: 'bar'}]

collection.models.pop();
```
