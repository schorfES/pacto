export class Action {

	run() {
		const instances = this.context.values.get('module') || [];
		instances.push(this);
		this.context.values.add('module', instances);
		this.context.trigger(this.event.type + ':done');
	}

}
