import {EventEmitter} from './EventEmitter';


describe('The eventemitter', () => {

	let eventemitter;

	beforeEach(() => {
		eventemitter = new EventEmitter();
	});

	afterEach(() => {
		eventemitter = null;
	});

	test('.on() registers event by type and callback', () => {
		const
			type = 'test:event',
			callback = () => {}
		;

		eventemitter.on(type, callback);
	});

	test('.on() is chainable', () => {
		const
			type = 'test:event',
			callback = () => {}
		;

		expect(eventemitter.on(type, callback)).toBe(eventemitter);
	});

	test('.trigger() executes registered event callback by type', () => {
		const
			sender = eventemitter,
			type = 'test:event',
			helper = {callback: () => {}},
			spy = jest.spyOn(helper, 'callback')
		;

		eventemitter.on(type, helper.callback).trigger(type);
		expect(spy).toHaveBeenCalledWith({sender, type, data: null});
	});

	test('.trigger() executes registered event callback by type with given data', () => {
		const
			sender = eventemitter,
			type = 'test:event',
			data = {
				foo: 'bar'
			},
			helper = {callback: () => {}},
			spy = jest.spyOn(helper, 'callback')
		;

		eventemitter.on(type, helper.callback).trigger(type, data);
		expect(spy).toHaveBeenCalledWith({sender, type, data});
	});

	test('.trigger() executes all registered event callbacks by type with given data', () => {
		const
			sender = eventemitter,
			type = 'test:event',
			data = {
				foo: 'bar'
			},
			helper = {
				callbackA: () => {},
				callbackB: () => {},
				callbackC: () => {}
			},
			spyA = jest.spyOn(helper, 'callbackA'),
			spyB = jest.spyOn(helper, 'callbackB'),
			spyC = jest.spyOn(helper, 'callbackC')
		;

		eventemitter
			.on(type, helper.callbackA)
			.on(type, helper.callbackB)
			.on('other-event', helper.callbackC)
			.trigger(type, data);

		expect(spyA).toHaveBeenCalledWith({sender, type, data});
		expect(spyB).toHaveBeenCalledWith({sender, type, data});
		expect(spyC).not.toHaveBeenCalled();

	});

	test('.trigger() is chainable', () => {
		const type = 'test:event';

		expect(eventemitter.trigger(type)).toBe(eventemitter);
	});

	test('.off() removes one registered event by type and callback', () => {
		const
			type = 'test:event',
			helper = {
				callbackA: () => {},
				callbackB: () => {}
			},
			spyA = jest.spyOn(helper, 'callbackA'),
			spyB = jest.spyOn(helper, 'callbackB')
		;

		eventemitter
			.on(type, helper.callbackA)
			.on(type, helper.callbackB)
			.off(type, helper.callbackA)
			.trigger(type);

		expect(spyA).not.toHaveBeenCalled();
		expect(spyB).toHaveBeenCalledWith({
			sender: eventemitter,
			type: type,
			data: null
		});
	});

	test('.off() removes all registered events by type', () => {
		const
			type = 'test:event',
			helper = {
				callbackA: () => {},
				callbackB: () => {}
			},
			spyA = jest.spyOn(helper, 'callbackA'),
			spyB = jest.spyOn(helper, 'callbackB')
		;

		eventemitter
			.on(type, helper.callbackA)
			.on(type, helper.callbackB)
			.off(type)
			.trigger(type);

		expect(spyA).not.toHaveBeenCalled();
		expect(spyB).not.toHaveBeenCalled();
	});

	test('.off() not fails when type not registered', () => {
		eventemitter.off('not-defined');
		eventemitter.off('not-defined', () => {});
	});

	test('.off() is chainable', () => {
		const type = 'test:event';

		expect(eventemitter.off(type)).toBe(eventemitter);
	});

});
