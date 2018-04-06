# Context

## Actions

### context.actions.add(type, actions)

Adds one or more actions to a specific event type.

|name     |type               |description          |
|---------|-------------------|---------------------|
|`type`   |`String`           |The name of the event|
|`actions`|`Action`           |A single action class which should be bound to an event|
|`actions`|`[Array of Action]`|An array of action classed which should be bound to an event|

### context.actions.remove(type, actions)

Removes all, one or more registered actions from a specific event type.

|name     |type               |description          |
|---------|-------------------|---------------------|
|`type`   |`String`           |The name of the event|
|`actions`|`undefined`        |When passing no value, all registered actions are removed|
|`actions`|`Action`           |All actions of this type are removed|
|`actions`|`[Array of Action]`|All actions of those types are removed|

### context.actions.get(type)

Returns all registered actions from a specific event type.

|name     |type    |description          |
|---------|--------|---------------------|
|`type`   |`String`|The name of the event|

### context.actions.has(type)

Returns `true` if at least one registered action is bound to a specific event
type, otherwise `false`.

|name     |type    |description          |
|---------|--------|---------------------|
|`type`   |`String`|The name of the event|


## Values

### context.values.add(key, value)

Stores a given value using a key.

|name   |type    |description                             |
|-------|--------|----------------------------------------|
|`type` |`String`|The key which is used to store the value|
|`value`|`*`     |The value to store                      |

### context.values.remove(key)

Removes an existing value by a given key.

|name   |type    |description       |
|-------|--------|------------------|
|`type` |`String`|The key of a value|

### context.values.get(key)

Returns an existing value by a given key.

|name   |type    |description       |
|-------|--------|------------------|
|`type` |`String`|The key of a value|

### context.values.has(key)

Returns `true` if the given key has a stored value, otherwise `false`.

|name   |type    |description       |
|-------|--------|------------------|
|`type` |`String`|The key of a value|
