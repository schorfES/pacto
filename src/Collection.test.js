import {Collection} from './Collection';
import {EventEmitter} from './EventEmitter';
import {Model} from './Model';


describe('The collection', () => {

	function createSpy(observe, type, handler = () => {}) {
		const
			helper = {handler},
			ref = jest.spyOn(helper, 'handler')
		;

		observe.on(type, helper.handler);
		return ref;
	}

	function expectTriggersChangeEvent(sender, method, ...args) {
		const
			type = 'change',
			spy = createSpy(sender, type)
		;

		sender.models[method].apply(sender.models, args);
		expect(spy).toHaveBeenCalledWith({sender, type, data: {method}});
	}

	let collection;

	beforeEach(() => {
		collection = new Collection();
	});

	afterEach(() => {
		collection = null;
	});

	test('inherits EventEmitter', () => {
		expect(collection).toBeInstanceOf(EventEmitter);
	});

	test('initializes with empty models', () => {
		expect(collection.models).toEqual([]);
	});

	test('initializes with passed objects', () => {
		const
			objects = [{foo: 'foo'}, {baz: 'baz'}],
			collection = new Collection(objects)
		;

		expect(collection.models).toHaveLength(2);

		expect(collection.models[0]).toBeInstanceOf(Model);
		expect(collection.models[0].props).toEqual(objects[0]);
		expect(collection.models[0].props).not.toBe(objects[0]);

		expect(collection.models[1]).toBeInstanceOf(Model);
		expect(collection.models[1].props).toEqual(objects[1]);
		expect(collection.models[1].props).not.toBe(objects[1]);
	});

	test('initializes with passed models', () => {
		const
			models = [new Model({foo: 'foo'}), new Model({baz: 'baz'})],
			collection = new Collection(models)
		;

		expect(collection.models).toHaveLength(2);

		expect(collection.models[0]).toBeInstanceOf(Model);
		expect(collection.models[0]).toBe(models[0]);

		expect(collection.models[1]).toBeInstanceOf(Model);
		expect(collection.models[1]).toBe(models[1]);
	});

	test('initializes with predefined model class', () => {
		class TestModel extends Model {
			get defaults() {
				return {bar: 'bar'};
			}
		}

		class TestCollection extends Collection {
			get Model() {
				return TestModel
			}
		}

		const
			objects = [{foo: 'foo'}, {baz: 'baz'}],
			collection = new TestCollection(objects)
		;

		expect(collection.models).toHaveLength(2);

		expect(collection.models[0]).toBeInstanceOf(TestModel);
		expect(collection.models[0].props).toEqual({foo: 'foo', bar: 'bar'});

		expect(collection.models[1]).toBeInstanceOf(TestModel);
		expect(collection.models[1].props).toEqual({bar: 'bar', baz: 'baz'});
	});

	test('.pop() method removes and returns the last model', () => {
		const
			objects = [{index: 1}, {index: 2}, {index: 3}],
			collection = new Collection(objects)
		;

		expect(collection.models.pop().props).toEqual({index: 3});
		expect(collection.models).toHaveLength(2);
	});

	test('.pop() triggers "change"', () => {
		const
			objects = [{index: 1}, {index: 2}, {index: 3}],
			collection = new Collection(objects)
		;

		expectTriggersChangeEvent(collection, 'pop');
	});

	test('.reverse() method reverses the models order', () => {
		const
			objects = [{index: 1}, {index: 2}, {index: 3}],
			collection = new Collection(objects),
			models = collection.models.concat()
		;

		collection.models.reverse();
		expect(collection.models).toEqual([].concat(models[2], models[1], models[0])); // @TODO: .toEqual isn't correct compare!
		expect(collection.models).toHaveLength(3);
	});

	test('.reverse() triggers "change"', () => {
		const
			objects = [{index: 1}, {index: 2}, {index: 3}],
			collection = new Collection(objects)
		;

		expectTriggersChangeEvent(collection, 'reverse');
	});

	test('.shift() removes and returns the first model', () => {
		const
			objects = [{index: 1}, {index: 2}, {index: 3}],
			collection = new Collection(objects)
		;

		expect(collection.models.shift().props).toEqual({index: 1});
		expect(collection.models).toHaveLength(2);
	});

	test('.shift() triggers "change"', () => {
		const
			objects = [{index: 1}, {index: 2}, {index: 3}],
			collection = new Collection(objects)
		;

		expectTriggersChangeEvent(collection, 'shift');
	});

	test('.sort() sorts the models', () => {
		const
			objects = [{index: 1}, {index: 2}, {index: 3}],
			collection = new Collection(objects),
			models = collection.models.concat()
		;

		collection.models.sort((a, b) => b.index - a.index);
		expect(collection.models).toEqual([].concat(models[2], models[1], models[0])); // @TODO: .toEqual isn't correct compare!
		expect(collection.models).toHaveLength(3);
	});

	test('.sort() triggers "change"', () => {
		const
			objects = [{index: 1}, {index: 2}, {index: 3}],
			collection = new Collection(objects)
		;

		expectTriggersChangeEvent(collection, 'sort');
	});

	test('.fill() fills the models from a start index to an end index with a new model', () => {
		const
			objects = [{index: 1}, {index: 2}, {index: 3}],
			collection = new Collection(objects)
		;

		collection.models.fill({index: 4}, 1, 3);
		expect(collection.models[0].props).toEqual({index: 1});
		expect(collection.models[1].props).toEqual({index: 4});
		expect(collection.models[2].props).toEqual({index: 4});
		expect(collection.models).toHaveLength(3);
	});

	test('.fill() adds empty models when not passing args', () => {
		const
			objects = [{index: 1}, {index: 2}, {index: 3}],
			collection = new Collection(objects)
		;

		collection.models.fill();
		expect(collection.models[0].props).toEqual({});
		expect(collection.models[1].props).toEqual({});
		expect(collection.models[2].props).toEqual({});
		expect(collection.models).toHaveLength(3);
	});

	test('.fill() triggers "change"', () => {
		const
			objects = [{index: 1}, {index: 2}, {index: 3}],
			collection = new Collection(objects)
		;

		expectTriggersChangeEvent(collection, 'fill', {index: 4}, 1, 3);
	});

	test('.push() adds one or more models to the end of the collection models and returns the new length', () => {
		const
			objects = [{index: 1}, {index: 2}, {index: 3}],
			collection = new Collection(objects),
			length = collection.models.push({index: 4}, {index: 5})
		;

		expect(collection.models[2].props).toEqual({index: 3});
		expect(collection.models[3].props).toEqual({index: 4});
		expect(collection.models[4].props).toEqual({index: 5});
		expect(collection.models).toHaveLength(5);
		expect(length).toBe(5);
	});

	test('.push() triggers "change"', () => {
		const
			objects = [{index: 1}, {index: 2}, {index: 3}],
			collection = new Collection(objects)
		;

		expectTriggersChangeEvent(collection, 'push', {index: 4}, {index: 5});
	});

	test('.unshift() adds one or more models to the beginning of the collection models and returns the new length', () => {
		const
			objects = [{index: 1}, {index: 2}, {index: 3}],
			collection = new Collection(objects),
			length = collection.models.unshift({index: 4}, {index: 5})
		;

		expect(collection.models[0].props).toEqual({index: 4});
		expect(collection.models[1].props).toEqual({index: 5});
		expect(collection.models[2].props).toEqual({index: 1});
		expect(collection.models).toHaveLength(5);
		expect(length).toBe(5);
	});

	test('.unshift() triggers "change"', () => {
		const
			objects = [{index: 1}, {index: 2}, {index: 3}],
			collection = new Collection(objects)
		;

		expectTriggersChangeEvent(collection, 'unshift', {index: 4}, {index: 5});
	});

	test('.splice() changes the contents of the collections models by removing existing models and/or adding new models', () => {
		const
			objects = [{index: 1}, {index: 3}, {index: 5}],
			collection = new Collection(objects)
		;

		collection.models.splice(1, 0, {index: 2});
		expect(collection.models[0].props).toEqual({index: 1});
		expect(collection.models[1].props).toEqual({index: 2});
		expect(collection.models[2].props).toEqual({index: 3});
		expect(collection.models[3].props).toEqual({index: 5});
		expect(collection.models).toHaveLength(4);

		collection.models.splice(3, 1, {index: 4});
		expect(collection.models[0].props).toEqual({index: 1});
		expect(collection.models[1].props).toEqual({index: 2});
		expect(collection.models[2].props).toEqual({index: 3});
		expect(collection.models[3].props).toEqual({index: 4});
		expect(collection.models).toHaveLength(4);
	});

	test('.splice() triggers "change"', () => {
		const
			objects = [{index: 1}, {index: 2}, {index: 3}],
			collection = new Collection(objects)
		;

		expectTriggersChangeEvent(collection, 'splice', 1, 0, {index: 2});
	});

});
