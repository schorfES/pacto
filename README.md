# lil'MC

## Examples

### Context

```javascript
import {Context} from 'lilMC';

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

### Collection
```javascript
import {Collection} from 'lilMC';

const collection = new Collection({
	foo: 1,
	bar: 'baz'
});

collection.on('change', (event) => {
	console.log('Collection changed: ', event.sender.models); // logs: 2
});
console.log(collection.models); // logs: 1

collection.models = 2;
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
