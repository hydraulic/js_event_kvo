# js_event_kvo

A KVO data binding and event notification tool implemented in JavaScript. It's not limited to the UI layer. With JavaScript becoming increasingly engineered, a simple, reliable event and data binding framework is needed for logic-level use independent of the UI.

The core of both is the event-dispatcher class, which serves as a dispatch center. Within this center is a map of connections, keyed by action (i.e., event name). Each key has a receiverList attached to it.

The receiver structure:
```
receiver = {
func: func, // Method to receive the event
context: context, // Class to which the event belongs
async: false // Whether to notify asynchronously. In JavaScript, asynchronous notification means notifying on the next tick. The message loop mechanism in JavaScript and Android is similar, except that multithreading is generally not used.
}
```

There are three key methods:
1. addBinding(action, Receiver) — listens for events, with deduplication implemented to prevent duplicate bindings from being called multiple times.

2. removeBinding(action, receiver);
3. dispatchEvent(action, data) — action is the event identifier, data is the parameters of the event being notified.

This architecture isn't a one-size-fits-all approach, but rather a single responsibility. One advantage is that it makes it easy to create an event center or multiple dispatch centers, for example, to separate common business events from network events.

## Event devent

devent is an example of a business dispatch center. It builds on the event-dispatcher with a simple encapsulation and some automatic binding logic. Automatic binding is performed based on the event name.

## kvo
The KVO implementation is slightly more involved. KVO is a data class with the following structure:
``` javascript
kvo = {
originObj: The actual data structure to be monitored;
dispatcher: An instance of the event-dispatcher dispatch center;
originObj-key1: The rest is done by adding the property names of the original data structure to the KVO instance through defineProperty. The specific implementation is shown in the figure below. originObj-key2:
originObj-key...:
}
```

![img.png](img.png)

This way, each property name in KVO naturally serves as an event key. When a property value is updated, notification is sent through the event dispatcher, achieving our goal.

Here comes the question:
1. What if the names of the originObj and dispatcher properties in KVO overlap with the original property?

As a TODO, my current idea is to create a global auto-incrementing sequence_hash value of the original data structure_originObj type as the originObj property name in the KVO class.

## Summary
There are two possible implementation paths for runtime data notifications:
1. The iOS KVO approach uses the data structure to be monitored as the center, with each property as the key.
2. Wrap each property to be monitored in a separate layer, using it as a dispatch center, like Android's LiveData.