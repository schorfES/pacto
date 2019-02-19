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

	describe('options', () => {

		describe('.histroy', () => {

			it('is disabled by default', () => {
				expect(context.history).toBe(null);

				context.trigger('test:event');
				context.trigger('other:test:event', {foo: 'bar'});

				expect(context.history).toBe(null);
			});

			it('saves event-history when enebaled', () => {
				context = new Context({history: true});

				expect(context.history).toEqual([]);

				context.trigger('test:event');
				context.trigger('other:test:event', {foo: 'bar'});

				expect(context.history).toEqual([
					{type: 'test:event', data: null},
					{type: 'other:test:event', data: {foo: 'bar'}},
				]);
			});

			it('can flush event-history when enabled', () => {
				context = new Context({history: true});
				context.trigger('test:event');
				context.trigger('other:test:event', {foo: 'bar'});
				context.flushHistory();

				expect(context.history).toEqual([]);
			});

		});

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

	test('.remove() removes all equal actions by type', () => {
		const type = 'test:event';
		context.actions.add(type, [ActionA, ActionA, ActionB, ActionA]).remove(type, ActionA);

		expect(context.actions.get(type)).toEqual([ActionB]);
	});

	test('.remove() removes multiple actions by type', () => {
		const type = 'test:event';
		context.actions.add(type, [ActionA, ActionB, ActionA]).remove(type, [ActionA, ActionB]);

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

	test('.add() adds a value by namespace', () => {
		const
			namespace = 'name:space',
			value = 'some:value'
		;

		context.values.add(namespace, value);

		expect(context.values.get(namespace)).toBe(value);
	});

	test('.add() overwrites an existing value by namespace', () => {
		const
			namespace = 'name:space',
			value = 'some:value'
		;

		context.values.add(namespace, value);
		context.values.add(namespace, 'other:value');

		expect(context.values.get(namespace)).toBe('other:value');
	});

	test('.add() is chainable', () => {
		const
			namespace = 'name:space',
			value = 'some:value'
		;

		expect(context.values.add(namespace, value)).toBe(context.values);
	});

	test('.has() returns boolean if has stored value by namespace', () => {
		const
			namespace = 'name:space',
			value = 'some:value'
		;

		context.values.add(namespace, value);

		expect(context.values.has(namespace)).toBeTruthy();
		expect(context.values.has('other:namespace')).not.toBeTruthy();
	});

	test('.get() returns stored value by namespace', () => {
		const
			namespace = 'name:space',
			value = 'some:value'
		;

		context.values.add(namespace, value);

		expect(context.values.get(namespace)).toBe(value);
	});

	test('.remove() removes stored value by namespace', () => {
		const
			namespace = 'name:space',
			value = 'some:value'
		;

		context.values.add(namespace, value);
		context.values.remove(namespace);

		expect(context.values.has(namespace)).not.toBeTruthy();
		expect(context.values.get(namespace)).toBe(undefined);
	});

});
