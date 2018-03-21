import {Context} from './Context';
import {EventEmitter} from './EventEmitter';


describe('The context', () => {

	let context;

	beforeEach(() => {
		context = new Context();
	});

	afterEach(() => {
		context = null;
	});

	test('inherits EventEmitter', () => {
		expect(context).toBeInstanceOf(EventEmitter);
	});

	test('exposes "actions" resolver', () => {
		expect(context.actions).toBeInstanceOf(Object);
	});

	test('exposes "values" resolver', () => {
		expect(context.values).toBeInstanceOf(Object);
	});

});


describe('The context "actions" resolver', () => {

	let executed, context;

	class ActionA {
		run() {
			executed.push(this);
		}
	}

	class ActionB extends ActionA {}
	class ActionC extends ActionA {}

	beforeEach(() => {
		executed = [];
		context = new Context();
	});

	afterEach(() => {
		executed = null;
		context = null;
	});

	test('.add() adds an action by type', () => {
		const type = 'test:event';
		context.actions.add(type, ActionA);

		expect(context.actions.get(type)).toEqual([ActionA]);
	});

	test('.add() adds multiple actions by type', () => {
		const type = 'test:event';
		context.actions.add(type, [ActionA, ActionB]);

		expect(context.actions.get(type)).toEqual([ActionA, ActionB]);
	});

	test('.add() combines multiple actions by type', () => {
		const type = 'test:event';
		context.actions.add(type, [ActionA, ActionB]).add(type, ActionC);

		expect(context.actions.get(type)).toEqual([ActionA, ActionB, ActionC]);
	});

	test('.add() is chainable', () => {
		const type = 'test:event';
		expect(context.actions.add(type, ActionA)).toBe(context.actions);
	});

	test('.has() returns boolean if has registered action by type', () => {
		const type = 'test:event';
		context.actions.add(type, ActionA);

		expect(context.actions.has(type)).toBeTruthy();
		expect(context.actions.has('not-defined')).not.toBeTruthy();
	});

	test('.get() returns a list of registerered action by type', () => {
		const type = 'test:event';
		context.actions.add(type, [ActionA, ActionB]);

		expect(context.actions.get(type)).toEqual([ActionA, ActionB]);
		expect(context.actions.get('not-defined')).toEqual(undefined);
	});

	test('.remove() removes an action by type', () => {
		const type = 'test:event';
		context.actions.add(type, [ActionA, ActionB]).remove(type, ActionA);

		expect(context.actions.get(type)).toEqual([ActionB]);
	});

	test('.remove() removes multiple actions by type', () => {
		const type = 'test:event';
		context.actions.add(type, [ActionA, ActionB]).remove(type, [ActionA, ActionB]);

		expect(context.actions.get(type)).toEqual(undefined);
	});

	test('.remove() removes all actions by type', () => {
		const type = 'test:event';
		context.actions.add(type, [ActionA, ActionB]).remove(type);

		expect(context.actions.get(type)).toEqual(undefined);
	});

	test('.remove() keeps other registered actions', () => {
		const type = 'test:event';
		context.actions
			.add(type, [ActionA, ActionB])
			.add('other:event', ActionA)
			.remove(type, [ActionA, ActionB]);

		expect(context.actions.get('other:event')).toEqual([ActionA]);
	});

	test('.remove() not change other registered actions by type when try to remove unregistered', () => {
		const type = 'test:event';
		context.actions.add(type, [ActionA, ActionB]).remove(type, ActionC);

		expect(context.actions.get(type)).toEqual([ActionA, ActionB]);
	});

	test('.remove() is chainable', () => {
		const type = 'test:event';
		context.actions
			.add(type, ActionA)
			.remove(type, ActionA)
			.remove(type, ActionB)
			.remove('not-defined', ActionA)
			.remove('not-defined', undefined);
	});

	test('instantiates and runs registered actions when event is triggered in context', () => {
		const type = 'test:event';
		context.actions.add(type, [ActionA, ActionB]).add('other:event', ActionC);
		context.trigger(type);

		expect(executed).toHaveLength(2);
		expect(executed[0]).toBeInstanceOf(ActionA);
		expect(executed[1]).toBeInstanceOf(ActionB);
	});

	test('instantiates and runs registered action with injected properties', () => {
		const
			sender = context,
			type = 'test:event',
			data = {
				foo: 'bar'
			}
		;
		context.actions.add(type, ActionA);
		context.trigger(type, data);

		expect(executed[0].context).toBe(context);
		expect(executed[0].event).toEqual({sender, type, data});
	});

	test('not runs empty actions when event is triggered in context', () => {
		const type = 'test:event';
		context.actions.add(type, ActionA).remove(type);
		context.trigger(type);

		expect(executed).toHaveLength(0);
	});

});


describe('The context "values" resolver', () => {

	let context = null;

	beforeEach(() => {
		context = new Context();
	});

	afterEach(() => {
		context = null;
	});

	test('.add() adds a value by key', () => {
		const
			key = 'key:name',
			value = 'some:value'
		;

		context.values.add(key, value);

		expect(context.values.get(key)).toBe(value);
	});

	test('.add() overwrites an existing value by key', () => {
		const
			key = 'key:name',
			value = 'some:value'
		;

		context.values.add(key, value);
		context.values.add(key, 'other:value');

		expect(context.values.get(key)).toBe('other:value');
	});

	test('.add() is chainable', () => {
		const
			key = 'key:name',
			value = 'some:value'
		;

		expect(context.values.add(key, value)).toBe(context.values);
	});

	test('.has() returns boolean if has stored value by key', () => {
		const
			key = 'key:name',
			value = 'some:value'
		;

		context.values.add(key, value);

		expect(context.values.has(key)).toBeTruthy();
		expect(context.values.has('other:key')).not.toBeTruthy();
	});

	test('.get() returns stored value by key', () => {
		const
			key = 'key:name',
			value = 'some:value'
		;

		context.values.add(key, value);

		expect(context.values.get(key)).toBe(value);
	});

	test('.remove() removes stored value by key', () => {
		const
			key = 'key:name',
			value = 'some:value'
		;

		context.values.add(key, value);
		context.values.remove(key);

		expect(context.values.has(key)).not.toBeTruthy();
		expect(context.values.get(key)).toBe(undefined);
	});

});
